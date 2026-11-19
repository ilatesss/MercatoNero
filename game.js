/* Motore indipendente dal DOM. Regole 0.5: revisione dell'autrice. */
(function (root) {
  'use strict';
  const FAMILIES = [
    {id:'R', name:'Reliquie maledette', shape:'◆', color:'#CC79A7', icon:'mirror', names:['Dente di Drago Usato','Pantofola Spaiata','Corona della Rana','Specchio Magico Adulatore','Fuso Spuntato','Anello del Troll Innamorato']},
    {id:'I', name:'Invenzioni fregatura', shape:'■', color:'#0072B2', icon:'lamp', names:['Tappeto Volante Senza Freni','Stivali delle Sette Leghe, Taglia Piccola','Lampada del Genio Scrocco','Bacchetta con Telecomando','Calderone Autopulente Esplosivo','Palla di Cristallo con Pubblicità']},
    {id:'P', name:'Pozioni truffa', shape:'●', color:'#D55E00', icon:'bottle', names:['Pozione Bellezza Scaduta','Elisir di Lunga Vita (a metà)',"Filtro d’Amore Generico",'Unguento Invisibilità Parziale','Veleno di Cortesia','Pozione Gigante Taglia Unica']},
    {id:'A', name:'Animali parlanti difettosi', shape:'▲', color:'#E69F00', icon:'cat', names:['Grillo Parlante Muto','Lupo Cattivo Vegano',"Gallina dalle Uova d’Ottone",'Asino Oracolo, Sbaglia Sempre','Cavallo di Troia Gonfiabile','Drago da Compagnia Non Ancora Addestrato']},
    {id:'L', name:'Libri maledetti', shape:'★', color:'#009E73', icon:'book', names:['Segnalibro Ipnotico','Dizionario dei Sortilegi Sbagliati','Libro delle Ombre, Edizione Tascabile','Atlante del Regno Non Aggiornato','Grimorio con Clausole in Piccolo','Enciclopedia Proibita in 12 Volumi']},
    {id:'D',name:'Dolci Avvelenati',shape:'⬡',color:'#56B4E9',icon:'sweet',names:['Biscotto della Sfortuna','Caramella della Verità','Torta di Noncompleanno','Pan di Zenzero Recidivo','Cupcake della Strega','Casetta di Marzapane Ipotecata']}
  ];
  const JOKES = [["Il drago lo rivuole indietro. Ma prima vuole lo scontrino.", "Il principe cerca l’altra da trent’anni. Nessuna fretta.", "Baciata cento volte. Ancora rana, ma con più debiti.", "Sei il più bello del reame. Pagando, ovvio.", "Non punge più nessuno. Dice lui.", "Se lo infili vi siete fidanzati. Il troll ha già prenotato."], ["Decolla in un secondo. Atterra quando decide il muro.", "Sette leghe a passo. Le dita restano a casa.", "Tre desideri a rate. Il primo è rimborsare il genio.", "Fa ogni magia. Ma prima cerca il telecomando.", "Si pulisce da solo. Insieme alla cucina. E al vicinato.", "Vedi il futuro. Dopo questo breve messaggio del Re."], ["Scaduta da secoli. Ti rende bello come una muffa.", "Vivi per sempre. Ma solo di mercoledì.", "Ti fa innamorare di chiunque. Di solito, del cameriere.", "Ti vedono tutti tranne l’ombra. Ottimo affare.", "Uccide con garbo. Prima chiede se hai fretta.", "Cresci di tre metri. Il vestito no. Il Re neanche."], ["Ha una coscienza pulitissima. Perché non dice mai niente.", "Soffia sulla casa. Poi ti chiede scusa e porta l’insalata.", "Ottime per i dentisti. Pessime per la frittata.", "Predice il futuro con totale sicurezza. E zero risultati.", "Dentro ci sono tre soldati. Dovrebbero bastare.", "Fa le fusa. Ma anche la brace. Sul divano."], ["Chi lo guarda ricomincia da pagina uno. Ogni volta.", "Ogni parola ha un significato. Mai quello giusto.", "Le ombre sono piccole. Le maledizioni, purtroppo, no.", "Il ponte c’è. Anzi no. Anzi: è nel fiume.", "Hai firmato anche l’anima. Pagina nove, riga tre, microscopica.", "Dodici volumi vietati. Il sette, davvero, evitalo."], ["Il biglietto dice: “Ti avevo avvisato”. Nessuno ascolta.", "Ogni leccata, un segreto. Il tuo, il suo, quello del vicino.", "Candela spenta. Auguri a chi non li merita.", "Evaso di nuovo. Stavolta con il sacco e il passaporto.", "Glassa di pesca, mano di strega. Nessuno ha chiesto spiegazioni.", "Casa di dolci, mutuo amaro. La banca ha già assaggiato."]];
  const OBJECTS = FAMILIES.flatMap((f,k)=>f.names.map((name,i)=>({id:f.id+i, family:f.id, name, value: i===1 && ['I','P'].includes(f.id)?2:[1,1,2,3,4,5][i], apples:[0,0,1,1,2,3][i], joke:JOKES[k][i]})));
  const TRICKS = [
    {kind:'double',name:'Raddoppio',value:1,icon:'×2',text:'Raddoppia una Moneta della tua puntata.'},
    {kind:'smoke',name:'Fumo negli Occhi',value:2,icon:'≋',text:'Annulla la Moneta più alta di un avversario.'},
    {kind:'seal',name:'Sigillo Anti-Guardie',value:2,icon:'◇',text:'L’oggetto che prendi ha 1 Mela in meno.'},
    {kind:'curse',name:'Maledizione Leggera',value:1,icon:'+1',text:'Un avversario sale di 1 Sospetto dopo il pagamento.'},
    {kind:'light',name:'Mano Leggera',value:1,icon:'⇥',text:'Hai la precedenza nei pareggi di questo round.'},
    {kind:'whisper',name:'Soffiata',value:1,icon:'!',text:'Un oggetto esposto ha 1 Mela in più. Non cumulabile.'},
    {kind:'tip',name:'Resto mancia',value:1,icon:'↶',text:'Se perdi l’asta, riprendi questa carta.'},
    {kind:'laundry',name:'Lavanderia Magica',value:2,icon:'−1',text:'Il tuo Sospetto scende di 1 dopo il pagamento.'}
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
      const count=config.count??4;
      fail(Number.isInteger(count)&&count>=3&&count<=6,'Servono da 3 a 6 giocatori.');
      this.seed=(config.seed??Date.now())>>>0;this.round=1;this.dealer=0;this.mode=config.mode??'solo';
      this.difficulty=config.difficulty??'normal';fail(['easy','normal'].includes(this.difficulty),'Difficoltà non valida.');
      this.log=[];this.stats={raids:0,sets:0,passes:0,emptyDraws:0};this.finishReason=null;
      const roles=this.shuffle([...ROLES]);
      this.players=Array.from({length:count},(_,i)=>({name:(config.names?.[i]||(i===0?'Tu':['Morgana','Gatto Cassiere','Rospino','Madama Ombra','Ser Merluzzo'][i-1])).slice(0,24),bot:this.mode==='solo'&&i>0,role:roles[i].id,used:false,copied:null,hand:[],blanks:Array.from({length:3},(_,j)=>({id:`b${i}-${j}`,kind:'blank',name:'Carta Bianca',value:0})),stash:[],caravan:[],suspicion:0}));
      this.coins=this.shuffle([1,2,3,4].flatMap((v,i)=>Array.from({length:[12,10,5,3][i]},(_,j)=>({id:`c${v}-${j}`,kind:'coin',name:'Moneta',value:v}))));
      this.tricks=this.shuffle(TRICKS.flatMap(t=>Array.from({length:3},(_,j)=>({...t,id:`${t.kind}-${j}`}))));
      this.coinDiscard=[];this.trickDiscard=[];this.removed=[];
      this.families=this.shuffle(FAMILIES.map(f=>f.id)).slice(0,count===3?2:count);
      this.objects=this.shuffle(OBJECTS.filter(o=>this.families.includes(o.family)).map(o=>({...o})));
      this.players.forEach(p=>{for(let k=0;k<5;k++)p.hand.push(this.coins.pop());for(let k=0;k<2;k++)p.hand.push(this.tricks.pop());});
      this.beginRound();
    }
    random(){let t=this.seed+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;}
    shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(this.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
    say(text){this.log.push(`R${this.round} · ${text}`);}
    order(){return this.players.map((_,i)=>(i+this.dealer)%this.players.length);}
    marketSize(){return this.players.length-1;}
    beginRound(){
      this.market=this.objects.splice(0,this.marketSize());
      this.bids=this.players.map(()=>[]);this.committed=this.players.map(()=>false);this.purchases=this.players.map(()=>null);
      this.cancelled=[];this.doubled=[];this.tipped=[];this.witch=this.players.map(()=>false);this.effectTargets={};
      this.paymentComplete=false;this.ranking=null;this.effect=null;this.finalTrims=null;
      this.players.forEach(p=>p.copied=null);this.phase='bid';this.queue=this.order();this.actor=this.queue.shift();this.say('Il mercato apre. Puntate coperte da 1 a 3 carte.');
    }
    power(i){const p=this.players[i];return p.copied||(!p.used?p.role:null);}
    use(i){const p=this.players[i];if(p.copied)p.copied=null;else p.used=true;}
    card(i,id){return this.players[i].hand.find(c=>c.id===id);}
    bidCard(i,id){return this.card(i,id)||this.players[i].blanks.find(c=>c.id===id);}
    putDiscard(c){(c.kind==='coin'?this.coinDiscard:this.trickDiscard).push(c);}
    discard(i,ids){const p=this.players[i];fail(new Set(ids).size===ids.length&&ids.every(id=>this.card(i,id)),'Carte non disponibili.');for(const id of ids){const c=this.card(i,id);p.hand.splice(p.hand.indexOf(c),1);this.putDiscard(c);}}
    commit(i,cards){this.bids[i].push(...cards);this.players[i].hand=this.players[i].hand.filter(c=>!cards.some(b=>b.id===c.id));}
    participating(i){return this.bids[i].some(c=>c.kind!=='blank');}
    total(i){return this.bids[i].reduce((n,c)=>n+(this.cancelled.includes(c.id)?0:c.value*(c.kind==='coin'&&this.doubled.includes(c.id)?2:1)),0);}
    rank(){const priority=i=>this.bids[i].some(c=>c.kind==='light')?1:0;return this.players.map((_,i)=>i).sort((a,b)=>this.total(b)-this.total(a)||priority(b)-priority(a)||this.players[a].suspicion-this.players[b].suspicion||((a-this.dealer+this.players.length)%this.players.length)-((b-this.dealer+this.players.length)%this.players.length));}
    applesFor(i,o){return this.witch[i]?0:Math.max(0,o.apples+(this.tipped.includes(o.id)?1:0)-this.bids[i].filter(c=>c.kind==='seal').length);}
    act(action,data={}){
      fail(this.phase!=='over','La partita è terminata.');const i=this.actor,p=this.players[i];
      if(action==='copy'){
        fail(this.phase==='bid'&&this.power(i)==='apprentice'&&!p.used,'Non puoi copiare ora.');
        fail(Number.isInteger(data.target)&&data.target!==i&&this.players[data.target],'Scegli un altro giocatore.');p.copied=this.players[data.target].role;p.used=true;this.say(`${p.name} copia ${ROLES.find(r=>r.id===p.copied).name}.`);return;
      }
      if(this.phase==='bid'){
        const ids=data.ids||[];fail(action==='bid'&&ids.length>=1&&ids.length<=3&&new Set(ids).size===ids.length,'Punta da 1 a 3 carte diverse. Per passare usa le Bianche.');
        const cards=ids.map(id=>this.bidCard(i,id));fail(cards.every(Boolean),'Carta non disponibile.');this.commit(i,cards);this.committed[i]=true;
        if(!this.participating(i))this.stats.passes++;
        if(this.queue.length)this.actor=this.queue.shift();else {this.phase='fairy';this.queue=this.order();this.nextFairy();}return;
      }
      if(this.phase==='fairy'){
        fail(action==='fairy'||action==='skip','Aggiungi una carta oppure conserva il potere.');
        if(action==='fairy'){const c=this.card(i,data.id);fail(c&&c.kind!=='blank','La Fata aggiunge una Moneta o un Trucco dalla mano.');const wasPass=!this.participating(i);this.commit(i,[c]);if(wasPass)this.stats.passes--;this.use(i);this.say(`${p.name} aggiunge ${c.name} con la Fata.`);}this.nextFairy();return;
      }
      if(this.phase==='trick'){
        fail(action==='resolve','Risolvi il Trucco.');const c=this.effect.card;
        if(c.kind==='smoke'){
          fail(Number.isInteger(data.target)&&data.target!==i&&this.players[data.target],'Scegli un avversario.');
          const candidates=this.smokeCandidates(data.target);
          if(candidates.length){const coin=candidates.find(x=>x.id===data.coin)||(!data.coin?candidates[0]:null);fail(coin,'Scegli una delle Monete più alte ancora valide.');this.cancelled.push(coin.id);this.say(`${p.name} annulla una Moneta da ${coin.value} di ${this.players[data.target].name}.`);}
          else this.say(`${p.name}: Fumo senza effetto, il bersaglio non ha Monete valide.`);
        }else if(c.kind==='whisper'){
          const o=this.market.find(o=>o.id===data.object);fail(o,'Scegli un Oggetto esposto.');if(!this.tipped.includes(o.id))this.tipped.push(o.id);this.say(`${p.name} fa una Soffiata su ${o.name}: +1 Mela, massimo una.`);
        }else if(c.kind==='double'){
          const coin=this.doubleCandidates(i).find(x=>x.id===data.coin);fail(coin,'Scegli una tua Moneta non ancora raddoppiata.');this.doubled.push(coin.id);this.say(`${p.name} raddoppia una Moneta da ${coin.value}${this.cancelled.includes(coin.id)?', già annullata: resta 0':''}.`);
        }else if(c.kind==='curse'){
          fail(Number.isInteger(data.target)&&data.target!==i&&this.players[data.target],'Scegli un avversario.');this.effectTargets[c.id]=data.target;this.say(`${p.name} assegna una Maledizione a ${this.players[data.target].name}.`);
        }
        this.nextEffect();return;
      }
      if(this.phase==='alchemist'){
        fail(action==='swap'||action==='skip','Scambia o conserva il potere.');
        if(action==='swap'){const a=p.stash.findIndex(o=>o.id===data.own),b=this.market.findIndex(o=>o.id===data.market);fail(a>=0&&b>=0,'Scegli un tuo Oggetto libero e uno esposto.');[p.stash[a],this.market[b]]=[this.market[b],p.stash[a]];this.use(i);this.say(`${p.name} scambia un Oggetto con il mercato.`);}this.nextAlchemist();return;
      }
      if(this.phase==='choose'){
        const o=this.market.find(o=>o.id===data.id);fail(action==='choose'&&o,'Scegli un Oggetto esposto.');
        if(data.witch){fail(this.power(i)==='witch','Strega non disponibile.');this.witch[i]=true;this.use(i);}
        this.market.splice(this.market.indexOf(o),1);p.stash.push(o);this.purchases[i]=o;this.say(`${p.name} prende ${o.name}. Pagamento e Sospetto seguiranno per tutti.`);this.nextChoice();return;
      }
      if(this.phase==='raid'){
        const cost=this.power(i)==='mage'&&data.mage?1:3;
        if(action==='bribe'){const ids=data.ids||[];fail(ids.length===cost&&new Set(ids).size===cost&&ids.every(id=>this.card(i,id)),'Seleziona le carte necessarie per corrompere.');this.discard(i,ids);if(cost===1)this.use(i);this.say(`${p.name} corrompe con ${cost} carte.`);}
        else if(action==='confiscate'){
          if(p.stash.length){const max=Math.max(...p.stash.map(o=>o.value)),o=p.stash.find(o=>o.id===data.id&&o.value===max)||(!data.id?p.stash.find(o=>o.value===max):null);fail(o,'Confisca un Oggetto del valore massimo.');p.stash.splice(p.stash.indexOf(o),1);this.removed.push(o);this.say(`${p.name}: confiscato ${o.name}.`);}
          else {fail(p.hand.length<cost,'Puoi corrompere: seleziona le carte necessarie.');this.discard(i,p.hand.map(c=>c.id));this.say(`${p.name} scarta le carte rimaste.`);}
        }else throw new Error('Scegli Corruzione o Confisca.');
        p.suspicion=2;this.stats.raids++;this.nextRaid();return;
      }
      if(this.phase==='end'){
        if(action==='smuggle'){
          const ids=data.ids||[],objects=ids.map(id=>p.stash.find(o=>o.id===id));fail(ids.length===3&&new Set(ids).size===3&&objects.every(Boolean)&&objects.every(o=>o.family===objects[0].family),'Scegli 3 Oggetti della stessa Famiglia.');p.stash=p.stash.filter(o=>!ids.includes(o.id));p.caravan.push(...objects);this.stats.sets++;this.say(`${p.name} contrabbanda un tris ${objects[0].family}.`);return;
        }
        fail(action==='done','Contrabbanda oppure concludi le azioni.');
        if(this.queue.length)this.actor=this.queue.shift();else if(this.round===5){this.finishReason='five-rounds';this.finalTrims=this.order().filter(j=>this.players[j].hand.length>8);this.nextFinalTrim();}else{this.phase='draw';this.queue=this.order();this.actor=this.queue.shift();}return;
      }
      if(this.phase==='draw'){
        const options=this.drawOptions();
        if(action==='skip-draw'){fail(!options.coin&&!options.trick,'È disponibile una pesca completa.');this.stats.emptyDraws++;this.say(`${p.name}: nessuna pesca completa disponibile.`);this.finishDraw();return;}
        fail(action==='draw'&&['coin','trick'].includes(data.kind),'Scegli 2 Monete oppure 1 Trucco.');fail(options[data.kind],'Quel mazzo non basta: scegli l’altra opzione disponibile.');
        const amount=data.kind==='coin'?2:1;for(let n=0;n<amount;n++)p.hand.push(this.draw(data.kind));this.say(`${p.name} pesca ${data.kind==='coin'?'2 Monete':'1 Trucco'}.`);this.finishDraw();return;
      }
      if(this.phase==='trim'){
        const ids=data.ids||[];fail(action==='trim'&&ids.length===p.hand.length-8,'Scarta esattamente l’eccesso sopra 8.');this.discard(i,ids);if(this.finalTrims)this.nextFinalTrim();else this.nextDraw();return;
      }
      throw new Error('Azione non valida.');
    }
    nextFairy(){const next=this.queue.findIndex(i=>this.power(i)==='fairy'&&this.players[i].hand.length);if(next>=0){this.actor=this.queue.splice(next,1)[0];return;}this.startEffects('reveal');}
    smokeCandidates(i){const cards=this.bids[i].filter(c=>c.kind==='coin'&&!this.cancelled.includes(c.id));const max=Math.max(...cards.map(c=>c.value));return cards.filter(c=>c.value===max);}
    doubleCandidates(i){return this.bids[i].filter(c=>c.kind==='coin'&&!this.doubled.includes(c.id));}
    startEffects(stage){this.effectStage=stage;this.effectQueue=[];for(const kind of stage==='reveal'?['smoke','whisper','double']:['curse'])for(const i of this.order())for(const card of this.bids[i].filter(c=>c.kind===kind))this.effectQueue.push({i,card});this.nextEffect();}
    nextEffect(){
      while(this.effectQueue.length){const effect=this.effectQueue.shift();if(effect.card.kind==='double'&&!this.doubleCandidates(effect.i).length){this.say(`${this.players[effect.i].name}: Raddoppio senza Moneta disponibile.`);continue;}this.phase='trick';this.actor=effect.i;this.effect=effect;return;}
      this.effect=null;
      if(this.effectStage==='reveal'){
        this.ranking=this.rank();this.say('Graduatoria: '+this.ranking.map(i=>`${this.players[i].name} ${this.total(i)}`).join(' · '));
        const last=this.ranking.at(-1),first=this.ranking[0];
        if(this.power(last)==='thief'&&this.players[first].hand.length){this.phase='thief';this.actor=last;return;}
        this.startAlchemists();
      }else this.updateSuspicion();
    }
    steal(use){fail(this.phase==='thief','Il Ladro non può agire ora.');const i=this.actor;if(use){const p=this.players[this.ranking[0]],j=Math.floor(this.random()*p.hand.length);fail(p.hand.length,'Il primo non ha carte in mano.');this.players[i].hand.push(p.hand.splice(j,1)[0]);this.use(i);this.say(`${this.players[i].name} ruba una carta dalla mano del primo (mai le Bianche o le puntate).`);}this.startAlchemists();}
    startAlchemists(){this.phase='alchemist';this.queue=this.order();this.nextAlchemist();}
    nextAlchemist(){const next=this.queue.findIndex(i=>this.power(i)==='alchemist'&&this.players[i].stash.length&&this.market.length);if(next>=0){this.actor=this.queue.splice(next,1)[0];return;}this.choiceQueue=this.ranking.filter(i=>this.participating(i));this.nextChoice();}
    nextChoice(){
      if(this.choiceQueue.length&&this.market.length){this.phase='choose';this.actor=this.choiceQueue.shift();return;}
      this.removed.push(...this.market);this.market=[];this.payRound();this.startEffects('suspicion');
    }
    payRound(){
      fail(!this.paymentComplete,'Pagamento già risolto.');
      for(const i of this.order()){
        const p=this.players[i];let paid=0,returned=0;
        for(const c of this.bids[i]){if(c.kind==='blank')continue;if(c.kind==='tip'&&!this.purchases[i]){p.hand.push(c);returned++;}else {this.putDiscard(c);paid++;}}
        this.say(`${p.name}: scarta ${paid} carte${returned?`, riprende ${returned} Resto mancia`:''}. Le Bianche tornano disponibili.`);
      }
      this.paymentComplete=true;
    }
    updateSuspicion(){
      const delta=this.players.map((p,i)=>(this.purchases[i]?this.applesFor(i,this.purchases[i]):0)-this.bids[i].filter(c=>c.kind==='laundry').length);
      for(const bids of this.bids)for(const c of bids)if(c.kind==='curse')delta[this.effectTargets[c.id]]++;
      this.players.forEach((p,i)=>{p.suspicion=Math.max(0,p.suspicion+delta[i]);this.say(`${p.name}: Sospetto ${delta[i]>=0?'+':''}${delta[i]}, totale ${p.suspicion}.`);});
      this.raidQueue=this.order().filter(i=>this.players[i].suspicion>=6);this.nextRaid();
    }
    nextRaid(){if(this.raidQueue.length){this.phase='raid';this.actor=this.raidQueue.shift();}else{this.phase='end';this.queue=this.order();this.actor=this.queue.shift();}}
    drawOptions(){return {coin:this.coins.length+this.coinDiscard.length>=2,trick:this.tricks.length+this.trickDiscard.length>=1};}
    draw(kind){const pile=kind==='coin'?'coins':'tricks',discard=kind==='coin'?'coinDiscard':'trickDiscard';if(!this[pile].length&&this[discard].length){this[pile]=this.shuffle(this[discard]);this[discard]=[];}return this[pile].pop();}
    finishDraw(){if(this.players[this.actor].hand.length>8)this.phase='trim';else this.nextDraw();}
    nextDraw(){if(this.queue.length){this.phase='draw';this.actor=this.queue.shift();}else{this.round++;this.dealer=(this.dealer+1)%this.players.length;this.beginRound();}}
    nextFinalTrim(){if(this.finalTrims.length){this.phase='trim';this.actor=this.finalTrims.shift();return;}this.phase='over';this.say('Quinto round concluso: il mercato chiude, nessuna pesca finale.');}
    score(i){const p=this.players[i];return p.stash.reduce((n,o)=>n+o.value,0)+2*p.caravan.reduce((n,o)=>n+o.value,0)-(p.suspicion>=4?2:0);}
    standings(){return this.players.map((p,i)=>({i,name:p.name,score:this.score(i),suspicion:p.suspicion})).sort((a,b)=>b.score-a.score||a.suspicion-b.suspicion);}
    available(i){return this.players[i].hand;}
    suggestedBid(i){const cards=[...this.players[i].hand].sort((a,b)=>(a.kind!=='coin')-(b.kind!=='coin')||b.value-a.value).slice(0,2);return cards.length?cards.map(c=>c.id):[this.players[i].blanks[0].id];}
    botStep(){
      const i=this.actor,p=this.players[i],power=this.power(i),low=[...p.hand].sort((a,b)=>a.value-b.value);
      const target=this.players.map((_,j)=>j).filter(j=>j!==i).sort((a,b)=>this.score(b)-this.score(a))[0];
      if(this.phase==='bid'){
        if(power==='apprentice'&&!p.used){const other=this.players.findIndex((q,j)=>j!==i&&q.role==='witch');if(other>=0){this.act('copy',{target:other});return;}}
        const easy=this.difficulty==='easy'&&p.bot,roll=this.random(),n=easy?(roll<.15?0:roll<.65?1:2):(roll<.1?0:Math.min(p.hand.length>5?3:2,p.hand.length));
        const sorted=easy?this.shuffle([...p.hand]):[...p.hand].sort((a,b)=>b.value-a.value),cards=sorted.slice(0,n);this.act('bid',{ids:cards.length?cards.map(c=>c.id):[p.blanks[0].id]});return;
      }
      if(this.phase==='fairy'){const c=[...p.hand].sort((a,b)=>b.value-a.value)[0];if(c&&this.total(i)<=Math.max(...this.players.map((_,j)=>this.total(j))))this.act('fairy',{id:c.id});else this.act('skip');return;}
      if(this.phase==='trick'){
        const kind=this.effect.card.kind;
        if(kind==='smoke'){const victim=this.players.map((_,j)=>j).filter(j=>j!==i).sort((a,b)=>this.total(b)-this.total(a))[0];this.act('resolve',{target:victim,coin:this.smokeCandidates(victim)[0]?.id});}
        else if(kind==='whisper')this.act('resolve',{object:[...this.market].sort((a,b)=>b.value-a.value)[0].id});
        else if(kind==='double')this.act('resolve',{coin:[...this.doubleCandidates(i)].sort((a,b)=>Number(this.cancelled.includes(a.id))-Number(this.cancelled.includes(b.id))||b.value-a.value)[0].id});
        else this.act('resolve',{target});return;
      }
      if(this.phase==='thief'){this.steal(true);return;}
      if(this.phase==='alchemist'){const own=[...p.stash].sort((a,b)=>a.value-b.value)[0],best=[...this.market].sort((a,b)=>b.value-a.value)[0];if(best.value>own.value)this.act('swap',{own:own.id,market:best.id});else this.act('skip');return;}
      if(this.phase==='choose'){
        const utility=o=>o.value+3*p.stash.filter(x=>x.family===o.family).length-(p.suspicion+this.applesFor(i,o)>=6?3:0);
        const o=this.difficulty==='easy'&&p.bot&&this.random()<.65?this.market[Math.floor(this.random()*this.market.length)]:[...this.market].sort((a,b)=>utility(b)-utility(a))[0];this.act('choose',{id:o.id,witch:power==='witch'&&o.apples+(this.tipped.includes(o.id)?1:0)>=2});return;
      }
      if(this.phase==='raid'){const mage=power==='mage',cost=mage?1:3;if(low.length>=cost&&(mage||!p.stash.length||Math.max(...p.stash.map(o=>o.value))>=3))this.act('bribe',{ids:low.slice(0,cost).map(c=>c.id),mage});else this.act('confiscate');return;}
      if(this.phase==='end'){const set=FAMILIES.map(f=>p.stash.filter(o=>o.family===f.id)).find(a=>a.length>=3);if(set)this.act('smuggle',{ids:set.slice(0,3).map(o=>o.id)});else this.act('done');return;}
      if(this.phase==='draw'){const options=this.drawOptions();if(!options.coin&&!options.trick)this.act('skip-draw');else this.act('draw',{kind:options.coin&&(!options.trick||this.random()<.7)?'coin':'trick'});return;}
      if(this.phase==='trim')this.act('trim',{ids:low.slice(0,p.hand.length-8).map(c=>c.id)});
    }
    toJSON(){return {...this,version:3,rules:'PDF-0.5-2026-11-19'};}
    static restore(data){fail(data?.version===3&&data.rules==='PDF-0.5-2026-11-19'&&Array.isArray(data.players)&&data.players.length>=3&&data.players.length<=6,'Regolamento aggiornato: inizia una nuova partita. I vecchi salvataggi restano separati.');return Object.assign(Object.create(Game.prototype),data);}
  }
  const api={Game,FAMILIES,OBJECTS,TRICKS,ROLES};if(typeof module!=='undefined')module.exports=api;root.Mercato=api;
})(typeof globalThis!=='undefined'?globalThis:this);
