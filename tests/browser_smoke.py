"""Test UI del regolamento PDF. Avviare prima il server locale.
MERCATO_TEST_URL può indicare una porta alternativa.
"""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE=os.environ.get('MERCATO_TEST_URL','http://127.0.0.1:8000').rstrip('/')
ROOT=Path(__file__).resolve().parents[1]
KEY='mercatonero-game-v3'

with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
    context=browser.new_context(viewport={'width':1440,'height':1050},color_scheme='light')
    page=context.new_page()
    errors,external,phases=[],[],set()
    page.on('pageerror',lambda error:errors.append(str(error)))
    page.on('request',lambda req:external.append(req.url) if req.url.startswith(('http:','https:')) and not req.url.startswith(BASE) else None)
    page.clock.install()
    page.goto(BASE)
    page.evaluate('navigator.serviceWorker.ready')
    page.wait_for_function('navigator.serviceWorker.controller !== null')
    assert page.locator('#difficulty').input_value()=='easy'
    assert '5 ROUND' in page.locator('main').inner_text()
    page.screenshot(path=str(ROOT/'docs/anteprima-desktop.png'),full_page=True)
    page.get_by_role('button',name='Tema scuro',exact=True).click()
    page.reload()
    assert page.locator('html').get_attribute('data-theme')=='dark'
    page.screenshot(path=str(ROOT/'docs/anteprima-scura.png'),full_page=True)
    page.get_by_role('button',name='Tema chiaro',exact=True).click()
    page.get_by_role('button',name='Come si gioca').click()
    assert '24 Trucchi' in page.locator('#help').inner_text()
    assert 'Tutti scartano' in page.locator('#help').inner_text()
    assert page.locator('#help a[href="docs/Regolamento-0.5.pdf"]').count()==1
    page.locator('#help [data-close]').click()
    page.get_by_role('button',name='Le carte').click()
    assert page.locator('#catalog .object-card').count()==36
    assert page.locator('#catalog .hand-card.trick').count()==24
    assert page.locator('#catalog .hand-card.blank').count()==18
    assert page.locator('#catalog .hand-card').count()==72
    assert page.locator('#catalog .role-print').count()==6
    assert page.locator('.sweets-preview').count()==0
    page.emulate_media(media='print')
    page.pdf(path=str(ROOT/'docs/Carte-playtest.pdf'),format='A4',print_background=True)
    page.emulate_media(media='screen')
    page.locator('#catalog [data-close]').click()
    page.set_viewport_size({'width':390,'height':844});page.clock.run_for(200)
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    page.screenshot(path=str(ROOT/'docs/anteprima-mobile.png'),full_page=True)
    page.set_viewport_size({'width':1440,'height':1050})
    page.locator('#count').select_option('4')
    page.get_by_role('button',name='Apri il mercato').click()
    assert page.locator('.white-reserve [data-card]').count()==3
    assert page.locator('.market .original-art image').count()==3
    page.screenshot(path=str(ROOT/'docs/anteprima-tavolo.png'),full_page=True)
    page.locator('#suggest-bid').click();assert page.locator('.hand-card.selected').count()==2
    before=page.evaluate(f'localStorage.getItem("{KEY}")')
    page.get_by_role('button',name='Tema scuro',exact=True).click()
    assert page.evaluate(f'localStorage.getItem("{KEY}")')==before
    page.screenshot(path=str(ROOT/'docs/anteprima-tavolo-scuro.png'),full_page=True)
    page.set_viewport_size({'width':390,'height':844});page.clock.run_for(200)
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    page.screenshot(path=str(ROOT/'docs/anteprima-scura-mobile.png'),full_page=True)
    page.set_viewport_size({'width':1440,'height':1050})
    page.get_by_role('button',name='Tema chiaro',exact=True).click()
    context.set_offline(True);page.reload()
    page.get_by_role('button',name='Riprendi la partita salvata').click()

    def state():
        return json.loads(page.evaluate(f'localStorage.getItem("{KEY}")'))

    def uncover():
        if page.locator('#uncover').count():page.locator('#uncover').click()

    def step_ui(s):
        phase=s['phase'];phases.add(phase);p=s['players'][s['actor']]
        if p['bot']:
            page.clock.run_for(400);return
        uncover()
        if phase=='bid':
            page.locator('#suggest-bid').click();page.locator('[data-action="bid"]').click()
        elif phase=='fairy':page.locator('[data-action="skip"]').click()
        elif phase=='trick':
            kind=s['effect']['card']['kind']
            if kind in ('smoke','curse'):
                target=next(i for i in range(len(s['players'])) if i!=s['actor'])
                page.locator('#target').select_option(str(target))
            elif kind=='whisper':page.locator('[data-object]').first.click()
            page.locator('[data-action="resolve"]').click()
        elif phase=='alchemist':page.locator('[data-action="skip"]').click()
        elif phase=='choose':
            page.locator('[data-object]').first.click();page.locator('[data-action="choose"]').click()
        elif phase=='thief':page.locator('[data-action="steal"]').click()
        elif phase=='raid':
            if p['stash']:
                if page.locator('[data-own]').count():page.locator('[data-own]').first.click()
                page.locator('[data-action="confiscate"]').click()
            elif len(p['hand'])>=3:
                for c in p['hand'][:3]:page.locator(f'[data-card="{c["id"]}"]').click()
                page.locator('[data-action="bribe"]').click()
            else:page.locator('[data-action="confiscate"]').click()
        elif phase=='end':
            assert page.locator('[data-action="wash"]').count()==0
            triple=next(([o['id'] for o in p['stash'] if o['family']==f][:3] for f in {o['family'] for o in p['stash']} if sum(o['family']==f for o in p['stash'])>=3),None)
            if triple:
                page.locator('#suggest-set').click();page.locator('[data-action="smuggle"]').click()
            else:page.locator('[data-action="done"]').click()
        elif phase=='draw':
            buttons=[page.locator('[data-action="draw-coin"]'),page.locator('[data-action="draw-trick"]')]
            chosen=next((b for b in buttons if b.is_enabled()),None)
            if chosen is not None:chosen.click()
            else:page.locator('[data-action="skip-draw"]').click()
        elif phase=='trim':
            for c in p['hand'][:len(p['hand'])-8]:page.locator(f'[data-card="{c["id"]}"]').click()
            page.locator('[data-action="trim"]').click()
        else:raise AssertionError(phase)
        assert page.locator('#toast').inner_text()=='',page.locator('#toast').inner_text()

    for _ in range(2000):
        s=state()
        if s['phase']=='over':break
        step_ui(s)
    else:raise AssertionError('Partita UI bloccata')
    assert s['round']==5 and s['finishReason']=='five-rounds'
    assert page.locator('.results').is_visible()
    offline=page.evaluate("""async()=>Promise.all([...Object.values(MercatoArt.objects),...Object.values(MercatoArt.roles),MercatoArt.caravan,'docs/Regolamento-0.5.pdf'].map(async url=>(await fetch(url)).ok))""")
    assert all(offline)
    page.reload();page.get_by_role('button',name='Riprendi la partita salvata').click();assert page.locator('.results').is_visible()
    # Mani private e Bianche: anche a sei giocatori il banco espone 5 Oggetti.
    page.get_by_role('button',name='Un’altra notte').click();page.locator('#mode').select_option('local');page.locator('#count').select_option('6');page.get_by_role('button',name='Apri il mercato').click()
    assert page.locator('[data-card]').count()==0
    uncover();assert page.locator('[data-card]').count()==10;assert page.locator('.market .object-card').count()==5
    page.set_viewport_size({'width':390,'height':844});page.clock.run_for(200)
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    page.screenshot(path=str(ROOT/'docs/anteprima-tavolo-mobile.png'),full_page=True)
    page.locator('[data-action="pass"]').click();assert page.locator('[data-card]').count()==0
    assert state()['bids'][0][0]['kind']=='blank'
    assert page.locator('.covered-bid .money-back').count()==1
    assert page.locator('.covered-bid .trick-back').count()==0
    # Fata + Fumo + Soffiata + Raddoppio + Maledizione: controlli reali mirati.
    context.set_offline(False)
    page.evaluate("""() => {
      const g=new Mercato.Game({count:3,seed:7,mode:'local'});
      const t=kind=>({...Mercato.TRICKS.find(t=>t.kind===kind),id:kind});
      g.players.forEach(p=>p.role='witch');g.players[0].role='fairy';
      g.players[0].hand=[{id:'a',kind:'coin',name:'Moneta',value:4},t('smoke'),t('whisper'),t('double')];
      g.players[1].hand=[{id:'b',kind:'coin',name:'Moneta',value:2},t('curse')];g.players[2].hand=[];
      g.act('bid',{ids:['a','smoke','whisper']});g.act('bid',{ids:['b','curse']});g.act('bid',{ids:[g.players[2].blanks[0].id]});
      localStorage.setItem('mercatonero-game-v3',JSON.stringify(g));localStorage.setItem('mercatonero-game-v2','precedente da conservare');
    }""")
    page.reload();assert 'vecchio salvataggio' in page.locator('main').inner_text();page.get_by_role('button',name='Riprendi la partita salvata').click();uncover()
    page.locator('[data-card="double"]').click();page.locator('[data-action="fairy"]').click()
    seen=set()
    for _ in range(80):
        s=state()
        if s['phase']=='end':break
        if s['phase']=='trick':seen.add(s['effect']['card']['kind'])
        step_ui(s)
    assert seen=={'smoke','whisper','double','curse'},seen
    assert state()['paymentComplete'] is True
    assert page.evaluate("localStorage.getItem('mercatonero-game-v2')")=='precedente da conservare'
    assert errors==[],errors
    assert external==[],external
    print(json.dumps({'passed':True,'rules':'PDF 0.5','offline_full_game_and_reload':True,'original_artwork_and_pdf_offline':True,'catalog_cards':114,'white_reserve':True,'interactive_tricks':sorted(seen),'phases_seen':sorted(phases),'javascript_errors':errors,'external_requests':external},indent=2))
    browser.close()
