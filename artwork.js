/* Tavole originali di Ilaria Testa, estratte dal catalogo fornito. */
(() => {
  'use strict';
  const objectIds=['R','I','P','A','L','D'].flatMap(f=>Array.from({length:6},(_,i)=>f+i));
  const roles=['apprentice','witch','fairy','alchemist','thief','mage'];
  const objects=Object.fromEntries(objectIds.map(id=>[id,`assets/objects/${id}.jpeg`]));
  const roleImages=Object.fromEntries(roles.map(id=>[id,`assets/roles/${id}.jpeg`]));
  const data={objects,roles:roleImages,caravan:'assets/scenes/carovana.png'};
  globalThis.MercatoArt=data;
  if(typeof module!=='undefined')module.exports=data;
})();
