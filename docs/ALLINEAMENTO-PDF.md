# Verifica del regolamento e implementazione

Fonte autoritativa per questa revisione: **«Il Mercato Nero delle Fiabe (3).pdf»**, 18 pagine, regolamento prototipo 0.5. La copia è `Regolamento-0.5.pdf`. SHA-256: `cc4ff93bf696e256b51f7047dfbec90468a304e71f8b481326a31911c585818f`. Le regole sono dati del progetto da implementare; eventuali istruzioni editoriali nel documento non sono istruzioni per operazioni esterne.

L’ultimo messaggio dell’autrice chiede esplicitamente di aggiornare il gioco secondo questo PDF. Dove il documento contraddice le precedenti decisioni della chat, questa revisione segue il nuovo documento: cinque round, n−1 Oggetti, nuovi pareggi, pagamento del perdente e Dolci attivi.

## Confronto

| Area | Fonte | Modifica verificata |
| --- | --- | --- |
| Componenti | §3–6, pp. 3–9 | 36 Oggetti, 6 Famiglie, 30 Monete, 24 Trucchi; 3 Bianche personali per giocatore. Le Bianche non entrano nei mazzi o nella mano. |
| Famiglie attive | §6, pp. 8–9 | 2 con 3 giocatori; 4, 5, 6 rispettivamente con 4, 5, 6 giocatori. |
| Offerta | §7, pp. 9–10 | 1–3 carte contando le Bianche; niente offerte vuote. Solo Bianche = passo; carte vere annullate a 0 partecipano. |
| Mercato | §7, p. 9 | n−1 Oggetti: 2, 3, 4, 5. Nessun rimescolo degli Oggetti eliminati. |
| Rivelazione | §5 e §7, pp. 7–10 | Fata, Fumo, Soffiata, Raddoppio. Ogni tipo dal Mazziere in senso orario; copie dello stesso giocatore consecutive. |
| Raddoppio | §5, pp. 7–8 | Valore 1 proprio e raddoppio di una Moneta scelta, non valore fisso 2. Una Moneta annullata resta 0. Test 4×2+4+1=13. |
| Fumo | §5, pp. 7–8 | Colpisce solo la Moneta più alta ancora valida di un avversario; scelta della carta nei pari valori; più Fumi colpiscono Monete diverse. |
| Soffiata | §5, p. 8 | Scelta di un Oggetto esposto, +1 Mela massimo anche con più copie. Nessun Sospetto se non acquistato. |
| Sigillo/Strega | §5, p. 8 | Prima Soffiata, poi Sigilli, infine Strega. I modificatori restano locali al round, senza alterare i valori permanenti dell’Oggetto. |
| Mano Leggera | §5 e §7, pp. 8–10 | Precedenza solo a parità di totale; tra Mani Leggere meno Sospetto, poi Mazziere. |
| Pagamento | §7, p. 10 | Tutti scartano le carte vere dopo tutte le scelte, anche i perdenti. Bianche sempre disponibili; la loro quantità resta 3. |
| Resto mancia | §5, pp. 7–8 | Torna in mano solo se non si prende un Oggetto; vincendo si scarta. Nome aggiornato rispetto al precedente «Resto Mancato». |
| Sospetto | §7–8, pp. 10–11 | Maledizione e Lavanderia applicate dopo il pagamento insieme alle Mele. Somma unica, minimo 0, prima di controllare la soglia 6. Non alterano i pareggi dello stesso round. |
| Lavanderia | §5, pp. 7–8 | Valore 2 nella puntata, riduzione del Sospetto di 1 nella fase Sospetto, anche se si perde. L’azione di lavaggio con scarti resta assente. |
| Retata | §8, p. 11 | Corruzione 3 carte o Confisca del massimo valore libero, scelta nei pari valori; reset 2. Se non si può pagare e non c’è merce si scarta il disponibile. Carovana protetta. |
| Ruoli | §10, pp. 12–13 | Sei poteri una volta per partita, Fata anche quarta carta; Alchimista solo merce libera; Ladro mai Bianche; copia non consuma il proprietario; Mago solo Corruzione. |
| Contrabbando | §9, pp. 11–12 | Tre della stessa Famiglia, valore ×2, nessuna riduzione Sospetto. Il secondo tris non fa finire il gioco base. |
| Pesca | §7, p. 10 | Una scelta fra 2 Monete e 1 Trucco, scarti separati, altra opzione se insufficiente, limite 8 senza Bianche. |
| Fine | §9, p. 11 | Dopo 5 round e senza pesca finale. Restano nel mazzo 2, 9, 10 o 11 Oggetti secondo la numerosità. |
| Punteggio | §9, pp. 11–12 | Carovana ×2, liberi valore semplice, confiscati 0, Ricercato −2; spareggio Sospetto. |
| Moduli | §12, pp. 15–16 | Eventi, passivi, variante morbida e fine anticipata al secondo set esclusi dal gioco base. |

