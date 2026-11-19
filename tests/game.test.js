const {test}=require('node:test');
const assert=require('node:assert/strict');
const {Game,OBJECTS,FAMILIES,TRICKS}=require('../game.js');
const fresh=(n=4)=>new Game({count:n,seed:42,mode:'local'});
const coin=(id,value)=>({id,kind:'coin',name:'Moneta',value});
const trick=(kind,id=kind)=>({...TRICKS.find(c=>c.kind===kind),id});
const pass=g=>g.act('bid',{ids:[g.players[g.actor].blanks[0].id]});
function fixture(hands){const g=fresh(hands.length);g.players.forEach((p,i)=>{p.role='witch';p.hand=hands[i];});return g;}
function finishChoices(g){let n=0;while(!['end','over'].includes(g.phase)&&n++<100)g.botStep();assert.ok(n<100);}
function invariant(g){
  const escrow=g.paymentComplete?[]:g.bids.flat().filter(c=>c.kind!=='blank');
  const cards=[...g.coins,...g.tricks,...g.coinDiscard,...g.trickDiscard,...g.players.flatMap(p=>p.hand),...escrow];
  assert.equal(cards.length,54);assert.equal(new Set(cards.map(c=>c.id)).size,54);assert.equal(cards.filter(c=>c.kind==='coin').length,30);
  const blanks=g.players.flatMap(p=>p.blanks);assert.equal(blanks.length,3*g.players.length);assert.equal(new Set(blanks.map(c=>c.id)).size,blanks.length);assert.ok(blanks.every(c=>c.kind==='blank'&&c.value===0));
  const objects=[...g.objects,...g.market,...g.removed,...g.players.flatMap(p=>[...p.stash,...p.caravan])];assert.equal(objects.length,6*(g.players.length===3?2:g.players.length));assert.equal(new Set(objects.map(o=>o.id)).size,objects.length);
  for(const p of g.players){assert.ok(Number.isFinite(p.suspicion)&&p.suspicion>=0);assert.equal(p.caravan.length%3,0);}
}
test('PDF: 36 Oggetti/6 Famiglie, 30 Monete, 24 Trucchi, 3 Bianche personali',()=>{
  assert.equal(OBJECTS.length,36);assert.equal(FAMILIES.length,6);assert.equal(TRICKS.length,8);
  for(const f of FAMILIES)assert.equal(OBJECTS.filter(o=>o.family===f.id).length,6);
  for(let n=3;n<=6;n++){const g=fresh(n);invariant(g);assert.equal(g.market.length,n-1);assert.equal(g.families.length,n===3?2:n);assert.equal(g.coins.length,30-5*n);assert.equal(g.tricks.length,24-2*n);assert.ok(g.players.every(p=>p.hand.length===7&&p.hand.filter(c=>c.kind==='coin').length===5));}
});
test('Puntata 1–3: Bianche fuori dalla mano, errori senza mutazioni',()=>{
  const g=fresh(),before=JSON.stringify(g);assert.throws(()=>g.act('bid',{ids:[]}));assert.throws(()=>g.act('bid',{ids:[g.players[0].blanks[0].id,g.players[0].blanks[0].id]}));assert.equal(JSON.stringify(g),before);
  g.act('bid',{ids:[g.players[0].hand[0].id,g.players[0].blanks[0].id]});assert.equal(g.players[0].hand.length,6);assert.equal(g.players[0].blanks.length,3);invariant(g);
});
test('Solo Bianche: passo senza acquisti né pagamento',()=>{
  const g=fresh();g.players.forEach(p=>p.role='witch');for(let i=0;i<4;i++)pass(g);assert.equal(g.phase,'end');assert.equal(g.removed.length,3);assert.equal(g.coinDiscard.length+g.trickDiscard.length,0);assert.ok(g.players.every(p=>p.hand.length===7));invariant(g);
});
test('Tutti pagano dopo tutte le scelte, anche il perdente; Bianche intatte',()=>{
  const g=fixture([[coin('a',4)],[coin('b',3)],[coin('c',1)]]);for(let i=0;i<3;i++)g.act('bid',{ids:[g.players[i].hand[0].id,g.players[i].blanks[0].id]});g.act('choose',{id:g.market[0].id});assert.equal(g.coinDiscard.length,0);g.act('choose',{id:g.market[0].id});assert.equal(g.coinDiscard.length,3);assert.ok(g.players.every(p=>p.hand.length===0&&p.blanks.length===3));
});
test('Resto mancia torna solo se perdi, non se vinci',()=>{
  const g=fixture([[coin('a',4)],[coin('b',3)],[trick('tip')]]);for(let i=0;i<3;i++)g.act('bid',{ids:[g.players[i].hand[0].id]});finishChoices(g);assert.equal(g.players[2].hand[0].kind,'tip');assert.equal(g.trickDiscard.length,0);
  const h=fixture([[trick('tip')],[coin('b',1)],[]]);h.act('bid',{ids:['tip']});h.act('bid',{ids:['b']});pass(h);finishChoices(h);assert.equal(h.players[0].hand.length,0);assert.equal(h.trickDiscard[0].kind,'tip');
});
test('Raddoppio raddoppia una Moneta: 4×2 + 4 + 1 = 13',()=>{
  const g=fixture([[coin('a',4),coin('b',4),trick('double')],[],[]]);g.act('bid',{ids:['a','b','double']});pass(g);pass(g);assert.equal(g.effect.card.kind,'double');g.act('resolve',{coin:'a'});assert.equal(g.total(0),13);
});
test('Fumo prima di Raddoppio: Moneta annullata resta 0',()=>{
  const g=fixture([[coin('a',4),trick('double')],[trick('smoke')],[]]);g.act('bid',{ids:['a','double']});g.act('bid',{ids:['smoke']});pass(g);assert.equal(g.effect.card.kind,'smoke');g.act('resolve',{target:0,coin:'a'});assert.equal(g.effect.card.kind,'double');g.act('resolve',{coin:'a'});assert.equal(g.total(0),1);
});
test('Fumi multipli: Monete diverse e scelta nei valori uguali',()=>{
  const g=fixture([[trick('smoke','s1'),trick('smoke','s2')],[coin('a',4),coin('b',4),trick('light')],[]]);g.act('bid',{ids:['s1','s2']});g.act('bid',{ids:['a','b','light']});pass(g);assert.deepEqual(g.smokeCandidates(1).map(c=>c.id),['a','b']);g.act('resolve',{target:1,coin:'b'});assert.deepEqual(g.smokeCandidates(1).map(c=>c.id),['a']);g.act('resolve',{target:1,coin:'a'});assert.equal(g.total(1),1);
});
test('Fumo non colpisce Bianche/Trucchi; la puntata vera a 0 partecipa',()=>{
  const g=fixture([[trick('smoke')],[coin('a',1)],[]]);g.act('bid',{ids:['smoke']});g.act('bid',{ids:['a']});pass(g);g.act('resolve',{target:1,coin:'a'});assert.equal(g.total(1),0);assert.equal(g.participating(1),true);finishChoices(g);assert.equal(g.players[1].stash.length,1);
  const h=fixture([[trick('smoke')],[trick('light')],[]]);h.act('bid',{ids:['smoke']});h.act('bid',{ids:['light']});pass(h);h.act('resolve',{target:1});assert.equal(h.total(1),1);assert.deepEqual(h.cancelled,[]);
});
test('Soffiata massimo +1, poi Sigillo, infine Strega',()=>{
  for(const witch of [false,true]){const g=fixture([[coin('a',4),trick('seal')],[trick('whisper','w1'),trick('whisper','w2')],[]]);g.market[0].apples=3;const id=g.market[0].id;g.act('bid',{ids:['a','seal']});g.act('bid',{ids:['w1','w2']});pass(g);g.act('resolve',{object:id});g.act('resolve',{object:id});assert.equal(g.tipped.length,1);assert.equal(g.applesFor(0,g.market[0]),3);g.act('choose',{id,witch});finishChoices(g);assert.equal(g.players[0].suspicion,witch?0:3);}
});
test('Mano Leggera prevale; tra Mani: meno Sospetto, poi Mazziere',()=>{
  const g=fresh();g.dealer=2;g.bids=[[coin('a',4)],[trick('light'),coin('b',3)],[trick('light'),coin('c',3)],[coin('d',4)]];g.players[0].suspicion=0;g.players[1].suspicion=3;g.players[2].suspicion=5;assert.deepEqual(g.rank(),[1,2,3,0]);g.players[1].suspicion=5;assert.equal(g.rank()[0],2);
});
test('Pareggi senza Mano: Sospetto prima del Mazziere, esempio del PDF',()=>{
  const g=fresh();g.bids=[[coin('a',3),coin('b',2)],[coin('c',4)],[coin('d',3)],[coin('e',2),coin('f',2)]];[2,3,0,1].forEach((s,i)=>g.players[i].suspicion=s);assert.deepEqual(g.rank(),[0,3,1,2]);
});
test('Maledizione/Lavanderia dopo graduatoria, scelte e pagamento',()=>{
  const g=fixture([[coin('a',2),trick('curse')],[coin('b',1),trick('laundry')],[]]);g.players[0].suspicion=2;g.players[1].suspicion=1;g.act('bid',{ids:['a','curse']});g.act('bid',{ids:['b','laundry']});pass(g);assert.equal(g.ranking[0],1);assert.equal(g.players[1].suspicion,1);g.market.forEach(o=>o.apples=0);g.act('choose',{id:g.market[0].id});g.act('choose',{id:g.market[0].id});assert.equal(g.paymentComplete,true);assert.equal(g.effect.card.kind,'curse');g.act('resolve',{target:1});assert.equal(g.players[1].suspicion,1);assert.equal(g.ranking[0],1);
});
test('Aggiornamento simultaneo: Lavanderia può evitare la Retata',()=>{
  const g=fixture([[coin('a',4),trick('laundry')],[trick('curse')],[]]);g.players[0].suspicion=5;g.act('bid',{ids:['a','laundry']});g.act('bid',{ids:['curse']});pass(g);g.market.forEach(o=>o.apples=0);g.act('choose',{id:g.market[0].id});g.act('choose',{id:g.market[0].id});g.act('resolve',{target:0});assert.equal(g.players[0].suspicion,5);assert.equal(g.phase,'end');assert.equal(g.stats.raids,0);
});
test('Lavanderie multiple minimo 0, nessun lavaggio con scarti',()=>{
  const g=fixture([[trick('laundry','l1'),trick('laundry','l2')],[],[]]);g.players[0].suspicion=1;g.act('bid',{ids:['l1','l2']});pass(g);pass(g);g.market.forEach(o=>o.apples=0);finishChoices(g);assert.equal(g.players[0].suspicion,0);assert.throws(()=>g.act('wash',{ids:[]}));
});
test('Retata dopo pagamento, Mago una volta, reset 2 e Carovana protetta',()=>{
  const g=fixture([[coin('a',4),coin('keep',1),coin('other',2)],[trick('curse')],[]]);g.players[0].role='mage';g.players[0].suspicion=5;g.players[0].caravan=OBJECTS.slice(0,3).map(o=>({...o}));g.act('bid',{ids:['a']});g.act('bid',{ids:['curse']});pass(g);g.market.forEach(o=>o.apples=0);g.act('choose',{id:g.market[0].id});g.act('choose',{id:g.market[0].id});g.act('resolve',{target:0});assert.equal(g.phase,'raid');assert.ok(g.coinDiscard.some(c=>c.id==='a'));g.act('bribe',{ids:['keep'],mage:true});assert.equal(g.players[0].suspicion,2);assert.equal(g.players[0].used,true);assert.equal(g.players[0].caravan.length,3);
});
test('Confisca: massimo valore, scelta in caso di parità',()=>{
  const g=fresh(3);g.phase='raid';g.actor=0;g.raidQueue=[];g.players[0].stash=[{...OBJECTS[0],id:'lo',value:1},{...OBJECTS[4],id:'hi1',value:4},{...OBJECTS[4],id:'hi2',value:4}];assert.throws(()=>g.act('confiscate',{id:'lo'}));g.act('confiscate',{id:'hi2'});assert.ok(g.players[0].stash.some(o=>o.id==='hi1'));assert.equal(g.removed.at(-1).id,'hi2');
});
test('Fata aggiunge il quarto Trucco, non Bianche; copia non consuma il proprietario',()=>{
  const g=fixture([[coin('a',1),coin('b',1),coin('c',1),trick('double')],[],[]]);g.players[0].role='apprentice';g.players[1].role='fairy';g.act('copy',{target:1});assert.equal(g.players[1].used,false);g.act('bid',{ids:['a','b','c']});pass(g);pass(g);assert.equal(g.phase,'fairy');assert.throws(()=>g.act('fairy',{id:g.players[0].blanks[0].id}));g.act('fairy',{id:'double'});assert.equal(g.bids[0].length,4);g.act('resolve',{coin:'a'});assert.equal(g.total(0),5);
});
test('Ladro prima di pagamento: mai Bianche o carte già puntate',()=>{
  const g=fixture([[coin('a',4),coin('safe',1)],[coin('b',3)],[]]);g.players[2].role='thief';g.act('bid',{ids:['a']});g.act('bid',{ids:['b']});pass(g);assert.equal(g.phase,'thief');g.steal(true);assert.equal(g.players[2].hand[0].id,'safe');assert.equal(g.bids[0][0].id,'a');assert.equal(g.players[0].blanks.length,3);assert.equal(g.paymentComplete,false);
});
test('Alchimista scambia solo merce libera prima della scelta',()=>{
  const g=fixture([[coin('a',4)],[],[]]);g.players[0].role='alchemist';g.players[0].stash=[{...OBJECTS[0],id:'own'}];g.act('bid',{ids:['a']});pass(g);pass(g);assert.equal(g.phase,'alchemist');const id=g.market[0].id;g.act('swap',{own:'own',market:id});assert.equal(g.players[0].stash[0].id,id);assert.ok(g.market.some(o=>o.id==='own'));assert.equal(g.players[0].suspicion,0);
});
test('Contrabbando: tre della stessa Famiglia, doppio valore e penalità Ricercato',()=>{
  const g=fresh();g.phase='end';g.actor=0;g.queue=[];g.players[0].stash=OBJECTS.slice(3,6).map(o=>({...o}));g.players[0].suspicion=4;g.act('smuggle',{ids:g.players[0].stash.map(o=>o.id)});assert.equal(g.score(0),22);g.act('done');assert.equal(g.phase,'draw');
});
test('Pesca 2 Monete o 1 Trucco; altra opzione se il mazzo non basta',()=>{
  const g=fresh(6);g.phase='draw';g.actor=0;g.queue=[1];assert.equal(g.drawOptions().coin,false);const before=JSON.stringify(g);assert.throws(()=>g.act('draw',{kind:'coin'}));assert.equal(JSON.stringify(g),before);g.act('draw',{kind:'trick'});assert.equal(g.players[0].hand.length,8);assert.equal(g.actor,1);
  const h=fresh(3);h.phase='draw';h.actor=0;h.queue=[1];h.act('draw',{kind:'coin'});assert.equal(h.phase,'trim');h.act('trim',{ids:[h.players[0].hand[0].id]});assert.equal(h.players[0].hand.length,8);
});
test('Rimescolo di pesca separato e Bianche escluse dal limite 8',()=>{
  const g=fresh(6);g.coinDiscard=[coin('one',1),coin('two',2)];assert.equal(g.draw('coin').kind,'coin');assert.equal(g.draw('coin').kind,'coin');assert.equal(g.draw('coin'),undefined);assert.ok(g.tricks.length>0);assert.equal(g.players[0].blanks.length,3);
});
test('5 round, nessun rimescolo Oggetti e nessuna pesca finale',()=>{
  for(let n=3;n<=6;n++){const g=fresh(n);let k=0;while(!(g.round===5&&g.phase==='end')&&k++<1000)g.botStep();assert.ok(k<1000);const draws=g.log.filter(s=>s.includes('pesca 2 Monete')||s.includes('pesca 1 Trucco')).length;while(g.phase!=='over'&&k++<2000)g.botStep();assert.equal(g.round,5);assert.equal(g.finishReason,'five-rounds');assert.equal(g.log.filter(s=>s.includes('pesca 2 Monete')||s.includes('pesca 1 Trucco')).length,draws);assert.equal(g.objects.length,(n===3?12:6*n)-5*(n-1));invariant(g);}
});
test('Il secondo set non chiude il gioco base (è un modulo opzionale)',()=>{
  const g=fresh();g.phase='end';g.actor=0;g.queue=[];g.players[0].caravan=OBJECTS.slice(0,3).map(o=>({...o}));g.players[0].stash=OBJECTS.slice(6,9).map(o=>({...o}));g.act('smuggle',{ids:g.players[0].stash.map(o=>o.id)});g.act('done');assert.equal(g.phase,'draw');
});
test('Salvataggi PDF deterministici; i precedenti sono rifiutati',()=>{
  const a=fresh(6);for(let k=0;k<20;k++)a.botStep();const data=JSON.parse(JSON.stringify(a)),b=Game.restore(data);assert.equal(data.version,3);assert.throws(()=>Game.restore({...data,version:2}));while(a.phase!=='over'){a.botStep();b.botStep();assert.deepEqual(a.toJSON(),b.toJSON());}
});
test('800 partite nei due livelli: nessun blocco, conservazione carte, 5 round',()=>{
  for(const difficulty of ['normal','easy'])for(let n=3;n<=6;n++)for(let seed=1;seed<=100;seed++){const g=new Game({count:n,seed,difficulty});let k=0;invariant(g);while(g.phase!=='over'&&k++<2000){g.botStep();invariant(g);}assert.equal(g.phase,'over',`${n}/${seed}/${difficulty}/${g.phase}`);assert.equal(g.round,5);assert.ok(g.players.every(p=>p.hand.length<=8));}
});
test('Un secondo Raddoppio non moltiplica ancora la stessa Moneta',()=>{
  const g=fixture([[coin('a',4),trick('double','d1'),trick('double','d2')],[],[]]);g.act('bid',{ids:['a','d1','d2']});pass(g);pass(g);g.act('resolve',{coin:'a'});assert.equal(g.total(0),10);assert.equal(g.doubled.length,1);
});
test('Soffiata su Oggetto non preso non aumenta alcun Sospetto',()=>{
  const g=fixture([[trick('whisper')],[],[]]);g.act('bid',{ids:['whisper']});pass(g);pass(g);const id=g.market[0].id;g.act('resolve',{object:id});const other=g.market.find(o=>o.id!==id);other.apples=0;g.act('choose',{id:other.id});assert.ok(g.players.every(p=>p.suspicion===0));assert.ok(g.removed.some(o=>o.id===id));
});
test('Una Bianca altrui non si può puntare e non entra nella mano',()=>{
  const g=fresh();const before=JSON.stringify(g);assert.throws(()=>g.act('bid',{ids:[g.players[1].blanks[0].id]}));assert.equal(JSON.stringify(g),before);assert.ok(g.players.every(p=>p.hand.every(c=>c.kind!=='blank')));
});
