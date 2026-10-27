const {test}=require('node:test');
const assert=require('node:assert/strict');
const {Game,OBJECTS,FAMILIES}=require('../game.js');
const fresh=(count=4)=>new Game({count,seed:42,mode:'local'});
const coin=(id,value)=>({id,kind:'coin',name:'Moneta',value});
function invariant(g){
  const cards=[...g.coins,...g.tricks,...g.coinDiscard,...g.trickDiscard,...g.players.flatMap(p=>p.hand)];
  assert.equal(cards.length,42);assert.equal(new Set(cards.map(c=>c.id)).size,42);
  const objects=[...g.objects,...g.market,...g.removed,...g.players.flatMap(p=>[...p.stash,...p.caravan])];
  assert.equal(objects.length,6*(g.players.length-1));assert.equal(new Set(objects.map(c=>c.id)).size,objects.length);
  for(const p of g.players){assert.ok(p.suspicion>=0);assert.equal(p.caravan.length%3,0);}
}
test('Composizione esatta e distribuzione per 3–6 giocatori',()=>{
  assert.equal(OBJECTS.length,30);for(const f of FAMILIES)assert.equal(OBJECTS.filter(o=>o.family===f.id).length,6);
  assert.equal(OBJECTS.find(o=>o.id==='I1').value,2);assert.equal(OBJECTS.find(o=>o.id==='R1').value,1);
  for(let n=3;n<=6;n++){const g=fresh(n);invariant(g);assert.equal(g.market.length,n===3?2:3);for(const p of g.players){assert.equal(p.hand.filter(c=>c.kind==='coin').length,5);assert.equal(p.hand.filter(c=>c.kind!=='coin').length,2);}}
});
test('Pareggio: Mazziere per primo, poi senso orario; il Sospetto non conta',()=>{
  const g=fresh();g.dealer=2;g.bids=g.players.map((_,i)=>[coin('t'+i,4)]);g.players[0].suspicion=0;g.players[2].suspicion=5;g.players[3].suspicion=2;
  assert.deepEqual(g.rank(),[2,3,0,1]);g.bids[0]=[coin('t0',5)];assert.equal(g.rank()[0],0);g.cancelled=['t2'];assert.equal(g.total(2),0);
});
test('Passare non assegna oggetti; puntata invalida non muta la fase',()=>{
  const g=fresh();g.players.forEach(p=>p.role='witch');
  assert.throws(()=>g.act('bid',{ids:[g.players[0].hand[0].id,g.players[0].hand[0].id]}));
  for(let i=0;i<4;i++)g.act('bid',{ids:[]});assert.equal(g.phase,'end');assert.equal(g.market.length,0);assert.equal(g.removed.length,3);
});
test('Pagamento solo di chi prende un oggetto; chi perde conserva le carte',()=>{
  const g=fresh(3);g.players.forEach(p=>p.role='witch');const ids=[];
  g.players.forEach((p,i)=>{p.hand=[coin('x'+i,3-i)];ids.push('x'+i);});
  for(let i=0;i<3;i++)g.act('bid',{ids:[ids[i]]});
  assert.equal(g.phase,'choose');g.act('choose',{id:g.market[0].id});g.act('choose',{id:g.market[0].id});
  assert.equal(g.players[0].hand.length,0);assert.equal(g.players[1].hand.length,0);assert.equal(g.players[2].hand[0].id,'x2');assert.equal(g.coinDiscard.length,2);
});
test('Raddoppio vale 2; Fumi multipli cancellano Monete diverse, non Trucchi',()=>{
  const g=fresh(3);g.players.forEach(p=>p.role='witch');
  g.players[0].hand=[{id:'s1',kind:'smoke',value:2},{id:'s2',kind:'smoke',value:2}];g.players[1].hand=[coin('a',4),coin('b',3),{id:'d',kind:'double',value:1}];g.players[2].hand=[];
  g.act('bid',{ids:['s1','s2'],target:1});g.act('bid',{ids:['a','b','d']});g.act('bid',{ids:[]});
  assert.equal(g.total(1),2);assert.deepEqual(g.cancelled,['a','b']);
});
test('Retata: eccesso perso, pagamento, Mago una sola volta, merce protetta',()=>{
  const g=fresh();g.actor=0;g.players[0].role='mage';g.players[0].suspicion=9;g.players[0].caravan=[...OBJECTS.slice(0,3)];g.choiceQueue=[];g.ranking=[0,1,2,3];g.startRaids([0],'choose');
  const id=g.players[0].hand[0].id;g.act('bribe',{ids:[id],mage:true});assert.equal(g.players[0].suspicion,2);assert.equal(g.players[0].used,true);assert.equal(g.players[0].caravan.length,3);assert.equal(g.stats.raids,1);
});
test('Retata prima della scelta protegge la puntata dal pagamento',()=>{
  const g=fresh();g.actor=0;g.bids[0]=[g.players[0].hand[0]];g.ranking=[0,1,2,3];g.players[0].suspicion=6;g.startRaids([0],'alchemist');
  const ids=g.players[0].hand.slice(0,3).map(c=>c.id);assert.throws(()=>g.act('bribe',{ids}),/escluse/);assert.ok(!g.available(0).some(c=>c.id===ids[0]));
});
test('Contrabbando esatto, niente lavaggio, punteggio e penalità',()=>{
  const g=fresh();g.phase='end';g.actor=0;const p=g.players[0];p.stash=OBJECTS.slice(3,6).map(o=>({...o}));p.suspicion=5;
  g.act('smuggle',{ids:p.stash.map(o=>o.id)});assert.equal(g.score(0),22);
  const before=JSON.stringify(g);assert.throws(()=>g.act('wash',{ids:p.hand.slice(0,2).map(c=>c.id)}));assert.equal(JSON.stringify(g),before);
  assert.throws(()=>g.act('smuggle',{ids:p.caravan.map(o=>o.id)}));
});
test('Scarti separati: nessuna sostituzione Monete/Trucchi',()=>{
  const g=fresh(6);assert.equal(g.coins.length+g.tricks.length,0);assert.equal(g.draw('coin'),undefined);
  g.trickDiscard.push({id:'t',kind:'double',value:1});assert.equal(g.draw('coin'),undefined);assert.equal(g.draw('trick').id,'t');
  g.coinDiscard.push(coin('c',4));assert.equal(g.draw('trick'),undefined);assert.equal(g.draw('coin').id,'c');
});
test('Una scelta di pesca dà esattamente 2 Monete oppure 1 Trucco e passa il turno',()=>{
  for(const kind of ['coin','trick']){
    const g=fresh(3);g.phase='draw';g.actor=0;g.queue=[1,2];const p=g.players[0];p.hand=p.hand.slice(0,4);const before=p.hand.length;
    g.act('draw',{kind});assert.equal(p.hand.length,before+(kind==='coin'?2:1));assert.ok(p.hand.slice(before).every(c=>(c.kind==='coin')===(kind==='coin')));assert.equal(g.actor,1);
    assert.throws(()=>g.act('draw',{kind:'mixed'}));
  }
});
test('Pesca insufficiente: nessun cambio di tipo, limite 8 dopo la scelta',()=>{
  const g=fresh(6);g.phase='draw';g.actor=0;g.queue=[1];const before=g.players[0].hand.length;
  g.coinDiscard=[coin('one',2)];g.trickDiscard=[{id:'t',kind:'double',value:1}];g.act('draw',{kind:'coin'});
  assert.equal(g.players[0].hand.length,before+1);assert.equal(g.trickDiscard.length,1);assert.equal(g.stats.emptyDraws,1);assert.equal(g.actor,1);
  const h=fresh(3);h.phase='draw';h.actor=0;h.queue=[1];h.act('draw',{kind:'coin'});assert.equal(h.phase,'trim');assert.equal(h.players[0].hand.length,9);
  h.act('trim',{ids:[h.players[0].hand[0].id]});assert.equal(h.players[0].hand.length,8);assert.equal(h.actor,1);
});
test('Strega azzera le Mele; Sigilli multipli si sommano senza Sospetto negativo',()=>{
  for(const witch of [false,true]){
    const g=fresh(3);g.players.forEach(p=>p.role='witch');g.players[0].suspicion=2;
    g.players[0].hand=[{id:'s1',kind:'seal',value:2},{id:'s2',kind:'seal',value:2}];
    g.act('bid',{ids:['s1','s2']});g.act('bid',{ids:[]});g.act('bid',{ids:[]});
    g.market[0].apples=witch?3:1;g.act('choose',{id:g.market[0].id,witch});
    assert.equal(g.players[0].suspicion,2);assert.equal(g.players[0].used,witch);
  }
});
test('Maledizione genera una Retata anche senza acquistare un oggetto',()=>{
  const g=fresh(3);g.players.forEach(p=>p.role='witch');g.players[1].suspicion=5;
  g.players[0].hand=[{id:'curse',kind:'curse',value:1}];g.act('bid',{ids:['curse'],target:1});g.act('bid',{ids:[]});g.act('bid',{ids:[]});
  assert.equal(g.phase,'raid');assert.equal(g.actor,1);g.act('bribe',{ids:g.available(1).slice(0,3).map(c=>c.id)});assert.equal(g.players[1].suspicion,2);
});
test('Se tutti passano a sei giocatori, la pesca impossibile termina senza blocchi',()=>{
  const g=fresh(6);g.players.forEach(p=>p.role='witch');for(let i=0;i<6;i++)g.act('bid',{ids:[]});
  for(let i=0;i<6;i++)g.act('done');for(let i=0;i<6;i++)g.act('draw',{kind:'coin'});
  assert.equal(g.round,2);assert.equal(g.stats.emptyDraws,12);assert.equal(g.players[0].hand.length,7);invariant(g);
});
test('Fata ammette una quarta carta una sola volta; Apprendista copia',()=>{
  const g=fresh();g.players[0].role='apprentice';g.players[1].role='fairy';g.act('copy',{target:1});assert.equal(g.power(0),'fairy');assert.equal(g.players[0].used,true);
  g.phase='fairy';g.actor=0;g.queue=[];g.bids[0]=g.players[0].hand.slice(0,3);const fourth=g.players[0].hand[3];g.act('fairy',{id:fourth.id,target:1});assert.equal(g.bids[0].length,4);assert.equal(g.power(0),null);
});
test('Alchimista scambia solo merce libera; Ladro dopo i pagamenti',()=>{
  const g=fresh();g.actor=0;g.phase='alchemist';g.queue=[];g.ranking=[0,1,2,3];g.players[0].role='alchemist';g.players[0].stash=[{...OBJECTS[0]}];const market=g.market[0].id;
  g.act('swap',{own:'R0',market});assert.equal(g.players[0].stash[0].id,market);assert.equal(g.players[0].used,true);assert.equal(g.players[0].suspicion,0);
  g.actor=3;g.phase='thief';g.players[3].role='thief';const a=g.players[0].hand.length,b=g.players[3].hand.length;g.steal(true);assert.equal(g.players[0].hand.length,a-1);assert.equal(g.players[3].hand.length,b+1);
});
test('Salvataggio e ripresa deterministici durante un round',()=>{
  const a=fresh(6);for(let i=0;i<12;i++)a.botStep();const b=Game.restore(JSON.parse(JSON.stringify(a)));
  for(let step=0;step<5000&&a.phase!=='over';step++){a.botStep();b.botStep();assert.deepEqual(a.toJSON(),b.toJSON());}assert.equal(a.phase,'over');
});
test('400 partite complete: conservazione carte, rimescoli, fine per due set o scorte vuote',()=>{
  for(let n=3;n<=6;n++)for(let seed=1;seed<=100;seed++){
    const g=new Game({count:n,seed});let steps=0;invariant(g);
    while(g.phase!=='over'&&steps++<5000){g.botStep();invariant(g);}
    assert.equal(g.phase,'over',`blocco n=${n}, seed=${seed}, fase=${g.phase}`);assert.ok(['two-sets','objects-exhausted'].includes(g.finishReason));if(g.finishReason==='two-sets')assert.ok(g.players.some(p=>p.caravan.length>=6));else assert.equal(g.objects.length+g.removed.length,0);for(const p of g.players)assert.ok(p.hand.length<=8);
  }
});

