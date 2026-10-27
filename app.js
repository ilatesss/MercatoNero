/* Nessun fetch, CDN, font remoto o account: funziona anche con file://. */
(() => {
  'use strict';
  const {Game,FAMILIES,OBJECTS,TRICKS,ROLES}=Mercato;
  const $=s=>document.querySelector(s), app=$('#app'), KEY='mercatonero-game-v1';
  let game=null,selected=[],cargo=[],own=null,chosen=null,target=null,revealed=false,saveOK=true,botTimer=null;
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function icon(type){
    const paths={
      mirror:'<path d="M39 67h22l5 18H34z"/><ellipse cx="50" cy="34" rx="26" ry="30"/><ellipse cx="50" cy="34" rx="19" ry="23"/><path d="m40 29 14-12M45 40l16-15M32 87h36"/>',
      lamp:'<path d="M30 73h40M37 84h26M45 62v11h10V62M30 44c-12-27 10-39 20-39s32 12 20 39L59 61H41zM37 47h26M40 54h20M50 3V0M18 17l-9-5M82 17l9-5M13 40H2M87 40h11"/>',
      bottle:'<path d="M40 6h20v10H40zM43 16v20L20 70q-8 18 10 19h40q18-1 10-19L57 36V16M29 63h42M38 75l4 3M58 70l7 6"/><circle cx="49" cy="51" r="3"/><path d="m38 6 2-5h20l2 5"/>',
      cat:'<path d="m29 37-5-28 24 15h5L76 9l-5 28q16 20-1 40-18 18-39 0-17-19-2-40zM36 47h5M59 47h5M46 59h8l-4 5zM50 64v6M40 70q10 8 20 0M20 57 4 53M20 64 3 66M80 57l16-4M80 64l17 2"/>',
      book:'<path d="M49 21Q30 8 7 14v61q24-6 42 7 19-13 43-7V14q-24-6-43 7v61M15 23q17-3 27 4M15 34q17-3 27 4M15 45q17-3 27 4M60 26l13 4 5 12-9 10-12-5zM61 61h22M2 20v62q25-6 47 6 22-12 48-6V20"/>'
    };
    return `<svg viewBox="0 0 100 100" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${paths[type]||paths.mirror}</svg>`;
  }
  const apple='<svg class="apple-icon" viewBox="0 0 20 22" aria-hidden="true"><path d="M10 7C3 2 0 9 3 16s6 4 7 4 4 3 7-4 0-14-7-9Z" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M10 8V4m0 0c0-3 3-3 5-3-1 3-3 4-5 3Z" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';
  function objectCard(o,interactive=false){const f=FAMILIES.find(f=>f.id===o.family),tag=interactive?'button':'article';return `<${tag} class="object-card ${chosen===o.id?'selected':''}" style="--family:${f.color}" ${interactive?`data-object="${o.id}" aria-pressed="${chosen===o.id}" aria-label="${esc(o.name)}, valore ${o.value}, ${o.apples} Mele, Famiglia ${f.id}"`:''}>
    <div class="card-top"><span class="card-value">${o.value}</span><span class="family-badge"><i>${f.shape}</i> ${f.id}</span><span class="card-value">${o.value}</span></div><div class="card-art">${icon(f.icon)}</div><h3 class="card-name">${esc(o.name)}</h3><p class="card-joke">${esc(o.joke)}</p><div class="card-bottom"><span>${f.shape} ${f.id} · ${esc(f.name.split(' ')[0])}</span><span aria-label="${o.apples} Mele">${o.apples?apple.repeat(o.apples):'∅'} ${o.apples} ${o.apples===1?'Mela':'Mele'}</span></div><div class="card-mirror" aria-hidden="true">${o.value} · ${o.apples} ${apple} · ${f.shape}</div></${tag}>`;}
  function handCard(c,interactive=true){const trick=c.kind!=='coin',tag=interactive?'button':'article';return `<${tag} class="hand-card ${trick?'trick':''} ${selected.includes(c.id)?'selected':''}" ${interactive?`data-card="${esc(c.id)}" aria-pressed="${selected.includes(c.id)}"`:''}><span class="hand-value">${c.value}</span><span class="hand-name">${esc(c.name)}</span>${trick?`<span class="hand-text">${esc(c.text)}</span>`:''}<span class="hand-dots" aria-label="${c.value} punti">${'•'.repeat(c.value)}${trick?' ✦':''}</span><span class="hand-mirror" aria-hidden="true">${c.value} · ${'•'.repeat(c.value)}</span></${tag}>`;}
  function notice(message){$('#toast').textContent=message;setTimeout(()=>$('#toast').textContent='',4500);}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(game));saveOK=true;}catch(e){saveOK=false;}}
  function hasSave(){try{return !!localStorage.getItem(KEY);}catch{return false;}}
  function resetSelection(){selected=[];cargo=[];own=null;chosen=null;target=null;}
  function landing(){clearTimeout(botTimer);game=null;app.innerHTML=`<section class="hero"><div><span class="eyebrow">SOTTO IL PONTE DEI TRE CAPRONI</span><h1>Il Mercato Nero<br>delle <em>Fiabe.</em></h1><p class="hero-intro">Il lieto fine è finito. Gli affari, no.<br>Compra magia difettosa, inganna le Guardie e porta il tuo bottino al sicuro. Prima della retata.</p><span class="eyebrow" style="letter-spacing:1px;margin-top:26px">3–6 GIOCATORI &nbsp; / &nbsp; 5 ROUND &nbsp; / &nbsp; 20–30 MIN AL TAVOLO</span></div><div class="hero-art" aria-label="Tre carte del mercato"><div class="orbit"></div>${objectCard(OBJECTS[14])}${objectCard(OBJECTS[27])}${objectCard(OBJECTS[3])}<span class="art-caption">MAGIA USATA. NESSUN RIMBORSO.</span></div></section>
    <section class="setup"><div><span class="eyebrow">IL TAVOLO È PRONTO</span><h2>Entra nel mercato.</h2><p class="muted" style="font-size:12px;margin:0">Niente account. Niente connessione.</p></div><form id="setup" class="setup-form"><label class="field">Giocatori<select id="count"><option value="3">3 giocatori</option><option value="4" selected>4 giocatori</option><option value="5">5 giocatori</option><option value="6">6 giocatori</option></select></label><label class="field">Modalità<select id="mode"><option value="solo">Tu + avversari automatici</option><option value="local">Tutti sullo stesso dispositivo</option></select></label><button class="button" type="submit">Apri il mercato <span>→</span></button></form></section>
    ${hasSave()?'<div class="start-actions" style="max-width:1224px;margin:0 auto 32px;padding:0 24px"><button class="button secondary" id="resume">Riprendi la partita salvata →</button></div>':''}
    <section class="intro-notes"><article><b>01</b><div><h3>Punta nell’ombra.</h3><p>Un’asta segreta, fino a tre carte. Solo chi compra paga il prezzo.</p></div></article><article><b>02</b><div><h3>Non dare nell’occhio.</h3><p>Più vale il bottino, più attira le Guardie. A sei Mele scatta la Retata.</p></div></article><article><b>03</b><div><h3>Salva la tua fiaba.</h3><p>Tre oggetti della stessa Famiglia nella Carovana: valore raddoppiato.</p></div></article></section>`;
    $('#setup').onsubmit=e=>{e.preventDefault();game=new Game({count:Number($('#count').value),mode:$('#mode').value});revealed=game.mode==='solo';resetSelection();save();render();};
    if($('#resume'))$('#resume').onclick=()=>{try{game=Game.restore(JSON.parse(localStorage.getItem(KEY)));revealed=false;resetSelection();render();}catch{notice('Salvataggio non leggibile. Puoi iniziare una nuova partita.');}};
  }
  const phaseNames={bid:'Asta segreta',fairy:'La Fata interviene',alchemist:'Scambio dell’Alchimista',choose:'Scelta degli oggetti',raid:'Retata!',thief:'Il Ladro interviene',end:'Azioni di fine round',draw:'Pesca di fine round',trim:'Limite della mano'};
  function playerStrip(){return `<section class="players" style="--players:${game.players.length}" aria-label="Giocatori">${game.players.map((p,i)=>`<article class="player ${game.actor===i?'current':''}"><div class="player-name">${esc(p.name)} ${i===game.dealer?'<span>MAZZIERE</span>':''}</div><div class="player-role" title="${esc(ROLES.find(r=>r.id===p.role).name)}">${p.used?'◌':'✦'} ${esc(ROLES.find(r=>r.id===p.role).name)}</div><div class="suspicion ${p.suspicion>=4?'wanted':''}" aria-hidden="true">${Array.from({length:6},(_,n)=>`<span class="${n<p.suspicion?'filled':''}"></span>`).join('')}</div><div class="player-meta"><span>${p.suspicion}/6 · ${p.suspicion>=6?'Retata':p.suspicion>=4?'Ricercato':'Anonimo'}</span><span>${p.stash.length+p.caravan.length} ogg. · ${p.hand.length} carte</span></div></article>`).join('')}</section>`;}
  function collections(){return `<details class="collection"><summary>Le collezioni · informazioni pubbliche</summary><div class="collection-grid">${game.players.map((p,i)=>`<article><h3>${esc(p.name)}</h3><span class="eyebrow" style="font-size:9px;letter-spacing:1px">MERCE ESPOSTA</span>${p.stash.map(o=>`<div class="mini-object"><span>${FAMILIES.find(f=>f.id===o.family).shape} ${o.family} · ${esc(o.name)}</span><strong>${o.value}</strong></div>`).join('')||'<p class="muted">Nessun oggetto.</p>'}<span class="eyebrow" style="font-size:9px;letter-spacing:1px;margin-top:15px">CAROVANA · VALORE ×2</span>${p.caravan.map(o=>`<div class="mini-object"><span>${o.family} · ${esc(o.name)}</span><strong>${o.value} ×2</strong></div>`).join('')||'<p class="muted">Nessun set al sicuro.</p>'}<p class="score-note">Punteggio attuale: ${game.score(i)} (inclusa eventuale penalità).</p></article>`).join('')}</div></details>`;}
  function revealBids(){if(['bid'].includes(game.phase))return '';return `<div class="reveal" aria-label="Puntate rivelate">${(game.ranking||game.rank()).map(i=>`<div class="bid-result">${esc(game.players[i].name)}<strong>${game.total(i)}</strong><small>${game.bids[i].map(c=>`${esc(c.name)} ${c.value}${game.cancelled.includes(c.id)?' (annullata)':''}`).join(', ')||'Passa'}</small></div>`).join('')}</div>`;}
  function targetSelect(){return `<label>Bersaglio dei Trucchi<select id="target"><option value="">Scegli un avversario</option>${game.players.map((p,i)=>i===game.actor?'':`<option value="${i}" ${target===i?'selected':''}>${esc(p.name)}</option>`).join('')}</select></label>`;}
  function rolePanel(){const p=game.players[game.actor],r=ROLES.find(r=>r.id===p.role);return `<div class="role-box"><span class="eyebrow">IL RUOLO DI ${esc(p.name)}</span><h3>${r.name}</h3><p>${r.text}</p><span class="card-label">${p.used?'◌ Potere già usato':'✦ Una volta per partita'}${p.copied?' · Copia attiva: '+ROLES.find(r=>r.id===p.copied).name:''}</span>${!p.bot&&game.phase==='bid'&&game.power(game.actor)==='apprentice'&&!p.used?`<div style="margin-top:12px"><label class="card-label" for="copy-target">Ruolo da copiare</label><select id="copy-target">${game.players.map((q,j)=>j===game.actor?'':`<option value="${j}">${esc(q.name)} · ${ROLES.find(r=>r.id===q.role).name}</option>`).join('')}</select><button class="button secondary" data-action="copy" style="margin-top:8px;width:100%">Copia il potere</button></div>`:''}</div>`;}
  function actionPanel(){
    const p=game.players[game.actor],power=game.power(game.actor),phase=game.phase;
    let description='',body='',actions='',cards=[];
    if(phase==='bid'){
      description='Scegli da 0 a 3 carte. Gli avversari automatici non leggono la tua mano o la tua puntata.';cards=p.hand;
      const total=selected.reduce((n,id)=>{const c=game.card(game.actor,id);return n+(c?.kind==='double'?2:c?.value||0);},0);
      actions=`${targetSelect()}<button class="button" data-action="bid">${selected.length?`Conferma ${total} punti · ${selected.length}/3 carte`:'Passa · 0 carte'}</button>`;
    }
    if(phase==='fairy'){
      description='Le puntate sono rivelate. Puoi usare il potere per aggiungere 1 carta, anche come quarta carta.';cards=p.hand.filter(c=>!game.bids[game.actor].some(b=>b.id===c.id));actions=`${targetSelect()}<button class="button" data-action="fairy" ${selected.length!==1?'disabled':''}>Aggiungi la carta</button><button class="button secondary" data-action="skip">Conserva il potere</button>`;
    }
    if(phase==='alchemist'){
      description='Scambia un tuo oggetto libero con uno esposto. Lo scambio non aggiunge Mele (interpretazione del prototipo). Clicca prima la tua merce, poi una carta del mercato.';
      body=`<div class="actions" style="margin:16px 0">${p.stash.map(o=>`<button class="button secondary" data-own="${o.id}" aria-pressed="${own===o.id}" ${own===o.id?'style="outline:3px solid var(--green)"':''}>${esc(o.name)} · ${o.value}</button>`).join('')}</div>`;
      actions=`<button class="button" data-action="swap" ${!own||!chosen?'disabled':''}>Scambia gli oggetti</button><button class="button secondary" data-action="skip">Conserva il potere</button>`;
    }
    if(phase==='choose'){
      description='Tocca l’oggetto che vuoi comprare e conferma. Scarterai tutte le carte puntate, anche quelle annullate.';
      body=power==='witch'?'<label class="check-label"><input type="checkbox" id="witch">Usa la Strega: 0 Mele su questo acquisto</label>':'';actions=`<button class="button" data-action="choose" ${!chosen?'disabled':''}>Compra l’oggetto selezionato</button>`;
    }
    if(phase==='raid'){
      description='Sospetto 6 o più. Corrompi le Guardie oppure perdi il tuo oggetto libero più prezioso. Dopo torni a 2.';cards=game.available(game.actor);
      body=power==='mage'?'<label class="check-label"><input type="checkbox" id="mage">Usa il Mago: paga soltanto 1 carta</label>':'';
      const max=p.stash.length?Math.max(...p.stash.map(o=>o.value)):0;
      body+=`<p class="phase-description">${p.stash.length?`Oggetto a rischio: ${esc(p.stash.find(o=>o.value===max).name)} (${max} punti).`:'Non hai merce confiscabile. Se non puoi pagare, scarti le carte disponibili.'} ${game.resume==='alchemist'?'Le carte in puntata sono riservate.':''}</p>`;
      const confiscatable=p.stash.filter(o=>o.value===max);
      if(confiscatable.length>1)body+=`<p class="phase-description">Scegli quale oggetto di valore massimo perdere:</p><div class="actions">${confiscatable.map(o=>`<button class="button secondary" data-own="${o.id}" aria-pressed="${own===o.id}" ${own===o.id?'style="outline:3px solid var(--green)"':''}>${o.family} · ${esc(o.name)}</button>`).join('')}</div>`;
      actions='<button class="button" data-action="bribe">Corrompi con le carte selezionate</button><button class="button danger" data-action="confiscate" '+(confiscatable.length>1&&!own?'disabled':'')+'>'+(p.stash.length?'Accetta la Confisca':'Scarta quello che hai')+'</button>';
    }
    if(phase==='thief'){
      description='Sei ultimo in graduatoria. Puoi rubare una carta casuale al primo dopo i pagamenti.';actions='<button class="button" data-action="steal">Ruba una carta</button><button class="button secondary" data-action="no-steal">Conserva il potere</button>';
    }
    if(phase==='end'){
      description='Puoi lavare il denaro una volta e contrabbandare set di 3 oggetti della stessa Famiglia. Poi concludi le azioni.';cards=p.hand;
      body=`<div class="actions" style="margin:16px 0">${p.stash.map(o=>`<button class="button secondary" data-cargo="${o.id}" aria-pressed="${cargo.includes(o.id)}" ${cargo.includes(o.id)?'style="outline:3px solid var(--green)"':''}>${o.family} · ${esc(o.name)} · ${o.value}</button>`).join('')}</div><p class="score-note">Per contrabbandare, seleziona esattamente 3 oggetti della stessa Famiglia. Le carte sotto servono invece per lavare il denaro.</p>`;
      actions=`<button class="button secondary" data-action="smuggle" ${cargo.length!==3?'disabled':''}>Contrabbanda il set</button><button class="button secondary" data-action="wash" ${selected.length!==2||game.washed[game.actor]||p.suspicion===0?'disabled':''}>Lava il denaro · 2 carte</button><button class="button" data-action="done">Concludi le azioni →</button>`;
    }
    if(phase==='draw'){
      description=`Pesca ${2-game.drawn} ${2-game.drawn===1?'carta':'carte'}. Puoi scegliere il mazzo a ogni pesca. Se esaurito, si rimescola lo scarto; se vuoto anche quello, si usa l’altro mazzo.`;
      actions=`<button class="button" data-action="draw-coin">Pesca Moneta</button><button class="button secondary" data-action="draw-trick">Pesca Trucco</button>`;cards=p.hand;
    }
    if(phase==='trim'){
      description=`Hai ${p.hand.length} carte. Seleziona ${p.hand.length-8} carte da scartare per tornare a 8.`;cards=p.hand;actions=`<button class="button" data-action="trim" ${selected.length!==p.hand.length-8?'disabled':''}>Scarta l’eccesso</button>`;
    }
    return `<section class="action-panel" aria-label="Azioni del giocatore"><div class="phase-tag">${esc(p.name).toUpperCase()} · ${phaseNames[phase].toUpperCase()}</div><h2>${({bid:'Quanto vale la tua fortuna?',fairy:'Un piccolo strappo alle regole.',choose:'Scegli la tua prossima fregatura.',raid:'Le Guardie sono qui.',end:'Prima che chiuda il mercato.',draw:'Riempi di nuovo le tasche.',trim:'Le tasche non sono infinite.',alchemist:'Tutto si trasforma.',thief:'Nessuno stava guardando.'})[phase]}</h2><p class="phase-description">${description}</p>${body}${cards.length?`<div class="hand" aria-label="La tua mano">${cards.map(c=>handCard(c,['bid','fairy','raid','end','trim'].includes(phase))).join('')}</div>`:''}<div class="actions">${actions}</div></section>`;
  }
  function render(){
    clearTimeout(botTimer);if(!game)return landing();if(game.phase==='over')return results();
    const p=game.players[game.actor],privateScreen=!revealed&&!p.bot;
    app.innerHTML=`<div class="board"><div class="board-head"><div><span class="eyebrow" style="margin-bottom:8px">IL MERCATO NOTTURNO</span><h1>Una buona notte per cattivi affari.</h1></div><div class="rounds"><span style="margin-right:6px">ROUND</span>${[1,2,3,4,5].map(n=>`<span class="round-dot ${n===game.round?'active':''}">${n}</span>`).join('')}<button class="text-button" id="new-game" style="margin-left:10px">Nuova →</button></div></div>${playerStrip()}
    ${privateScreen?`<section class="privacy"><span class="seal">✦</span><h2>Passa il dispositivo a ${esc(p.name)}.</h2><p>Le mani restano segrete. Gli altri giocatori devono guardare altrove prima di continuare.</p><button class="button" id="uncover">Sono ${esc(p.name)} · mostra il tavolo</button></section>`:
    `<div class="table-grid"><div><div class="section-head"><h2>La merce di stanotte</h2><span class="eyebrow">${game.families.join(' · ')} &nbsp; / &nbsp; ${game.market.length} OGGETTI ESPOSTI</span></div><div class="market">${game.market.length?game.market.map(o=>objectCard(o,!p.bot&&['choose','alchemist'].includes(game.phase))).join(''):'<div class="empty-market">Bancarella svuotata.<br><small>Il Gatto non restituisce il resto.</small></div>'}</div>${revealBids()}${p.bot?`<section class="action-panel"><div class="phase-tag">${phaseNames[game.phase].toUpperCase()}</div><h2>${esc(p.name)} sta giocando…</h2><p class="phase-description">Le mani e le offerte coperte degli avversari restano segrete.</p></section>`:actionPanel()}</div><aside class="side-panel">${rolePanel()}<section><h3>Voci dal ponte</h3><div class="log" aria-label="Registro della partita">${game.log.slice(-15).reverse().map(s=>`<p>${esc(s)}</p>`).join('')}</div><p class="history-copy">${game.coins.length} Monete / ${game.tricks.length} Trucchi nei mazzi<br>${game.coinDiscard.length} / ${game.trickDiscard.length} negli scarti</p></section></aside></div>${collections()}`}
    <p class="save-notice ${saveOK?'':'save-warning'}">${saveOK?'Salvataggio automatico su questo browser.':'Salvataggio locale non disponibile: mantieni aperta questa scheda.'} ${game.mode==='local'?'Modalità locale: usa «Nascondi il tavolo» prima di cedere il dispositivo.':''}</p>${!privateScreen&&!p.bot?'<button class="text-button" id="hide">Nascondi il tavolo</button>':''}</div>`;
    $('#new-game').onclick=()=>$('#confirm').showModal();
    if($('#uncover'))$('#uncover').onclick=()=>{revealed=true;render();};
    if($('#hide'))$('#hide').onclick=()=>{revealed=false;render();};
    wire();
    if(p.bot)botTimer=setTimeout(()=>{try{game.botStep();transition();}catch(e){notice(e.message);}},350);
  }
  function transition(){resetSelection();save();revealed=game.mode==='solo';render();}
  function wire(){
    document.querySelectorAll('[data-card]').forEach(b=>b.onclick=()=>{const id=b.dataset.card;const max=game.phase==='bid'?3:game.phase==='fairy'?1:Infinity;if(selected.includes(id))selected=selected.filter(x=>x!==id);else if(selected.length<max)selected.push(id);else return notice(`Puoi selezionare al massimo ${max} carte.`);render();});
    document.querySelectorAll('[data-object]').forEach(b=>b.onclick=()=>{chosen=b.dataset.object;render();});
    document.querySelectorAll('[data-own]').forEach(b=>b.onclick=()=>{own=b.dataset.own;render();});
    document.querySelectorAll('[data-cargo]').forEach(b=>b.onclick=()=>{const id=b.dataset.cargo;if(cargo.includes(id))cargo=cargo.filter(x=>x!==id);else if(cargo.length<3)cargo.push(id);else return notice('Seleziona esattamente 3 oggetti per set.');render();});
    if($('#target'))$('#target').onchange=e=>target=e.target.value===''?null:Number(e.target.value);
    document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>run(()=>{
      const a=b.dataset.action;
      if(a==='copy')return game.act('copy',{target:Number($('#copy-target').value)});
      if(a==='steal'||a==='no-steal')return game.steal(a==='steal');
      if(a.startsWith('draw-'))return game.act('draw',{kind:a==='draw-coin'?'coin':'trick'});
      game.act(a,{ids:a==='smuggle'?cargo:selected,id:a==='fairy'?selected[0]:a==='confiscate'?own:chosen,target,own,market:chosen,witch:!!$('#witch')?.checked,mage:!!$('#mage')?.checked});
    }));
  }
  function run(fn){try{const actor=game.actor,phase=game.phase;fn();resetSelection();save();if(actor!==game.actor||phase!==game.phase)revealed=game.mode==='solo';render();}catch(e){notice(e.message);}}
  function results(){
    const rows=game.standings(),top=rows[0],winners=rows.filter(r=>r.score===top.score&&r.suspicion===top.suspicion);
    app.innerHTML=`<section class="results"><span class="eyebrow">L’ALBA SOTTO IL PONTE</span><h1>Il mercato chiude.<br>La fiaba continua.</h1><p>${winners.length>1?'Vittoria condivisa: ':'Vince '}${winners.map(r=>esc(r.name)).join(' e ')}. ${top.score} punti, ${top.suspicion} Sospetto.</p><ol class="rank-list">${rows.map((r,j)=>`<li><span class="place">${j+1}</span><div>${esc(r.name)}<br><small>${game.players[r.i].stash.reduce((n,o)=>n+o.value,0)} merce + ${game.players[r.i].caravan.reduce((n,o)=>n+o.value,0)} ×2 Carovana${r.suspicion>=4?' − 2 Ricercato':''}<br>Sospetto ${r.suspicion} · ${ROLES.find(role=>role.id===game.players[r.i].role).name}</small></div><strong>${r.score}</strong></li>`).join('')}</ol><div class="summary"><span>${game.stats.raids} Retate</span><span>${game.stats.sets} set contrabbandati</span><span>${game.stats.passes} passaggi</span><span>${game.stats.emptyDraws} pescate impossibili</span></div><div class="actions"><button class="button" id="again">Un’altra notte →</button><button class="button secondary" id="export">Esporta registro JSON</button></div><p class="save-notice">Una partita con bot prova il funzionamento, non il divertimento o il bilanciamento. Raccogli anche playtest con persone.</p>${collections()}<details class="collection"><summary>Registro completo della partita</summary>${game.log.map(s=>`<p class="history-copy">${esc(s)}</p>`).join('')}</details></section>`;
    $('#again').onclick=landing;$('#export').onclick=()=>{const blob=new Blob([JSON.stringify({version:1,stats:game.stats,standings:game.standings(),log:game.log},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='mercatonero-playtest.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);};
  }
  function catalog(){
    $('#catalog-content').innerHTML=FAMILIES.map(f=>`<h3>${f.shape} ${f.id} · ${f.name}</h3><div class="catalog-grid">${OBJECTS.filter(o=>o.family===f.id).map(o=>objectCard(o)).join('')}</div>`).join('')+
      '<h3>Monete · 30 carte</h3><div class="catalog-grid">'+[1,2,3,4].flatMap((v,i)=>Array.from({length:[12,10,5,3][i]},(_,j)=>handCard({id:`print-c${v}-${j}`,kind:'coin',name:'Moneta',value:v},false))).join('')+'</div><h3>Trucchi · 12 carte</h3><div class="catalog-grid">'+TRICKS.flatMap(t=>Array.from({length:3},(_,j)=>handCard({...t,id:`print-${t.kind}-${j}`},false))).join('')+'</div><h3>Ruoli · 6 carte</h3><div class="catalog-grid">'+ROLES.map(r=>`<article class="role-print"><span class="eyebrow">RUOLO · UNA VOLTA</span><h3>${r.name}</h3><p>${r.text}</p><p>↻ Gira la carta quando usi il potere.</p></article>`).join('')+'</div>';
    $('#catalog').showModal();
  }
  $('#help-button').onclick=()=>$('#help').showModal();$('#catalog-button').onclick=catalog;$('#print-button').onclick=()=>window.print();
  document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>b.closest('dialog').close());
  $('#confirm-new').onclick=()=>{$('#confirm').close();landing();};
  if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol)){
    navigator.serviceWorker.register('./sw.js').catch(()=>notice('Cache offline non disponibile. Il gioco funziona finché il server locale è raggiungibile.'));
  }
  landing();
})();
