# ATP — the Agentic Travel Protocol extension

> **ALPHA.** ATP is an implementation of a **draft spec (v0.3)**. The protocol
> surface, field names, and error codes may change between releases. The
> manifest pins the targeted protocol version (`atp.version: "0.3"`), and
> `keel seams` reports exactly which ATP rails are real, guarded, or absent in
> your build.

**What this gives you.** Enable one manifest block and your agent grows a
complete, auditable travel-booking lifecycle: a token-free `atp_SearchOffers`
op, token-gated hold/commit/cancel ops, a multi-supplier **TripTransaction
saga** that compensates in reverse order on any partial failure, a scoped-JWT
**TravellerToken** consent model with a single-use commit gate, MCP-backed
**supplier adapters** with honest capability declarations (L1/L2/L3
conformance tiers), PII redaction over booking payloads, and a hash-chained
audit trail for every state transition. Payments ride alongside (see
[payments.md](payments.md)) and the policy engine enforces business rules over
every booking call (see [policy-engine.md](policy-engine.md)).

## Enabling ATP

ATP ships as the `keel.ext.atp` extension. The extra installs no additional
dependencies — it is the supported way to opt into the surface:

```bash
pip install "keel[atp]"
```

Then turn it on in `agent.yaml`. ATP is **off by default**: without
`atp.enabled: true` the harness registers nothing and your manifest behaves
exactly as before.

```yaml
apiVersion: keel/v1
name: travel-agent

servers:
  flights:
    type: http
    url: http://127.0.0.1:8011/mcp
    conformance_tier: L2

atp:
  enabled: true
  version: "0.3"
  suppliers:
    sabre:
      server: flights          # foreign key into servers:
      conformance_tier: L2
      ops:
        search: sabre_search_flights_roundtrip
        hold: sabre_hold
```

When enabled, five `atp_*` meta-tools register on the server (FastMCP tool
names cannot contain `:`, so the logical `atp:Xxx` op becomes the wire name
`atp_Xxx`).

## The booking lifecycle

The logical supplier ops are `search` / `quote` / `hold` / `commit` /
`cancel`. On the wire, a booking walks:

| Wire tool | Logical op | Token scope | What it does |
|---|---|---|---|
| `atp_SearchOffers` | `atp:SearchOffers` | none (token-free) | Search supplier inventory; offers normalized into the ATP offer shape. |
| `atp_CreateTripTransaction` | `atp:CreateTripTransaction` | `hold` | Open a multi-supplier saga transaction (`OPEN`). |
| `atp_CreateReservation` | `atp:CreateReservation` | `hold` | Add one `HELD` leg (flight / hotel / activity) to the transaction. Returned as an MCP resource (`application/atp-reservation+json`). |
| `atp_CommitTripTransaction` | `atp:CommitTripTransaction` | `commit` | Atomically confirm all legs (consent-gated, see below). |
| `atp_CancelReservation` | `atp:CancelReservation` | `cancel` | Compensating cancel of one leg. |

The reservation FSM (one per leg) is:

```
 [SEARCHING] ──► [HELD] ───────► [CONFIRMED] ──► [COMPLETED]
                   │  TTL expires        │
                   ▼                     │ CancelReservation()
               [EXPIRED]                 ▼
                                    [CANCELLED]  ◄── [COMPENSATING]
```

Illegal transitions are rejected; holds carry a TTL and an elapsed hold raises
`ATP_HOLD_EXPIRED`.

## TravellerToken

Every transaction/itinerary op is gated by a **TravellerToken**: a signed JWT
issued by the traveller's IdP that grants the agent *scoped* authority. The
validator enforces, in order:

1. **Signed** — signature, `exp`, issuer, and audience are verified against
   the configured JWKS (or a public key).
2. **Time-limited** — the token's own lifetime (`exp - iat`) must not exceed
   `max_ttl` (capped at 24h; the configured value is clamped to that ceiling).
3. **Scoped** — the op's required scope must be a subset of the token's
   `atp.scope` claim (`ATP_TOKEN_INSUFFICIENT_SCOPE` otherwise).
4. **Amount-bounded** — a commit total must not exceed `atp.max_trip_value`
   (`ATP_TOKEN_AMOUNT_EXCEEDED` otherwise).
5. **Single-use for commit** — a `commit`-scoped token is recorded as spent
   (by `jti`, or a SHA-256 of the raw token) in a durable SQLite store; a
   replayed commit token is refused with `ATP_CONSENT_REQUIRED`.

Configure the verification material in the manifest:

```yaml
atp:
  enabled: true
  traveller_token:
    issuer: https://idp.example.com
    jwks_uri: https://idp.example.com/.well-known/jwks.json
    max_ttl: 86400          # seconds; values above 24h are clamped
```