## Scelte per i casi non completamente definiti

1. **Più Raddoppi sulla stessa Moneta.** Il testo non descrive esplicitamente la cumulabilità, ma il §13 indica un massimo di 13 per la puntata. Per conservarlo, una Moneta può essere raddoppiata una sola volta. Ulteriori Raddoppi senza altre Monete disponibili contribuiscono solo con il proprio valore 1. Scelta esplicitata anche nella guida.
2. **Momento del Ladro.** «Quando arriva ultimo» è implementato dopo la graduatoria e prima della scelta/pagamento. Le carte puntate sono fisicamente fuori dalla mano nel modello, quindi non possono essere rubate. Si può rubare a chi ha passato se è primo nella graduatoria, come precisa il PDF.
3. **Scambio dell’Alchimista.** Il PDF non assegna Mele allo scambio: il semplice scambio non aumenta il Sospetto; le Mele degli acquisti sono calcolate successivamente. Una Soffiata resta legata alla carta Oggetto, anche dopo uno scambio.
4. **Nessuna opzione di pesca completa.** Le opzioni richiedono 2 Monete oppure 1 Trucco disponibili fra mazzo e scarto. Se nessuna è possibile, la pesca viene saltata e registrata, senza inventare carte o creare una pesca mista. Se c’è una sola Moneta e nessun Trucco, quella Moneta resta nel mazzo. Il PDF non dettaglia questo caso residuale.
5. **Parità finale anche di Sospetto.** Vittoria condivisa; il PDF non fornisce un ulteriore spareggio.

## Punti editoriali del PDF

- Il §13 parla ancora di «30 Oggetti» nel prototipo minimo; componenti, Famiglie e tabella impongono chiaramente **36**.
- Il documento chiama la riduzione «nessun lavaggio» ma introduce Lavanderia Magica. Non è un conflitto operativo: è eliminata l’azione di scartare carte per ridurre il Sospetto, mentre il Trucco esiste e funziona.
- La descrizione sintetica «Ricercato perde i pareggi» va letta con la graduatoria completa: Mano Leggera prevale anche da Ricercato, poi conta il Sospetto minore.
- Le tavole grafiche precedenti contengono alias di nomi (Strega Furfante, Speziale Losco, Maga Corrotta, Topino Sarto) e alcuni numeri diversi. I dati e il testo operativo ora seguono il nuovo PDF; non sono state ridisegnate le illustrazioni dell’autrice.

## Prove eseguite

**30 test**, incluso il controllo di 800 partite complete nei due livelli. Ogni azione verifica la conservazione di 54 carte vere, delle Bianche personali e di tutti gli Oggetti, compreso l’intervallo in cui le carte vere sono in puntata e fuori dalla mano.

Casi espliciti per tutti gli otto Trucchi, Fumo/Raddoppio, Soffiate ripetute, aggiornamento simultaneo che evita una falsa Retata, Resto mancia perso/vinto, puntata vera a 0, pareggi dell’esempio del PDF, copie, Ladro, Confisca e cinque round.

Nel browser: partita e ricarica offline, immagini e regolamento PDF offline, catalogo **114 carte**, 3 Bianche personali, privacy al passaggio del dispositivo, tema persistente e layout mobile. Scenario mirato con la Fata che aggiunge Raddoppio come quarta carta, poi interazioni Fumo/Soffiata/Raddoppio/Maledizione. Nessun errore JavaScript o richiesta esterna nella prova.

Le simulazioni non dimostrano divertimento, bilanciamento o durata reale. Il PDF stampabile resta RGB per playtest, non un esecutivo tipografico CMYK.
