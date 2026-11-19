/* Tavole originali di Ilaria Testa, estratte dal catalogo fornito. */
(() => {
  'use strict';
  const objectIds=['R','I','P','A','L','D'].flatMap(f=>Array.from({length:6},(_,i)=>f+i));
  const roles=['apprentice','witch','fairy','alchemist','thief','mage'];
  const objects=Object.fromEntries(objectIds.map(id=>[id,`assets/objects/${id}.jpeg`]));
  const roleImages=Object.fromEntries(roles.map(id=>[id,`assets/roles/${id}.jpeg`]));
  const sweets=[
    ['Biscotto della Sfortuna',1,0,'Ti aspetta un lieto fine. Non il tuo.'],
    ['Caramella della Verità',1,0,'Si scioglie in bocca. Come i tuoi alibi.'],
    ['Torta di Noncompleanno',2,1,'Auguri a chi non se li merita.'],
    ['Pan di Zenzero Recidivo',3,1,'È evaso dal forno. Di nuovo.'],
    ['Cupcake della Strega',4,2,'La glassa è fresca se la mano che ne esce ti afferra il dito.'],
    ['Casetta di Marzapane Ipotecata',5,3,'Il mutuo dura trent’anni e il tetto non arriva a merenda.']
  ].map(([name,value,apples,joke],i)=>({id:'D'+i,family:'D',name,value,apples,joke}));
  const data={objects,roles:roleImages,sweets,caravan:'assets/scenes/carovana.png'};
  globalThis.MercatoArt=data;
  if(typeof module!=='undefined')module.exports=data;
})();