Environment fallbacks mirror the auth engine's conventions:
`ATP_TOKEN_ISSUER`, `ATP_JWKS_URI` (or `JWKS_URI`), `ATP_TOKEN_PUBLIC_KEY`,
`ATP_TOKEN_AUDIENCE`. With **no** verification material configured the token
gate is open (offline / standalone posture) — production deployments should
always configure an issuer.

### The optional `ap2_mandate` claim

A TravellerToken may carry an `ap2_mandate` claim (an object of payment-mandate
constraints — scope and a `max_trip_value` / `max_amount` cap). When the
token's claims are published into the session policy facts, the policy engine
enforces the mandate cap and scope as implicit deny rules before every
`atp_*` booking tool — see
[policy-engine.md](policy-engine.md#ap2-mandate-enforcement). A present but
malformed (non-object) claim is rejected with `ATP_CONSENT_REQUIRED`.

## Consent: the commit gate

`atp_CommitTripTransaction` is human-in-the-loop. Consent is a **stage
prerequisite**: the harness declares a `consent` construct (default JSON
Schema: an object with a required `approvedBy`) gating the ATP `commit`
stage. A commit passes when either:

* the call carries an explicit consent argument
  (`consent` / `consent_signal` / `consentToken` / `consent_token`), or
* the session state already satisfies the `consent` construct — set it with
  the `state_set` meta-tool: `state_set("consent", {"approvedBy": "jane"})`.

Otherwise the commit is refused with the **prerequisite refusal payload**,
carrying the protocol code `ATP_CONSENT_REQUIRED` (-32107) in `data`:

```json
{
  "error": "KEEL_PREREQUISITES_UNMET",
  "code": -32107,
  "stage": "commit",
  "missing_prerequisites": [
    {"name": "consent", "schema_summary": "...", "from": "consent"}
  ]
}
```

The caller satisfies the named construct via `state_set` and retries. A
manifest may declare its own `consent` construct under `constructs:` to
tighten the schema — an explicit declaration wins over the harness default.
As defence-in-depth, a validator interceptor (`atp_consent_gate`) on the
shared interceptor chain enforces the same gate before the call ever reaches
the saga, and a mutator interceptor (`atp_pii_redactor`) redacts the
configured PII paths:

```yaml
atp:
  guardrails:
    pii_fields: [passengerDetails.passportNumber, travellerToken]
    audit_all_transitions: true     # default: every FSM/saga transition audited
```

## Supplier bindings

`atp.suppliers` binds each logical supplier to an upstream MCP server from
your `servers:` block (the binding's `server` key is validated as a foreign
key). Each binding maps the logical ops to real upstream tool names and may
carry `defaults` merged under every mapped-op call (explicit arguments win):

```yaml
servers:
  flights:
    type: http
    url: http://127.0.0.1:8011/mcp
    conformance_tier: L1
  hotels:
    type: http
    url: http://127.0.0.1:8010/mcp
    conformance_tier: L1

atp:
  enabled: true
  suppliers:
    sabre:
      server: flights
      conformance_tier: L1
      ops:
        search: sabre_search_flights_roundtrip
    ean:
      server: hotels
      conformance_tier: L1
      ops:
        search: ean_hotel_search
        quote: ean_room_availability
      defaults:
        currency: AUD
```

When at least one binding maps an op, the saga's supplier dispatch routes
through `MCPSupplierAdapter` instances — every call goes through
`gateway.call_tool` on the wire name `{server}__{tool}`, the same
gateway/interceptor path as any other upstream call. Responses are normalized
into the ATP offer shape by a pluggable normalizer; the default stamps the
supplier name on every offer and preserves the raw payload verbatim under
`source` (nothing invented, nothing lost). Servers without a binding fall
back to the raw dispatch path unchanged.

### Conformance tiers and capability honesty

Tiers follow the spec's ladder — **L1 (Search)**, **L2 (Hold)**, **L3
(Atomic commit)** — with a minimum tier per op: `search`/`quote` at L1,
`hold`/`cancel` at L2, `commit` at L3.

An op with no mapped tool is **declared absent** — never faked:

* **At or above the supplier's tier**, an unmapped op is a configuration gap.
  The adapter raises the honest envelope (JSON-RPC code `-32601`, method not
  found):

  ```json
  {
    "code": "ATP_OP_NOT_SUPPORTED",
    "supplier": "sabre",
    "op": "hold",
    "conformance_tier": "L2",
    "seam": "atp.suppliers",
    "guard": "map atp.suppliers.sabre.ops.hold to an upstream tool"
  }
  ```

* **Below the supplier's tier** (a sub-L3 supplier asked for a booking-shaped
  `hold`/`commit`/`cancel`), the **coordinator owns the op centrally** as an
  internal record: `coordinatorOwned: true`, `supplierConfirmed: false`, the
  honest envelope riding under `notSupported`, and an audit transition whose
  detail clearly says coordinator-owned. The coordinator never pretends a
  supplier confirmed anything.

