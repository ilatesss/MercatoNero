// Confronto riproducibile: stesso giocatore guidato contro due livelli di bot.
// Il giocatore usa due carte suggerite; nelle altre fasi segue l'euristica base.
const {Game}=require('../game.js');
const results=[];
for(const count of [3,4,6])for(const difficulty of ['normal','easy']){
  const games=500;let wins=0,shared=0,totalScore=0;
  for(let seed=1;seed<=games;seed++){
    const g=new Game({count,seed,difficulty});let steps=0;
    while(g.phase!=='over'&&steps++<5000){
      if(g.actor===0&&g.phase==='bid'){
        const target=g.players.map((_,i)=>i).filter(i=>i!==0).sort((a,b)=>g.score(b)-g.score(a))[0];
        g.act('bid',{ids:g.suggestedBid(0),target});
      }else g.botStep();
    }
    if(g.phase!=='over')throw Error('Partita bloccata');
    const top=g.standings()[0],leaders=g.standings().filter(p=>p.score===top.score&&p.suspicion===top.suspicion);
    if(leaders.some(p=>p.i===0)){if(leaders.length===1)wins++;else shared++;}totalScore+=g.score(0);
  }
  results.push({players:count,difficulty,games,outrightWins:wins,sharedWins:shared,winOrSharePercent:100*(wins+shared)/games,meanScore:totalScore/games});
}
process.stdout.write(JSON.stringify({method:'Giocatore 0: due carte suggerite, altre azioni euristiche. Stessi 500 seed per confronto, senza carte o punti regalati. Non è una stima delle probabilità di vittoria di una persona.',results},null,2)+'\n');