test('Il quinto round non chiude: si rimescolano gli Oggetti scartati',()=>{
  const g=fresh(4);g.round=5;g.phase='end';g.actor=0;g.queue=[];g.removed.push(...g.market,...g.objects);g.market=[];g.objects=[];
  g.act('done');assert.equal(g.phase,'draw');while(g.round===5)g.botStep();assert.equal(g.round,6);assert.equal(g.market.length,3);assert.equal(g.stats.objectReshuffles,1);invariant(g);
});
test('La chiusura scatta al secondo set, a fine round per tutti, senza pesca finale',()=>{
  const g=fresh();g.phase='end';g.actor=0;g.queue=[1,2,3];const p=g.players[0];p.caravan=OBJECTS.slice(0,3).map(o=>({...o}));p.stash=OBJECTS.slice(6,9).map(o=>({...o}));
  g.act('smuggle',{ids:p.stash.map(o=>o.id)});assert.equal(g.phase,'end');assert.equal(g.closingPlayer,0);assert.equal(p.caravan.length,6);
  for(let i=0;i<4;i++)g.act('done');assert.equal(g.phase,'over');assert.equal(g.finishReason,'two-sets');
});
test('Con un solo set si continua; nessun mazzo/scarto chiude ai punti',()=>{
  const g=fresh();g.phase='end';g.actor=0;g.queue=[];g.players[0].caravan=OBJECTS.slice(0,3).map(o=>({...o}));g.act('done');assert.equal(g.phase,'draw');
  const h=fresh();h.phase='end';h.actor=0;h.queue=[];h.objects=[];h.removed=[];h.act('done');assert.equal(h.phase,'over');assert.equal(h.finishReason,'objects-exhausted');
});
test('L’ultimo round rispetta il limite 8 anche dopo un furto',()=>{
  const g=fresh(3);g.phase='end';g.actor=0;g.queue=[];g.objects=[];g.removed=[];g.players[1].hand.push(g.coins.pop(),g.coins.pop());
  g.act('done');assert.equal(g.phase,'trim');assert.equal(g.actor,1);g.act('trim',{ids:[g.players[1].hand[0].id]});assert.equal(g.phase,'over');assert.equal(g.players[1].hand.length,8);
});
test('Rimescolo senza duplicare le collezioni, anche con mercato parziale',()=>{
  const g=fresh(6);g.removed.push(g.objects.pop());const pool=[...g.objects,...g.market,...g.removed];g.objects=[pool[0]];g.removed=[pool[1]];g.players[0].stash.push(...pool.slice(2));
  g.round++;g.beginRound();assert.equal(g.market.length,2);assert.equal(g.stats.objectReshuffles,1);invariant(g);
});
test('Versione del salvataggio impedisce di applicare nuove regole a vecchie partite',()=>{
  const data=JSON.parse(JSON.stringify(fresh()));assert.equal(data.version,2);assert.equal(Game.restore(data).version,2);data.version=1;assert.throws(()=>Game.restore(data),/0.5/);
});
