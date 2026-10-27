// Esplorazione euristica riproducibile, non playtest umano né prova di equità.
const {Game}=require('../game.js');
const games=500,rows=[];
for(let count=3;count<=6;count++){
  let raids=0,sets=0,withSet=0,passes=0,empty=0,score=0,roleUsed=0;const roles={};
  for(let seed=1;seed<=games;seed++){
    const g=new Game({count,seed});let steps=0;while(g.phase!=='over'&&steps++<1000)g.botStep();if(g.phase!=='over')throw Error('Partita bloccata');
    raids+=g.stats.raids;sets+=g.stats.sets;passes+=g.stats.passes;empty+=g.stats.emptyDraws;
    if(g.stats.sets)withSet++;for(const p of g.players){if(p.used)roleUsed++;}
    const top=g.standings()[0];score+=top.score;
    const winners=g.standings().filter(r=>r.score===top.score&&r.suspicion===top.suspicion);
    for(const w of winners){const role=g.players[w.i].role;roles[role]=(roles[role]||0)+1/winners.length;}
  }
  rows.push({players:count,games,raidsPerGame:+(raids/games).toFixed(3),setsPerGame:+(sets/games).toFixed(3),gamesWithSetPercent:100*withSet/games,passesPerGame:passes/games,impossibleDraws:empty,meanWinningScore:score/games,rolesUsedPercent:100*roleUsed/(games*count),roleWins:roles});
}
process.stdout.write(JSON.stringify({method:'500 seed per numerosità, stessi bot euristici per tutti; nessuna inferenza sul divertimento o sulla dominanza dei Ruoli.',results:rows},null,2)+'\n');
