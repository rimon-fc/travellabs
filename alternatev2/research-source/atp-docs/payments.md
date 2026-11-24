# Payments — consumer capture, virtual cards, margin, reconciliation

**What this gives you.** The money side of the [ATP](atp.md) booking
lifecycle. Once the saga holds and confirms reservations, *someone has to
pay — twice*: the traveller pays the agent (the **consumer rail**: ACP
checkout or an internal capture) and the agent pays the supplier (the
**supplier rail**: a single-use virtual card, BSP settlement, or a direct
transfer). The spread between the two is the **margin**, which is published
as policy facts so a margin-floor rule can block an unprofitable commit (see
[policy-engine.md](policy-engine.md)). Every payment state transition is
persisted and appended to a hash-chained audit trail, ending in a
reconciliation record that ties PNR, booking reference, and virtual-card
reference together.

## Configuration

The payment engine reads `atp.payment`:

```yaml
atp:
  enabled: true
  payment:
    # Consumer rail (traveller -> agent)
    consumer:
      provider: acp                  # acp | visa_tap | internal
      acp_checkout_url: https://checkout.example.com/atp
      product_schema: atp.itinerary  # default when unset
      capture_on: commit             # commit | hold
    # Supplier rail (agent -> supplier)
    supplier:
      provider: virtual_card         # virtual_card | visa_tap_b2b | mpp
      virtual_card:
        issuer: https://issuer.example.com/cards
        validity_days: 21
        single_use: true
    # Margin (gross - cost) feeding the policy engine
    margin:
      floor_pct: 5.0
      audit: true
```

Every rail is **guarded**: a rail with no configured endpoint returns a
structured envelope — never a fake success. `keel seams` shows the live
state of each rail in your build.

## PaymentInstruction — the unit of record

One `PaymentInstruction` is built per reservation leg and persisted via the
shared StateStore spine (key `atp:payment:instruction:<id>`). Its wire form:

```json
{
  "paymentInstructionId": "pi_0001",
  "reservationId": "res_0001",
  "tripTransactionId": "txn_0001",
  "consumer_payment": {
    "provider": "acp",
    "payment_intent_id": null,
    "amount": {"amount": 750.0, "currency": "AUD"},
    "status": "PENDING",
    "captured_at": null
  },
  "supplier_payment": {
    "merchant_of_record": "agent",
    "method": "virtual_card",
    "virtual_card": {
      "ref": "vc_res_0001",
      "last4": "0000",
      "valid_from": 1760000000.0,
      "valid_to": 1761814400.0,
      "single_use": true,
      "amount_ceiling": {"amount": 600.0, "currency": "AUD"}
    },
    "settlement": {
      "mechanism": "virtual_card",
      "expected_at": null,
      "reference": null
    }
  },
  "margin": {"gross": 750.0, "cost": 600.0, "net": 150.0, "pct": 20.0},
  "reconciliation": {
    "pnr": "ABC123",
    "booking_ref": "SUP-9911",
    "virtual_card_ref": "vc_res_0001",
    "consultant_id": null,
    "branch_code": null
  },
  "status": "ISSUED",
  "audit": {"transitions": [{"from": "DRAFT", "to": "ISSUED", "at": 1760000000.0, "reason": "build:ota"}]}
}
```

`status` walks **DRAFT → ISSUED → CAPTURED → SETTLED → RECONCILED** (FAILED
from anywhere). Every transition appends to the per-instruction
`audit.transitions` history *and* writes through to the hash-chained audit
sink (kind `atp_payment`).

## Consumer capture (traveller → agent)

`capture_consumer_payment` captures the traveller's funds for a
TripTransaction:

* **`provider: acp`** — POSTs to `consumer.acp_checkout_url` carrying the
  payment intent, the amount, and the ATP itinerary as a **structured product
  payload** (`{"product": {"schema": <consumer.product_schema>, "itinerary":
  {...}}}`; the schema name defaults to `atp.itinerary`). No checkout URL
  configured → the guarded envelope
  `{"code": "KEEL_PAYMENT_NOT_CONFIGURED", "seam": "atp.payment.consumer",
  "guard": "acp_checkout_url"}`.
* **`provider: internal`** — records a real capture on the agent's own
  ledger; nothing external is called and no guard applies.
* **`provider: visa_tap`** — declared in the manifest enum but with no live
  rail behind it yet: returns the `KEEL_CONTRACT_ONLY` envelope, never a
  pretend capture.

### `capture_on: commit`

With `consumer.capture_on: commit` (the default) the saga captures consumer
funds **exactly once per commit, before the final confirm**. A capture
failure — a raised error *or* a guarded envelope (a rail that cannot run for
real) — unwinds the already-confirmed legs through the standard compensation
path, with `captureFailedAt`/`captureError` recorded on the transaction
audit. A commit never pretends funds were captured.

