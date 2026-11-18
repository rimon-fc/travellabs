#!/usr/bin/env python3
"""Build a static GitHub Pages site while retaining original source filenames."""
from pathlib import Path, PurePosixPath
from urllib.parse import urlsplit, unquote, quote
import argparse
import html
import json
import posixpath
import re
import shutil

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'site'
OUTPUT = ROOT / 'dist'
BRIEF = 'travellabs-rd-brief-v13 (Business opportunities and launch plan).html'
PLAN = 'business-opportunities-and-launch-plan.html'
BUSINESSES = [
    ('keel-cloud', 'Keel Cloud', 'startup-sites/keel-github.html'),
    ('atfgraph-cloud', 'ATFGraph Cloud', 'startup-sites/atfgraph-github.html'),
    ('ctx-travel', 'ctx.travel', 'startup-sites/ctx-travel/index.html'),
    ('mcpx-travel', 'mcpx.travel', 'startup-sites/mcpx-travel/index.html'),
    ('agentic-tms-crm', 'Agentic TMS-CRM', 'startup-sites/agentic-tms/index.html'),
    ('portal', 'Portal', 'startup-sites/portal-booking/index.html'),
    ('visa-clearance', 'Visa clearance', 'startup-sites/visa-clearance/index.html'),
    ('adn-exchange', 'ADN + Exchange', 'startup-sites/adn-exchange/index.html'),
    ('voice-concierge', 'Voice & Concierge', 'startup-sites/voice-concierge/index.html'),
]
FOLDERS = {str(PurePosixPath(source).parent): 'startups/' + slug for slug, _, source in BUSINESSES if source.endswith('/index.html')}
FOLDERS['startup-sites/shared'] = 'startups/shared'
EXACT = {BRIEF: PLAN, **{source: f'startups/{slug}/index.html' for slug, _, source in BUSINESSES}}
ATTR = re.compile(r'(?P<key>\b(?:href|src|action|poster|data-url))(?P<eq>\s*=\s*)(?P<q>[\"\'])(?P<url>.*?)(?P=q)', re.S)
CSS_URL = re.compile(r'url\(\s*([\"\']?)([^)\"\']+)\1\s*\)')


def destination(source):
    if source in EXACT:
        return EXACT[source]
    for folder, target in FOLDERS.items():
        if source.startswith(folder + '/'):
            return target + source[len(folder):]
    return source


def rewrite_url(value, source, output):
    raw = html.unescape(value)
    if not raw or raw.startswith(('#', '//')):
        return value
    u = urlsplit(raw)
    if u.scheme or not u.path or u.path.startswith('/'):
        return value
    target = posixpath.normpath(posixpath.join(posixpath.dirname(source), unquote(u.path)))
    if not (SOURCE / target).exists():
        return value
    dest = destination(target)
    if dest.endswith('/index.html'):
        dest = dest[:-len('index.html')]
    elif dest == 'index.html':
        dest = './'
    relative = posixpath.relpath(dest, posixpath.dirname(output) or '.')
    if dest.endswith('/'):
        relative = './' if relative == '.' else relative + '/'
    return quote(relative, safe='/.-_~') + (('?' + u.query) if u.query else '') + (('#' + u.fragment) if u.fragment else '')


def redirect(target, title):
    # Relative targets work under both /travellabs/ and local preview prefixes.
    return ('<!doctype html><html lang="en"><head><meta charset="utf-8">'
            '<meta name="viewport" content="width=device-width,initial-scale=1">'
            f'<meta http-equiv="refresh" content="0;url={html.escape(target, quote=True)}">'
            f'<title>{html.escape(title)} — Travellabs</title>'
            f'<script>location.replace({json.dumps(target)}+location.search+location.hash);</script>'
            f'</head><body><p><a href="{html.escape(target, quote=True)}">Open {html.escape(title)}</a></p></body></html>')


def add_plan_navigation(text, source):
    if source == BRIEF:
        text = text.replace('<div class="navlinks">', '<div class="navlinks"><a href="index.html">TravelLabs website ↗</a>', 1)
        return text
    if source.startswith('startup-sites/'):
        return text
    def insert(match):
        nav = match.group()
        if PLAN in nav or '>Businesses</a>' not in nav:
            return nav
        return re.sub(r'(<a\b[^>]*>Businesses</a>)', lambda m: m.group() + f'<a href="{PLAN}">Launch plan</a>', nav, count=1)
    return re.sub(r'<(?:header|footer)\b[^>]*>.*?</(?:header|footer)>', insert, text, flags=re.S)


def build():
    if OUTPUT.exists():
        shutil.rmtree(OUTPUT)
    OUTPUT.mkdir()
    emitted = set()
    for path in sorted(SOURCE.rglob('*')):
        if not path.is_file():
            continue
        relative = path.relative_to(SOURCE).as_posix()
        if any(part.startswith('.') for part in path.relative_to(SOURCE).parts) or path.name.lower().startswith('readme'):
            continue
        dest = destination(relative)
        if dest in emitted:
            raise ValueError(f'Duplicate output route: {dest}')
        emitted.add(dest)
        output = OUTPUT / dest
        output.parent.mkdir(parents=True, exist_ok=True)
        if path.suffix not in ('.html', '.css', '.js', '.json', '.svg'):
            shutil.copy2(path, output)
            continue
        text = path.read_text()
        if path.suffix == '.html':
            text = add_plan_navigation(text, relative)
        if path.suffix in ('.html', '.svg', '.js'):
            text = ATTR.sub(lambda m: m['key'] + m['eq'] + m['q'] + rewrite_url(m['url'], relative, dest) + m['q'], text)
        if path.suffix in ('.css', '.html', '.svg'):
            text = CSS_URL.sub(lambda m: 'url(' + m[1] + rewrite_url(m[2], relative, dest) + m[1] + ')', text)
        if relative == 'assets/startups-data.json':
            records = json.loads(text)
            for record in records:
                record['url'] = rewrite_url(record['url'], 'businesses.html', 'businesses.html')
            text = json.dumps(records, ensure_ascii=False, indent=2) + '\n'
        if relative == 'startup-sites/shared/preview.js':
            text = text.replace("location.pathname.endsWith('keel-github.html')", "location.pathname.includes('/keel-cloud/')")
            text = text.replace("location.pathname.endsWith('atfgraph-github.html')", "location.pathname.includes('/atfgraph-cloud/')")
        if relative == 'assets/mobile-navigation.css':
            text = text.replace('(max-width:1100px)', '(max-width:1200px)')
        output.write_text(text)
    for slug, name, _ in BUSINESSES:
        (OUTPUT / 'startups' / (slug + '.html')).write_text(redirect(slug + '/', name))
    # The original brief filename remains in source; its public address is separate.
    (OUTPUT / '.nojekyll').write_text('')
    route_map = {'umbrella':'/', 'businesses':'/businesses.html', 'launch_plan':'/' + PLAN,
                 'business_pages':[{'name': name, 'route': f'/startups/{slug}/', 'html_alias': f'/startups/{slug}.html', 'source': source} for slug, name, source in BUSINESSES]}
    (ROOT / 'routes.json').write_text(json.dumps(route_map, indent=2) + '\n')
    print(f'Built {len(emitted)} source files and {len(BUSINESSES)} route aliases in {OUTPUT}')


if __name__ == '__main__':
    build()
