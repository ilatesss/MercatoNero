// Esplorazione del PDF corrente, non playtest umano.
const {Game}=require('../game.js');
const games=500,results=[];
for(let count=3;count<=6;count++){
  let raids=0,sets=0,withSet=0,passes=0,empty=0,winningScore=0,unused=0;
  for(let seed=1;seed<=games;seed++){
    const g=new Game({count,seed});let steps=0;while(g.phase!=='over'&&steps++<2000)g.botStep();
    if(g.phase!=='over'||g.round!==5)throw Error(`Partita non conclusa: ${count}/${seed}`);
    raids+=g.stats.raids;sets+=g.stats.sets;passes+=g.stats.passes;empty+=g.stats.emptyDraws;unused+=g.objects.length;winningScore+=g.standings()[0].score;if(g.stats.sets)withSet++;
  }
  results.push({players:count,games,rounds:5,raidsPerGame:raids/games,setsPerGame:sets/games,gamesWithSetPercent:100*withSet/games,passesPerGame:passes/games,skippedDraws:empty,unusedObjectsPerGame:unused/games,meanWinningScore:winningScore/games});
}
process.stdout.write(JSON.stringify({rules:'PDF-0.5-2026-11-19',method:'500 seed per numerosità, bot Normale; dati software, non playtest umani.',results},null,2)+'\n');