### Idempotency

Captures are idempotent per payment intent: a StateStore guard at
`atp:payment:capture:<intent>` means the same intent is never captured
twice. A retry returns the previously recorded capture with
`"replayed": true`. The intent id is the explicit `payment_intent_id`, the
transaction's `payment_token`, or a derived `intent_<txn_id>`.

## Supplier side (agent → supplier)

### Merchant-of-record routing

`build_payment_instruction` routes each leg by its distribution channel:

| Leg channel | Merchant of record | Method | Settlement mechanism |
|---|---|---|---|
| `AIRLINE_DIRECT` | airline | `bsp` | `bsp` |
| `OTA` | agent | `virtual_card` | `virtual_card` |
| `SUPPLIER_DIRECT` | supplier | `direct` | `direct_transfer` |

The channel is read from the reservation (`channel`, `segment.channel`, or
`supplier.channel`); anything unknown defaults to `SUPPLIER_DIRECT` — the
most conservative rail (pay the supplier directly, no card issued).
Settlement timing lives on the instruction's
`supplier_payment.settlement` block (`mechanism` / `expected_at` /
`reference`): BSP legs settle on the BSP calendar, virtual-card legs settle
when the supplier charges the card, direct legs on transfer.

### Virtual cards

For `OTA` legs the engine issues a single-use virtual card by POSTing to
`atp.payment.supplier.virtual_card.issuer`:

* the card's **`amount_ceiling` is the supplier cost** (`pricing.cost`,
  falling back to `pricing.total`) — never the gross. The agent's margin is
  not exposed to the supplier rail;
* validity runs `validity_days` from issuance (default 21);
* `single_use` (default `true`) is forwarded verbatim;
* the card ref lands in both `supplier_payment.virtual_card.ref` and
  `reconciliation.virtual_card_ref`.

With **no issuer configured**, issuance returns the
`KEEL_PAYMENT_NOT_CONFIGURED` envelope (seam `atp.payment.supplier`, guard
`virtual_card.issuer`) — and an OTA leg refuses to build a card-less
instruction: the envelope is returned as-is instead of a fake instruction.
Transport failures and non-2xx responses raise `PaymentError` naming the
endpoint and status.

### MPP — explicit contract-only

`register_mpp_intent` is an explicit guarded no-op: the MPP standard is not
yet live, so there is nothing real to call. It returns the envelope
`{"code": "KEEL_CONTRACT_ONLY", "seam": "atp.payment.mpp", "guard": "MPP
standard not yet live"}` and audits the attempt — never a silent success.

## Margin → policy facts

`compute_margin` computes `gross − cost = net` (and `pct`) per instruction
and publishes the facts `{"margin_pct", "total_amount"}` under the StateStore
key `margin_calculator` — a policy **context provider** name. A manifest that
lists it gets the live margin merged into every policy evaluation, and
`atp.payment.margin.floor_pct` is automatically surfaced as
`rules.min_margin_pct`:

```yaml
atp:
  enabled: true
  payment:
    margin:
      floor_pct: 5.0

policies:
  engine: yaml_rules
  context_providers: [margin_calculator]
  rules:
    - id: margin_floor
      "on": [atp_CommitTripTransaction]
      when: facts.margin_pct < rules.min_margin_pct
      action: deny
      error_code: POLICY_MARGIN_FLOOR
```

When the margin cannot be verified (no priced itinerary yet, provider
absent), the deny rule **fails closed** — the commit is refused rather than
letting an unprofitable booking through. See
[policy-engine.md](policy-engine.md) for the full failure semantics.
`margin.calculator_flow` may name a flow that computes/overrides the margin;
`margin.audit: true` (default) writes every margin computation into the audit
chain.

## Reconciliation chain

`emit_reconciliation_event` closes the loop for one instruction:

1. writes an observability `ExecutionRecord` (kind `atp_payment`, name
   `reconciliation`) when an observability engine is wired;
2. appends a `kind="atp_reconciliation"` record to the hash-chained audit
   sink carrying the reconciliation block — `pnr`, `booking_ref`,
   `virtual_card_ref`, `consultant_id`, `branch_code`;
3. transitions the instruction to `RECONCILED` (itself audited).

Back-office reconciliation can therefore tie each consumer capture to its
supplier settlement and verify the whole trail with the audit chain's
`verify()` — nothing in the chain can be silently rewritten.

## See also

* [atp.md](atp.md) — the booking lifecycle this engine pays for.
* [policy-engine.md](policy-engine.md) — margin floors and AP2 mandate caps
  as enforced rules.
* [distribution-and-post-booking.md](distribution-and-post-booking.md) — the
  consumer payment provider and `capture_on` are advertised in the UCP
  product schema.
