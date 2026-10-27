/* Motore indipendente dal DOM. Regole 0.5: revisione dell'autrice. */
(function (root) {
  'use strict';
  const FAMILIES = [
    {id:'R', name:'Reliquie maledette', shape:'◆', color:'#CC79A7', icon:'mirror', names:['Dente di Drago Usato','Pantofola Spaiata','Corona della Rana','Specchio Magico Adulatore','Mela Quasi Biologica','Anello del Troll Innamorato']},
    {id:'I', name:'Invenzioni fregatura', shape:'■', color:'#0072B2', icon:'lamp', names:['Tappeto Volante Senza Freni','Stivali delle Sette Leghe, Taglia Piccola','Lampada del Genio Scrocco','Bacchetta con Telecomando','Calderone Autopulente Esplosivo','Palla di Cristallo con Pubblicità']},
    {id:'P', name:'Pozioni truffa', shape:'●', color:'#D55E00', icon:'bottle', names:['Pozione Bellezza Scaduta','Elisir di Lunga Vita (a metà)',"Filtro d’Amore Generico",'Unguento Invisibilità Parziale','Veleno di Cortesia','Pozione Gigante Taglia Unica']},
    {id:'A', name:'Animali parlanti difettosi', shape:'▲', color:'#E69F00', icon:'cat', names:['Grillo Parlante Muto','Lupo Cattivo Vegano',"Gallina dalle Uova d’Ottone",'Asino Oracolo, Sbaglia Sempre','Cavallo di Troia Gonfiabile','Drago da Compagnia Non Ancora Addestrato']},
    {id:'L', name:'Libri maledetti', shape:'★', color:'#009E73', icon:'book', names:['Segnalibro Ipnotico','Dizionario dei Sortilegi Sbagliati','Libro delle Ombre, Edizione Tascabile','Atlante del Regno Non Aggiornato','Grimorio con Clausole in Piccolo','Enciclopedia Proibita in 12 Volumi']}
  ];
  const JOKES = [
    ['La garanzia è scaduta prima del drago.','Il principe cerca ancora l’altra.','Gracida quando menti. Anche quando dici la verità.','Sei bellissimo. Soprattutto al buio.','Tracce di maledizione. Può contenere semi.','Ti lascia. Poi torna. Poi ti lascia.'],
    ['L’atterraggio è venduto separatamente.','Sette leghe. Una sola vescica.','Tre desideri, più spese di soggiorno.','Le pile non sono incluse. La maledizione sì.','Pulisce anche il soffitto. Aprendolo.','Il futuro arriva dopo trenta secondi di spot.'],
    ['Toglie dieci anni. Dal flacone.','Vivi per sempre. Fino a mezzogiorno.','Funziona con chiunque. Purtroppo.','Nessuno vede i tuoi gomiti.','Per chi non sa mai come dire di no.','Cresci tu. I vestiti si arrangiano.'],
    ['La coscienza finalmente tace.','Nonna, che tofu grande che hai!','La colazione vale meno del previsto.','Il futuro? Meglio chiedere a un mulo.','La sorpresa dura finché non si sgonfia.','Seduto. Seduto! Il villaggio no!'],
    ['Non ricordi perché stavi leggendo.','Trasforma i nemici in mobili. Forse.','Il buio, ora in formato da viaggio.','Qui una volta c’era un castello.','L’anima si rinnova automaticamente.','Proibita soprattutto dalle poste.']
  ];
  const OBJECTS = FAMILIES.flatMap((f,k)=>f.names.map((name,i)=>({id:f.id+i, family:f.id, name, value: i===1 && ['I','P'].includes(f.id)?2:[1,1,2,3,4,5][i], apples:[0,0,1,1,2,3][i], joke:JOKES[k][i]})));
  const TRICKS = [
    {kind:'double',name:'Raddoppio',value:1,text:'Questa carta vale 2 nella puntata.'},
    {kind:'smoke',name:'Fumo negli Occhi',value:2,text:'Annulla la Moneta più alta di un avversario.'},
    {kind:'seal',name:'Sigillo Anti-Guardie',value:2,text:'L’oggetto che prendi ha 1 Mela in meno.'},
    {kind:'curse',name:'Maledizione Leggera',value:1,text:'Un avversario sale di 1 Sospetto.'}
  ];
  const ROLES = [
    {id:'apprentice',name:'L’Apprendista Stregone',text:'Prima dell’asta, copia un altro Ruolo per questo round.'},
    {id:'witch',name:'La Strega Contrabbandiera',text:'L’oggetto che prendi ha 0 Mele.'},
    {id:'fairy',name:'La Fata Ribelle',text:'Dopo la rivelazione, aggiungi una carta alla tua puntata.'},
    {id:'alchemist',name:'L’Alchimista Truffaldino',text:'Prima della scelta, scambia un tuo oggetto con uno esposto.'},
    {id:'thief',name:'Il Ladro di Sogni',text:'Se arrivi ultimo, ruba una carta a caso al primo.'},
    {id:'mage',name:'Il Mago Corrotto',text:'Una volta, paga la Retata con 1 carta anziché 3.'}
  ];
  function fail(condition,message){if(!condition)throw new Error(message);}
  class Game {
    constructor(config={}) {
      this.seed=(config.seed??Date.now())>>>0; this.round=1; this.dealer=0; this.log=[]; this.stats={raids:0,sets:0,passes:0,emptyDraws:0,objectReshuffles:0};this.finishReason=null;this.closingPlayer=null;
      const count=config.count??4; fail(Number.isInteger(count)&&count>=3&&count<=6,'Servono da 3 a 6 giocatori.');
      this.mode=config.mode??'solo'; const roles=this.shuffle([...ROLES]);
      this.players=Array.from({length:count},(_,i)=>({name:(config.names?.[i]|| (i===0?'Tu':['Morgana','Gatto Cassiere','Rospino','Madama Ombra','Ser Merluzzo'][i-1])).slice(0,24),bot:this.mode==='solo'&&i>0,role:roles[i].id,used:false,copied:null,hand:[],stash:[],caravan:[],suspicion:0}));
      this.coins=this.shuffle([1,2,3,4].flatMap((v,i)=>Array.from({length:[12,10,5,3][i]},(_,j)=>({id:`c${v}-${j}`,kind:'coin',name:'Moneta',value:v}))));
      this.tricks=this.shuffle(TRICKS.flatMap(t=>Array.from({length:3},(_,j)=>({...t,id:`${t.kind}-${j}`})))); this.coinDiscard=[]; this.trickDiscard=[];
      this.families=this.shuffle(FAMILIES.map(f=>f.id)).slice(0,count-1);
      this.objects=this.shuffle(OBJECTS.filter(o=>this.families.includes(o.family)).map(o=>({...o}))); this.removed=[];
      this.players.forEach(p=>{for(let i=0;i<5;i++)p.hand.push(this.coins.pop());for(let i=0;i<2;i++)p.hand.push(this.tricks.pop());});
      this.beginRound();
    }
    random(){let t=this.seed+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;}
    shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(this.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
    say(s){this.log.push(`R${this.round} · ${s}`);}
    order(){return this.players.map((_,i)=>(i+this.dealer)%this.players.length);}
    marketSize(){return this.players.length===3?2:3;}
    beginRound(){
      this.market=[];
      while(this.market.length<this.marketSize()){
        if(!this.objects.length){if(!this.removed.length)break;this.objects=this.shuffle(this.removed);this.removed=[];this.stats.objectReshuffles++;this.say('Il Mazziere rimescola gli Oggetti scartati.');}
        this.market.push(this.objects.shift());
      }
      this.bids=this.players.map(()=>[]); this.targets=this.players.map(()=>null); this.committed=this.players.map(()=>false); this.cancelled=[]; this.ranking=null; this.witch=this.players.map(()=>false);
      this.players.forEach(p=>p.copied=null); this.phase='bid'; this.queue=this.order();this.actor=this.queue.shift();this.say('Il mercato apre. Puntate coperte.');
    }
    power(i){const p=this.players[i];return p.copied || (!p.used?p.role:null);}
    use(i){const p=this.players[i];if(p.copied)p.copied=null;else p.used=true;}
    card(i,id){return this.players[i].hand.find(c=>c.id===id);}
    discard(i,ids){const p=this.players[i]; for(const id of ids){const c=this.card(i,id);fail(c,'Carta non disponibile.');p.hand.splice(p.hand.indexOf(c),1);(c.kind==='coin'?this.coinDiscard:this.trickDiscard).push(c);}}
    total(i){return this.bids[i].reduce((n,c)=>n+(this.cancelled.includes(c.id)?0:c.kind==='double'?2:c.value),0);}
    rank(){return this.players.map((_,i)=>i).sort((a,b)=>this.total(b)-this.total(a)||((a-this.dealer+this.players.length)%this.players.length)-((b-this.dealer+this.players.length)%this.players.length));}
    act(action,data={}){
      fail(this.phase!=='over','La partita è terminata.');const i=this.actor,p=this.players[i];
      if(action==='copy'){
        fail(this.phase==='bid'&&this.power(i)==='apprentice'&&!p.used,'Non puoi copiare ora.');
        fail(Number.isInteger(data.target)&&data.target!==i&&this.players[data.target],'Scegli un altro giocatore.');p.copied=this.players[data.target].role;p.used=true;this.say(`${p.name} copia ${ROLES.find(r=>r.id===p.copied).name}.`);return;
      }
      if(this.phase==='bid'){
        fail(action==='bid','Conferma la puntata.');const ids=data.ids||[];fail(new Set(ids).size===ids.length&&ids.length<=3,'Puoi puntare da 0 a 3 carte diverse.');
        const cards=ids.map(id=>this.card(i,id));fail(cards.every(Boolean),'Carta non in mano.');
        const aggressive=cards.some(c=>['smoke','curse'].includes(c.kind));
        if(aggressive)fail(Number.isInteger(data.target)&&data.target!==i&&this.players[data.target],'Scegli il bersaglio dei Trucchi.');
        this.bids[i]=cards.map(c=>({...c}));this.targets[i]=data.target;this.committed[i]=true;if(!ids.length)this.stats.passes++;
        if(this.queue.length)this.actor=this.queue.shift();else {this.phase='fairy';this.queue=this.order();this.nextFairy();}return;
      }
      if(this.phase==='fairy'){
        fail(action==='fairy'||action==='skip','Scegli una carta aggiuntiva o passa.');
        if(action==='fairy'){
          const c=this.card(i,data.id);fail(c&&!this.bids[i].some(b=>b.id===c.id),'Scegli una carta non ancora puntata.');
          if(['smoke','curse'].includes(c.kind))fail(Number.isInteger(data.target)&&data.target!==i&&this.players[data.target],'Scegli un bersaglio.');
          if(data.target!=null)this.targets[i]=data.target;this.bids[i].push({...c});this.use(i);this.say(`${p.name} usa la Fata e aggiunge una carta.`);
        }this.nextFairy();return;
      }
      if(this.phase==='raid'){
        const cost=this.power(i)==='mage'&&data.mage?1:3;
        if(action==='bribe'){
          const ids=data.ids||[];fail(ids.length===cost&&new Set(ids).size===cost&&ids.every(id=>this.available(i).some(c=>c.id===id)),'Seleziona le carte richieste per corrompere, escluse quelle in puntata.');
          if(cost===1)this.use(i);this.discard(i,ids);this.say(`${p.name} corrompe le Guardie con ${cost} carte.`);
        }else if(action==='confiscate'){
          if(p.stash.length){const max=Math.max(...p.stash.map(o=>o.value));const o=p.stash.find(o=>o.id===data.id&&o.value===max)||p.stash.find(o=>o.value===max);p.stash.splice(p.stash.indexOf(o),1);this.removed.push(o);this.say(`${p.name}: confiscato ${o.name}.`);}
          else {fail(this.available(i).length<cost,'Puoi corrompere le Guardie.');this.discard(i,this.available(i).map(c=>c.id));this.say(`${p.name} scarta quello che ha (puntata riservata esclusa).`);}
        }else throw new Error('Scegli come affrontare la Retata.');
        p.suspicion=2;this.stats.raids++;this.nextRaid();return;
      }
      if(this.phase==='alchemist'){
        fail(action==='swap'||action==='skip','Scambia o passa.');
        if(action==='swap'){
          const a=p.stash.findIndex(o=>o.id===data.own),b=this.market.findIndex(o=>o.id===data.market);fail(a>=0&&b>=0,'Scegli un tuo oggetto e uno esposto.');
          [p.stash[a],this.market[b]]=[this.market[b],p.stash[a]];this.use(i);this.say(`${p.name} scambia un oggetto con il mercato (senza nuove Mele).`);
        }this.nextAlchemist();return;
      }
      if(this.phase==='choose'){
        fail(action==='choose','Scegli un oggetto.');const o=this.market.find(o=>o.id===data.id);fail(o,'Oggetto non disponibile.');
        if(data.witch){fail(this.power(i)==='witch','Potere non disponibile.');this.witch[i]=true;this.use(i);}
        this.market.splice(this.market.indexOf(o),1);p.stash.push(o);this.discard(i,this.bids[i].map(c=>c.id));
        const shield=this.bids[i].filter(c=>c.kind==='seal').length;const apples=this.witch[i]?0:Math.max(0,o.apples-shield);p.suspicion+=apples;this.say(`${p.name} compra ${o.name}: +${apples} Sospetto.`);
        if(p.suspicion>=6)this.startRaids([i],'choose');else this.nextChoice();return;
      }
      if(this.phase==='end'){
        if(action==='smuggle'){
          const ids=data.ids||[];const objects=ids.map(id=>p.stash.find(o=>o.id===id));fail(ids.length===3&&new Set(ids).size===3&&objects.every(Boolean)&&objects.every(o=>o.family===objects[0].family),'Scegli 3 oggetti della stessa Famiglia.');
          p.stash=p.stash.filter(o=>!ids.includes(o.id));p.caravan.push(...objects);this.stats.sets++;this.say(`${p.name} contrabbanda un set ${objects[0].family}.`);
          if(p.caravan.length>=6&&this.closingPlayer===null){this.closingPlayer=i;this.say(`${p.name} completa il secondo set: questo è l’ultimo round.`);}return;
        }
        fail(action==='done','Concludi le azioni oppure contrabbanda un set.');
        if(this.queue.length)this.actor=this.queue.shift();else if(this.closingPlayer!==null||(!this.objects.length&&!this.removed.length)){
          this.finishReason=this.closingPlayer!==null?'two-sets':'objects-exhausted';this.finalTrims=this.order().filter(j=>this.players[j].hand.length>8);this.nextFinalTrim();
        }else {this.phase='draw';this.queue=this.order();this.actor=this.queue.shift();}return;
      }
      if(this.phase==='draw'){
        fail(action==='draw'&&['coin','trick'].includes(data.kind),'Scegli 2 Monete oppure 1 Trucco.');
        const amount=data.kind==='coin'?2:1;let drawn=0;
        for(let k=0;k<amount;k++){const c=this.draw(data.kind);if(c){p.hand.push(c);drawn++;}else this.stats.emptyDraws++;}
        this.say(`${p.name} sceglie ${data.kind==='coin'?'2 Monete':'1 Trucco'} e pesca ${drawn} ${drawn===1?'carta':'carte'}.${drawn<amount?' Il mazzo e il suo scarto sono esauriti.':''}`);
        if(p.hand.length>8)this.phase='trim';else this.nextDraw();return;
      }
      if(this.phase==='trim'){
        const ids=data.ids||[];fail(action==='trim'&&ids.length===p.hand.length-8&&new Set(ids).size===ids.length&&ids.every(id=>this.card(i,id)),'Scarta esattamente l’eccesso sopra 8 carte.');this.discard(i,ids);if(this.finalTrims)this.nextFinalTrim();else this.nextDraw();return;
      }
      throw new Error('Azione non valida.');
    }
    nextFairy(){const next=this.queue.findIndex(i=>this.power(i)==='fairy'&&this.players[i].hand.some(c=>!this.bids[i].some(b=>b.id===c.id)));if(next>=0){this.actor=this.queue.splice(next,1)[0];return;}this.resolveTricks();}
    resolveTricks(){
      for(const i of this.order()) for(const c of this.bids[i]){
        const target=this.targets[i];if(c.kind==='smoke'){
          const coin=this.bids[target].filter(b=>b.kind==='coin'&&!this.cancelled.includes(b.id)).sort((a,b)=>b.value-a.value)[0];if(coin){this.cancelled.push(coin.id);this.say(`${this.players[i].name} annulla una Moneta da ${coin.value} di ${this.players[target].name}.`);}
        }
        if(c.kind==='curse'){this.players[target].suspicion++;this.say(`${this.players[i].name} maledice ${this.players[target].name}: +1 Sospetto.`);}
      }
      this.ranking=this.rank();this.say('Rivelazione: '+this.ranking.map(i=>`${this.players[i].name} ${this.total(i)}`).join(' · '));
      // Le carte puntate restano riservate fino alla scelta/pagamento.
      this.startRaids(this.order().filter(i=>this.players[i].suspicion>=6),'alchemist');
    }
    startRaids(ids,resume){this.phase='raid';this.raidQueue=ids;this.resume=resume;this.nextRaid();}
    nextRaid(){if(this.raidQueue.length){this.actor=this.raidQueue.shift();return;}if(this.resume==='alchemist'){this.phase='alchemist';this.queue=this.order();this.nextAlchemist();}else this.nextChoice();}
    nextAlchemist(){const next=this.queue.findIndex(i=>this.power(i)==='alchemist'&&this.players[i].stash.length&&this.market.length);if(next>=0){this.actor=this.queue.splice(next,1)[0];return;}this.choiceQueue=this.ranking.filter(i=>this.bids[i].length);this.nextChoice();}
    nextChoice(){
      this.phase='choose';
      if(this.choiceQueue.length&&this.market.length){this.actor=this.choiceQueue.shift();return;}
      this.removed.push(...this.market);this.market=[];
      const last=this.ranking.at(-1),first=this.ranking[0];
      if(this.power(last)==='thief'&&this.players[first].hand.length){this.phase='thief';this.actor=last;return;}
      this.startEnd();
    }
    steal(use){const i=this.actor;fail(this.phase==='thief','Non puoi rubare ora.');if(use){const p=this.players[this.ranking[0]],j=Math.floor(this.random()*p.hand.length);this.players[i].hand.push(p.hand.splice(j,1)[0]);this.use(i);this.say(`${this.players[i].name} ruba una carta al primo.`);}this.startEnd();}
    startEnd(){this.phase='end';this.queue=this.order();this.actor=this.queue.shift();}
    draw(kind){
      const take=(k)=>{const pile=k==='coin'?'coins':'tricks',discard=k==='coin'?'coinDiscard':'trickDiscard';if(!this[pile].length&&this[discard].length){this[pile]=this.shuffle(this[discard]);this[discard]=[];}return this[pile].pop();};
      return take(kind);
    }
    nextDraw(){if(this.queue.length){this.phase='draw';this.actor=this.queue.shift();}else{this.round++;this.dealer=(this.dealer+1)%this.players.length;this.beginRound();}}
    nextFinalTrim(){if(this.finalTrims.length){this.phase='trim';this.actor=this.finalTrims.shift();return;}this.phase='over';this.say(this.finishReason==='two-sets'?'Il mercato chiude: completato il secondo set. Si contano i punti.':'Il mercato chiude: tutti gli Oggetti sono nelle collezioni e gli scarti sono vuoti. Si contano i punti.');}
    score(i){const p=this.players[i];return p.stash.reduce((n,o)=>n+o.value,0)+2*p.caravan.reduce((n,o)=>n+o.value,0)-(p.suspicion>=4?2:0);}
    standings(){return this.players.map((p,i)=>({i,name:p.name,score:this.score(i),suspicion:p.suspicion})).sort((a,b)=>b.score-a.score||a.suspicion-b.suspicion);}
    available(i){const reserved=this.phase==='raid'&&this.resume==='alchemist'?this.bids[i].map(c=>c.id):[];return this.players[i].hand.filter(c=>!reserved.includes(c.id));}
    botStep(){
      const i=this.actor,p=this.players[i],power=this.power(i),low=[...this.available(i)].sort((a,b)=>a.value-b.value);
      const target=this.players.map((q,j)=>({j,s:this.score(j),suspicion:q.suspicion})).filter(q=>q.j!==i).sort((a,b)=>b.s-b.s||b.suspicion-a.suspicion)[0].j;
      if(this.phase==='bid'){
        if(power==='apprentice'&&!p.used){const t=this.players.findIndex((q,j)=>j!==i&&q.role==='witch');if(t>=0){this.act('copy',{target:t});return;}}
        // Décision prise sans lire les mains ou les offres adverses.
        const sorted=[...p.hand].sort((a,b)=>(b.kind==='double'?2:b.value)-(a.kind==='double'?2:a.value));const max=p.hand.length>5?3:Math.min(2,p.hand.length);const n=this.random()<0.1?0:max;
        this.act('bid',{ids:sorted.slice(0,n).map(c=>c.id),target});return;
      }
      if(this.phase==='fairy'){const c=low.filter(c=>!this.bids[i].some(b=>b.id===c.id)).at(-1);if(c&&this.total(i)<=Math.max(...this.players.map((_,j)=>this.total(j))))this.act('fairy',{id:c.id,target});else this.act('skip');return;}
      if(this.phase==='raid'){
        const mage=power==='mage',cost=mage?1:3;
        if(low.length>=cost&&(mage||!p.stash.length||Math.max(...p.stash.map(o=>o.value))>=3))this.act('bribe',{ids:low.slice(0,cost).map(c=>c.id),mage});
        else this.act('confiscate');return;
      }
      if(this.phase==='alchemist'){
        const own=[...p.stash].sort((a,b)=>a.value-b.value)[0],best=[...this.market].sort((a,b)=>b.value-a.value)[0];
        if(best&&own&&best.value>own.value)this.act('swap',{own:own.id,market:best.id});else this.act('skip');return;
      }
      if(this.phase==='choose'){
        const utility=o=>o.value+3*p.stash.filter(x=>x.family===o.family).length-(p.suspicion+o.apples>=6?3:0);
        const o=[...this.market].sort((a,b)=>utility(b)-utility(a))[0];this.act('choose',{id:o.id,witch:power==='witch'&&o.apples>=2});return;
      }
      if(this.phase==='thief'){this.steal(true);return;}
      if(this.phase==='end'){
        const set=FAMILIES.map(f=>p.stash.filter(o=>o.family===f.id)).find(a=>a.length>=3);if(set){this.act('smuggle',{ids:set.slice(0,3).map(o=>o.id)});return;}
        this.act('done');return;
      }
      if(this.phase==='draw'){const coinCount=this.coins.length+this.coinDiscard.length,trickCount=this.tricks.length+this.trickDiscard.length;this.act('draw',{kind:coinCount&&(this.random()<0.7||!trickCount)?'coin':'trick'});return;}
      if(this.phase==='trim'){this.act('trim',{ids:low.slice(0,p.hand.length-8).map(c=>c.id)});return;}
    }
    toJSON(){return {...this,version:2};}
    static restore(data){fail(data?.version===2&&Array.isArray(data.players)&&data.players.length>=3&&data.players.length<=6,'Salvataggio incompatibile con le regole 0.5: inizia una nuova partita.');return Object.assign(Object.create(Game.prototype),data);}
  }
  const api={Game,FAMILIES,OBJECTS,TRICKS,ROLES};if(typeof module!=='undefined')module.exports=api;root.Mercato=api;
})(typeof globalThis!=='undefined'?globalThis:this);
