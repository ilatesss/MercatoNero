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
  for(let n=3;n<=6;n++){const g=fresh(n);invariant(g);assert.equal(g.market.length,n-1);for(const p of g.players){assert.equal(p.hand.filter(c=>c.kind==='coin').length,5);assert.equal(p.hand.filter(c=>c.kind!=='coin').length,2);}}
});
test('Priorità: valore, Sospetto, poi Mazziere',()=>{
  const g=fresh();g.dealer=2;g.bids=g.players.map((_,i)=>[coin('t'+i,4)]);g.players[0].suspicion=3;g.players[3].suspicion=2;
  assert.deepEqual(g.rank(),[2,1,3,0]);g.cancelled=['t2'];assert.equal(g.total(2),0);
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
test('Contrabbando esatto, lavaggio una volta, punteggio e penalità',()=>{
  const g=fresh();g.phase='end';g.actor=0;const p=g.players[0];p.stash=OBJECTS.slice(3,6).map(o=>({...o}));p.suspicion=5;
  g.act('smuggle',{ids:p.stash.map(o=>o.id)});assert.equal(g.score(0),22);g.act('wash',{ids:p.hand.slice(0,2).map(c=>c.id)});assert.equal(p.suspicion,4);assert.throws(()=>g.act('wash',{ids:p.hand.slice(0,2).map(c=>c.id)}));
  assert.throws(()=>g.act('smuggle',{ids:p.caravan.map(o=>o.id)}));
});
test('Scarti separati, fallback di pesca, entrambi i mazzi vuoti',()=>{
  const g=fresh(6);assert.equal(g.coins.length+g.tricks.length,0);assert.equal(g.draw('coin'),undefined);g.trickDiscard.push({id:'t',kind:'double',value:1});assert.equal(g.draw('coin').id,'t');
  g.coinDiscard.push(coin('c',4));assert.equal(g.draw('trick').id,'c');
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
  for(let i=0;i<6;i++)g.act('done');for(let i=0;i<12;i++)g.act('draw',{kind:'coin'});
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
  for(let step=0;step<500&&a.phase!=='over';step++){a.botStep();b.botStep();assert.deepEqual(a.toJSON(),b.toJSON());}assert.equal(a.phase,'over');
});
test('400 partite complete: nessuna carta duplicata/persa, nessun blocco, 5 round',()=>{
  for(let n=3;n<=6;n++)for(let seed=1;seed<=100;seed++){
    const g=new Game({count:n,seed});let steps=0;invariant(g);
    while(g.phase!=='over'&&steps++<1000){g.botStep();invariant(g);}
    assert.equal(g.phase,'over',`blocco n=${n}, seed=${seed}, fase=${g.phase}`);assert.equal(g.round,5);for(const p of g.players)assert.ok(p.hand.length<=8);
  }
});