`harness.supplier_capabilities()` reports the full per-supplier picture —
tier plus, for every logical op, `{mapped, tool, min_tier,
coordinator_owned}`. The distribution engine derives UCP capability
declarations from these same mappings (see
[distribution-and-post-booking.md](distribution-and-post-booking.md)).

### Live supplier testing

The offline suite never touches the network. A live integration test exists
behind an explicit guard — start your supplier MCP stack, then:

```bash
export KEEL_LIVE_SUPPLIERS=1
PYTHONPATH=. python3 -m pytest tests/test_atp_suppliers_live.py -q
```

The test binds real flights/hotels MCP servers (default
`http://127.0.0.1:8011/mcp` and `http://127.0.0.1:8010/mcp`) as L1 suppliers
and asserts live payloads normalize into the ATP offer shape. Without the env
var it skips cleanly.

## The TripTransaction saga

Commit is owned by a saga coordinator — deliberately a coroutine with an
explicit try/except unwind, not a flow graph, so a raising confirm can never
abort the compensation:

```
CreateTripTransaction()  ->  [OPEN]
    add legs via CreateReservation()        (each -> HELD)
CommitTripTransaction()  ->  [COMMITTING]
    confirm per leg, in order
      all ok   ->  [CONFIRMED]
      any fail ->  [COMPENSATING]
                      cancel confirmed legs, in REVERSE order
                   ->  [CANCELLED]   (raises ATP_COMMIT_PARTIAL_FAILURE)
```

When a tasks engine is wired, the commit runs as a **durable task** —
pollable, restart-surviving. On partial failure the raised
`ATP_COMMIT_PARTIAL_FAILURE` (-32105) carries the **full transaction** in
`data`: per-leg status showing exactly which legs confirmed, failed, or
compensated. When the consumer payment rail is configured with
`capture_on: commit`, the capture runs exactly once before the final
confirm — a capture failure unwinds the confirmed legs through the same
compensation path (see [payments.md](payments.md)).

### Chaos-tested invariants

The saga is exercised by a failure-injection harness (`tests/test_atp_chaos.py`)
that injects failures at **every** leg-confirm position and **every**
compensation position (including compensation-also-fails) for multi-leg trips,
asserting:

* the transaction always lands in a terminal state — `CONFIRMED` or
  `CANCELLED`;
* once `CANCELLED`, no leg is left `CONFIRMED` (or stuck `COMPENSATING`)
  unless a compensation-failure audit record exists for it;
* compensation runs strictly in reverse leg order;
* every observed transition is written to the hash-chained audit log, every
  per-leg transition path is legal per the reservation FSM, and the chain's
  `verify()` passes.

## Audit

With `atp.guardrails.audit_all_transitions: true` (the default), every
FSM/saga transition is recorded twice: as an immutable observability
`ExecutionRecord` (kind `atp_transition`) and as an append to the
hash-chained `keel.audit` sink — the `observability.audit_sink` instance when
configured, else a default sink honouring `KEEL_AUDIT_DB`. The booking trail
is tamper-evident.

## ATP error codes

| Code | Name | Meaning |
|---|---|---|
| -32100 | `ATP_INVENTORY_GONE` | Option no longer available since search. |
| -32101 | `ATP_HOLD_EXPIRED` | Hold TTL elapsed; create the reservation again. |
| -32102 | `ATP_PRICE_CHANGED` | Price changed since pricing. |
| -32103 | `ATP_TOKEN_INSUFFICIENT_SCOPE` | TravellerToken missing a required scope. |
| -32104 | `ATP_TOKEN_AMOUNT_EXCEEDED` | Total exceeds the token's `max_trip_value`. |
| -32105 | `ATP_COMMIT_PARTIAL_FAILURE` | Some legs confirmed; compensation fired. |
| -32106 | `ATP_SUPPLIER_UNAVAILABLE` | Supplier timeout / unreachable. |
| -32107 | `ATP_CONSENT_REQUIRED` | Operation requires explicit consent. |
| -32108 | `ATP_LOYALTY_INVALID` | Loyalty number rejected by the supplier. |
| -32109 | `ATP_DOCUMENT_NOT_READY` | Confirmed but document not yet issued. |

## See also

* [payments.md](payments.md) — PaymentInstruction, consumer capture, virtual
  cards, margin, reconciliation.
* [policy-engine.md](policy-engine.md) — business rules over every tool call,
  including the implicit AP2 mandate rules for `atp_*` tools.
* [distribution-and-post-booking.md](distribution-and-post-booking.md) — UCP
  capability declarations derived from your supplier bindings, and order
  servicing after commit.
