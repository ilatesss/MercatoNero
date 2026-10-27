"""Test UI reale. Richiede Playwright Python e Chromium del sistema.
Avviare prima: python3 -m http.server 8000 --bind 127.0.0.1
Eseguire: python3 tests/browser_smoke.py
"""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = os.environ.get('MERCATO_TEST_URL', 'http://127.0.0.1:8000')
ROOT = Path(__file__).resolve().parents[1]

with sync_playwright() as pw:
    browser = pw.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox'])
    context = browser.new_context(viewport={'width': 1440, 'height': 1050})
    page = context.new_page()
    errors, external = [], []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.on('request', lambda req: external.append(req.url) if req.url.startswith(('http:', 'https:')) and not req.url.startswith(BASE) else None)
    page.clock.install()
    page.goto(BASE)
    page.evaluate('navigator.serviceWorker.ready')
    page.wait_for_function('navigator.serviceWorker.controller !== null')
    page.screenshot(path=str(ROOT / 'docs' / 'anteprima-desktop.png'), full_page=True)
    page.get_by_role('button', name='Come si gioca').click()
    assert page.locator('#help').is_visible()
    page.locator('#help [data-close]').click()
    page.get_by_role('button', name='Le carte').click()
    assert page.locator('#catalog-content .object-card').count() == 30
    assert page.locator('#catalog-content .hand-card').count() == 42
    assert page.locator('#catalog-content .role-print').count() == 6
    page.pdf(path=str(ROOT / 'docs' / 'Carte-playtest.pdf'), format='A4', print_background=True)
    page.locator('#catalog [data-close]').click()
    page.set_viewport_size({'width': 390, 'height': 844})
    page.clock.run_for(200)
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'Overflow home mobile'
    page.screenshot(path=str(ROOT / 'docs' / 'anteprima-mobile.png'), full_page=True)
    page.set_viewport_size({'width': 1440, 'height': 1050})
    page.get_by_role('button', name='Apri il mercato').click()
    page.screenshot(path=str(ROOT / 'docs' / 'anteprima-tavolo.png'), full_page=True)
    context.set_offline(True)
    page.reload()
    page.get_by_role('button', name='Riprendi la partita salvata').click()
    page.locator('#uncover').click()
    phases = set()
    for step in range(1000):
        state = json.loads(page.evaluate("localStorage.getItem('mercatonero-game-v1')"))
        phase = state['phase']
        phases.add(phase)
        if phase == 'over':
            break
        if state['players'][state['actor']]['bot']:
            page.clock.run_for(400)
            continue
        if page.locator('#uncover').count():
            page.locator('#uncover').click()
        if phase == 'bid':
            ids = [c['id'] for c in state['players'][state['actor']]['hand'][:2]]
            for card in ids:
                page.locator(f'[data-card="{card}"]').click()
            target = next(i for i in range(len(state['players'])) if i != state['actor'])
            page.locator('#target').select_option(str(target))
            page.locator('[data-action="bid"]').click()
        elif phase in ('fairy', 'alchemist'):
            page.locator('[data-action="skip"]').click()
        elif phase == 'choose':
            page.locator('[data-object]').first.click()
            page.locator('[data-action="choose"]').click()
        elif phase == 'raid':
            if state['players'][state['actor']]['stash']:
                if page.locator('[data-own]').count():
                    page.locator('[data-own]').first.click()
                page.locator('[data-action="confiscate"]').click()
            else:
                cards = page.locator('[data-card]')
                if cards.count() >= 3:
                    ids = cards.evaluate_all('(els)=>els.slice(0,3).map(e=>e.dataset.card)')
                    for card in ids:
                        page.locator(f'[data-card="{card}"]').click()
                    page.locator('[data-action="bribe"]').click()
                else:
                    page.locator('[data-action="confiscate"]').click()
        elif phase == 'thief':
            page.locator('[data-action="steal"]').click()
        elif phase == 'end':
            page.locator('[data-action="done"]').click()
        elif phase == 'draw':
            page.locator('[data-action="draw-coin"]').click()
        elif phase == 'trim':
            ids = page.locator('[data-card]').evaluate_all('(els,n)=>els.slice(0,n).map(e=>e.dataset.card)',len(state['players'][state['actor']]['hand'])-8)
            for card in ids:
                page.locator(f'[data-card="{card}"]').click()
            page.locator('[data-action="trim"]').click()
        else:
            raise AssertionError(phase)
        assert not page.locator('#toast').inner_text(), page.locator('#toast').inner_text()
    else:
        raise AssertionError('Partita UI bloccata')
    assert page.locator('.results').is_visible()
    assert state['round'] == 5
    page.reload()
    page.get_by_role('button', name='Riprendi la partita salvata').click()
    assert page.locator('.results').is_visible(), 'Risultati non ripristinati offline'
    # Seconda partita: mani nascoste e layout a sei giocatori sul telefono.
    page.get_by_role('button', name='Un’altra notte').click()
    page.locator('#count').select_option('6')
    page.locator('#mode').select_option('local')
    page.get_by_role('button', name='Apri il mercato').click()
    assert page.locator('[data-card]').count() == 0, 'Mano visibile prima del passaggio'
    page.locator('#uncover').click()
    assert page.locator('[data-card]').count() == 7
    page.set_viewport_size({'width': 390, 'height': 844})
    page.clock.run_for(200)
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'Overflow tavolo mobile'
    page.screenshot(path=str(ROOT / 'docs' / 'anteprima-tavolo-mobile.png'), full_page=True)
    page.locator('[data-action="bid"]').click()
    assert page.locator('[data-card]').count() == 0, 'La mano precedente non è stata nascosta'
    assert page.locator('#uncover').is_visible()
    assert errors == [], errors
    assert external == [], external
    print(json.dumps({'passed': True, 'offline_reload': True, 'offline_full_game': True, 'local_privacy': True, 'mobile_no_overflow': True, 'catalog_cards': 78, 'phases_seen': sorted(phases), 'javascript_errors': errors, 'external_requests': external}, indent=2))
    browser.close()
