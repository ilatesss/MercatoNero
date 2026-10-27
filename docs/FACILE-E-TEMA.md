# Prime partite e tema scuro

Le regole 0.5 restano quelle definite dall’autrice. Questa revisione dell’interfaccia risponde a due problemi osservati dalla giocatrice: difficoltà a vincere e complessità del tavolo.

## Perché la prima partita poteva risultare difficile

I bot originali selezionano spesso le due o tre carte di valore più alto e cercano gli oggetti che completano le proprie Famiglie. Un giocatore che sceglie due Monete senza pianificare i set si confronta quindi con avversari già piuttosto ottimizzati. Il punteggio era nascosto nei dettagli e un set richiedeva tre selezioni manuali prima della conferma.

Non è possibile dedurre da una segnalazione se la causa delle sconfitte sia soltanto questa. È però un problema concreto dell’esperienza di ingresso, affrontabile senza cambiare valori o condizioni di vittoria.

## Cosa cambia

- Prima partita proposta: **3 giocatori, Facile**. È disponibile anche **Normale**, che conserva l’euristica precedente. Le partite già salvate restano Normale.
- I bot Facile scelgono di passare nel 15% delle offerte, puntano una carta nel successivo 50% e due nel restante 35%, se disponibili. Le carte sono selezionate casualmente dalla loro mano. La Fata può aggiungere una carta successivamente secondo il proprio potere.
- Nella scelta degli oggetti, il 65% delle decisioni dei bot Facile è casuale; le altre seguono l’euristica precedente. Retate, pagamento, Trucchi, Ruoli, punteggio e pesca seguono le stesse regole di tutti.
- Sul tavolo compaiono punteggi, set, sequenza del round e un aiuto contestuale basato sulle informazioni del giocatore e sulle collezioni pubbliche. Non vengono rivelate offerte o mani segrete.
- «Suggerisci puntata» propone fino a due carte, preferendo le Monete più alte; la persona può modificarle e deve confermare. «Seleziona un set disponibile» riempie le tre selezioni ma non esegue il Contrabbando senza conferma.
- Il bersaglio dei Trucchi viene richiesto soltanto se nell’offerta selezionata c’è un effetto offensivo.

## Confronto automatico, non probabilità di vittoria di una persona

`node tests/difficulty.js` confronta lo stesso giocatore sintetico contro i due livelli, usando gli stessi 500 seed per ogni numerosità. Il giocatore sintetico punta le due carte suggerite e nelle altre fasi applica l’euristica base, compresi i set e i Ruoli. Non imita tutte le incertezze di un principiante.

| Giocatori | Vittoria o parità del giocatore sintetico, Normale | Facile |
| --- | ---: | ---: |
| 3 | 18,4% | 77,0% |
| 4 | 15,2% | 64,8% |
| 6 | 3,2% | 38,0% |

Le 3.000 partite dimostrano una differenza riproducibile nella difficoltà degli avversari per quella politica. Non garantiscono una vittoria, non stimano le percentuali di una persona e non dimostrano il bilanciamento del gioco da tavolo. Dati completi in `DIFFICOLTA.json`.

## Tema scuro

Il pulsante nella barra superiore cambia sfondo, carte, pannelli, controlli e finestre di aiuto. La preferenza persiste in `localStorage`; se manca, la prima apertura segue il tema del sistema. Cambiare tema non modifica né riavvia la partita. Con storage non disponibile il cambio resta utilizzabile nella pagina corrente.

La stampa usa il tema chiaro anche se l’app è scura. La cache offline è aggiornata alla terza revisione; i salvataggi 0.5 restano compatibili. Per vedere la nuova versione serve una prima riapertura online.

## Verifiche

28 test del motore, incluse 600 partite con conservazione delle carte nei due livelli. Test del browser: partita completa e ricarica offline, persistenza del tema, assenza di overflow a 390 px in scuro, nessuna modifica alla partita durante il cambio tema, pulsanti di aiuto, contrasto dei testi principali e stampa chiara. Non è un audit completo WCAG o una prova con utenti.

Anteprime: `anteprima-scura.png`, `anteprima-tavolo-scuro.png` e `anteprima-scura-mobile.png`.
