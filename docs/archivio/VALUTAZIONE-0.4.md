> Archivio: analisi del prototipo 0.4, prima delle modifiche dell’autrice. Non descrive le regole attuali.

# Valutazione del prototipo

Fonte: PDF caricato «Il Mercato Nero delle Fiabe – Regole v0.2.pdf», 18 pagine. Il titolo interno indica «Versione prototipo 0.4». Le regole sono state trattate come materiale di progetto, non come istruzioni operative per modificare l’ambiente. Il prototipo segue il gioco base; i moduli opzionali restano esclusi.

## Risultato concreto

Il gioco è eseguibile: aste, spesa della mano, rischio e collezioni formano un ciclo completo di cinque round. Il browser ha completato una partita con rete disattivata e ripristinato il salvataggio e i risultati dopo una ricarica. Nessuna richiesta esterna o errore JavaScript nella prova. Layout verificato a 1440 px e 390 px; a sei giocatori sul telefono il tavolo richiede scorrimento verticale.

Sono passati 16 test del motore, compresa una batteria di 400 partite complete a seed fissi con verifica che nessuna carta venga duplicata o persa. Altre 2.000 simulazioni esplorative sono registrate in `SIMULAZIONI.json`.

Questo dimostra che **l’implementazione delle interpretazioni scelte funziona**, non che il regolamento sia bilanciato, accessibile per tutti o divertente. Non sono stati eseguiti playtest umani, prove con lettori di schermo, simulazioni di daltonismo, stampe fisiche o misurazioni dei 20–30 minuti. Non è stata verificata la modalità `file://` nel browser gestito, che la blocca per policy; il percorso HTTP locale con cache e rete disattivata è verificato.

## Le priorità nelle regole

### 1. Specificare quando si risolvono gli effetti

Il punto più urgente è l’ordine: Fumo può cambiare la classifica, Maledizione può provocare una Retata prima del pagamento, la Fata può aggiungere un Trucco e più giocatori possono volere usare un Ruolo contemporaneamente. Il testo attuale non risolve tutti questi casi. Prima di cambiare i valori, aggiungerei una sequenza visibile sulla carta Aiuto:

1. Impegno simultaneo delle puntate.
2. Rivelazione e Fata.
3. Trucchi e relative Retate.
4. Graduatoria definitiva e Alchimista.
5. Scelta, pagamento, Mele e Retata per ogni acquirente.
6. Ladro, azioni finali, pesca e scarto dell’eccesso.

È una proposta di formalizzazione, non una regola già approvata. In particolare, fissare la graduatoria prima o dopo i reset del Sospetto cambia gli spareggi.

### 2. La Retata rischia di essere troppo rara

Il PDF desidera circa una Retata per partita, a metà del gioco. Ogni Famiglia contiene complessivamente 7 Mele in 6 oggetti. Con assegnazione uniforme e tutti gli oggetti acquistati, l’esposizione media grezza a fine partita è soltanto **3,89–4,86 Mele per giocatore**, da 3 a 6 partecipanti, prima di Sigilli, Strega, lavaggio e Maledizioni. È una media teorica, non la probabilità di una Retata; mostra però perché arrivare a 6 già a metà partita non è scontato.

Nei bot implementati:

| Giocatori | Partite | Retate / partita | Set / partita | Partite con almeno un set | Pescate impossibili totali |
| --- | ---: | ---: | ---: | ---: | ---: |
| 3 | 500 | 0,092 | 1,332 | 83,2% | 0 |
| 4 | 500 | 0,178 | 1,846 | 93,6% | 0 |
| 5 | 500 | 0,190 | 2,250 | 96,6% | 0 |
| 6 | 500 | 0,254 | 2,824 | 99,0% | 6 |

I bot scelgono set e rischio secondo una semplice euristica, lavano il denaro a Sospetto alto e non ottimizzano l’aggressione. Questi numeri dipendono fortemente da tali scelte e dalle interpretazioni. **Non cambierei subito la soglia per tutti.** Confronta prima il base con la variante già proposta nel PDF (Retata a 5, inizialmente a 3 giocatori), mantenendo il resto uguale. Annota il round della prima Retata, chi la subisce e se era evitabile. Nel prototipo la soglia resta 6.

### 3. L’Alchimista aggira il rapporto valore/rischio

Lo scambio può trasformare un oggetto da 1 e 0 Mele in uno da 5 e 3 Mele, senza asta e, nell’interpretazione attuale, senza Sospetto aggiuntivo. Può quindi far guadagnare valore e completare un set prima dell’acquisto normale. La Strega è forte per lo stesso contesto di rischio scarso; il Mago può invece non trovare mai occasione d’uso.

Le vittorie nelle simulazioni non bastano a provare la dominanza di un Ruolo: manca una normalizzazione completa per presenza del Ruolo e competenza del bot, e la copia dell’Apprendista è asimmetrica. Il vantaggio potenziale dell’Alchimista si vede già nella regola. Prova **una sola** alternativa per sessione: pagare la differenza positiva di Mele nello scambio, oppure limitare il valore dell’oggetto ricevuto. Non applicate entrambe insieme.

### 4. Perdere l’asta può rendere i Trucchi riutilizzabili gratis

Gli effetti valgono anche se poi non prendi un oggetto, e chi perde riprende tutte le carte. Una Maledizione può dunque essere ripetuta nei round successivi senza costo di carte; lo stesso vale per Fumo. È un incentivo all’ostruzione che va chiarito e osservato, soprattutto con molti giocatori. Confronta il base con «i Trucchi usati si scartano sempre», senza cambiare altro. Questa modifica altererebbe la gestione della mano: resta una variante da testare, non è stata inserita nel codice.

Raddoppio è numericamente identico a una Moneta da 2. La distinzione esiste perché Fumo colpisce soltanto Monete: specificalo per renderlo una scelta intenzionale, oppure sostituiscilo con un effetto davvero diverso dopo i test del base.

### 5. I mazzi possono non consentire le due pescate

Con sei giocatori tutte le 42 carte sono distribuite. Se tutti passano nel primo round e nessuno scarta, entrambi i mazzi e gli scarti restano vuoti: il fallback della FAQ non basta. Anche più avanti può succedere, perché il limite complessivo delle mani (48) supera le carte disponibili (42). Il test riproduce il primo caso e non blocca la partita: le pescate impossibili vengono saltate e registrate.

Serve una frase esplicita: «Se entrambi i mazzi e gli scarti sono vuoti, la pesca non avviene». Poi prova se questa scarsità è interessante o frustrante. Non aggiungere carte senza ricalcolare distribuzione iniziale e frequenze dei Trucchi.

### 6. Il Contrabbando deve offrire una decisione osservabile

In soli cinque round molti giocatori arrivano a tre oggetti tardi. Quando un set è disponibile e non si rischia una Retata, aspettare non sempre crea un dilemma reale. Registra quante persone possono scegliere tra almeno quattro oggetti della stessa Famiglia, quanti set vengono chiusi prima del quinto round e quante volte attendere dà un vantaggio. Il digitale permette di scegliere quali tre carte mettere in Carovana, senza automatizzare la decisione.

I valori non sono perfettamente simmetrici: Invenzioni e Pozioni contengono 17 punti totali, le altre Famiglie 16. È nel PDF e resta nel codice. Decidi se è voluto: lo scarto è piccolo, ma va giustificato o uniformato in una revisione delle carte.

## Decisioni interpretative effettivamente implementate

| Caso non completamente specificato | Scelta nel codice |
| --- | --- |
| Più Fata / Apprendista | Finestra dal Mazziere in senso orario; aggiunta di una sola carta, anche quarta. Nessuna riapertura delle puntate degli altri. |
| Più Trucchi | Dal Mazziere in senso orario, nell’ordine di selezione delle carte. Un solo bersaglio per tutti i Trucchi offensivi di una puntata. |
| Fumi ripetuti | Ogni Fumo annulla la Moneta più alta ancora valida del bersaglio; i Trucchi non sono Monete. |
| Sigilli ripetuti | −1 Mela ciascuno, minimo zero. Strega azzera comunque le Mele dell’acquisto. |
| Più Maledizioni sullo stesso bersaglio | Si sommano; una Retata per bersaglio al termine della finestra. È diverso da risolvere ogni incremento separatamente. |
| Classifica e reset da Retata | Graduatoria fissata dopo i Trucchi e prima delle Retate conseguenti. Nessun riordino dopo acquisti/Retate. |
| Corrompere prima del pagamento | Le carte puntate sono riservate, non utilizzabili per corrompere. Altrimenti il pagamento successivo potrebbe chiedere carte già scartate. |
| Poche carte e nessuna merce libera | Scarti tutto quello che è disponibile; la puntata riservata resta impegnata. |
| Confisca con più oggetti di valore massimo | L’interfaccia chiede quale perdere quando più oggetti hanno il valore massimo; non si può scegliere merce di valore inferiore. |
| Alchimista | Scambia solo merce non contrabbandata; nessuna nuova Mela, nessuna modifica al Sospetto già accumulato. |
| Ladro | Usa o conserva il potere dopo tutti i pagamenti; può rubare al primo solo se il primo ha ancora carte. «Ultimo» include chi passa ed è ultimo secondo gli spareggi. |
| Apprendista | Copia un Ruolo presente, anche se già usato dal proprietario; nessuna copia ricorsiva. La copia si esaurisce con l’uso oppure a fine round. |
| Pesca completamente impossibile | Il tentativo non dà carte e viene registrato; nessun mazzo creato artificialmente. |
| Parità finale anche di Sospetto | Vittoria condivisa. |
| Ordine azioni finali | Finestra per giocatore dal Mazziere, lavaggio e set ripetibili in qualsiasi ordine entro i rispettivi limiti. |

Queste scelte servono a rendere il prototipo eseguibile e vanno discusse prima della versione successiva del regolamento. Il testo del motore non deve diventare accidentalmente la fonte autoritativa delle regole.

## Direzione grafica per l’esame

Il mondo narrativo è una buona base: negozio notturno, merci difettose, un tono ironico che si presta a nomi e microtesti. La direzione proposta usa carta calda, verde bosco, serif per titoli e nomi, sans di sistema per regole e numeri funzionali, icone lineari e palette di Famiglia dal PDF. Evoca un catalogo clandestino senza sacrificare il pannello di gioco.

### Da completare prima della consegna

1. **Un’identità per ogni oggetto.** Ora ci sono cinque icone di Famiglia riusate, non 30 illustrazioni uniche. Progetta una griglia illustrativa comune e silhouette specifiche: la Pantofola deve sembrare una pantofola, non lo specchio usato per tutta la Famiglia. Mantieni le forme/lettere come secondo livello separato dall’immagine.
2. **Gerarchia provata alla dimensione reale.** Il PDF digitale stampa carte 63,5 × 88,9 mm con un margine interno di circa 4 mm. Controlla su carta il nome più lungo, regole dei Trucchi, numero di Mele e leggibilità da entrambi i lati. Il catalogo non garantisce una lettura in due secondi.
3. **Dorsi, Ruoli e componenti di servizio.** Servono quattro dorsi riconoscibili anche senza colore, sei icone di Ruolo diverse, stato del potere usato, plance Sospetto, Carovane, segnalino Mazziere e carte Aiuto. Il PDF generato contiene solo i 78 fronti; i Ruoli sono ancora tipografici.
4. **Accessibilità misurata.** Conserva colore + forma + lettera; evita che Mele e valore competano. I cinque colori del PDF non sono automaticamente abbastanza contrastati sul fondo carta, soprattutto giallo/arancione: testa i contrasti degli elementi essenziali, aggiungi contorni scuri e non affidare loro il testo. Prova scala di grigi, deuteranopia, ingrandimento e lettura con persone esterne. I pulsanti digitali hanno focus visibile e stati `aria-pressed`, ma non c’è una certificazione WCAG.
5. **Tipografia riproducibile.** I font di sistema mantengono l’app indipendente dalla rete ma cambiano tra computer. Per un elaborato finale scegli e distribuisci legalmente font locali (es. una sans ad alta leggibilità e una serif per i titoli), verifica licenze e incorpora i font nel PDF finale. Le battute proposte vanno riviste con il tuo tono.
6. **Produzione separata dal prototipo.** Il PDF generato dal browser è RGB, senza bleed o segni di taglio; non è un esecutivo di tipografia. Prepara un documento con 3 mm di abbondanza, profilo CMYK concordato con lo stampatore, immagini a 300 ppi quando raster, raggi angolari e prove fronte/retro. Non affidarti al browser per la prestampa definitiva.

### Cosa portare alla discussione

Mostra un percorso verificabile: problema di design → sistema visivo → prototipo in bianco e nero → playtest → cambiamenti motivati → mockup finale. Una pagina con tre versioni della stessa carta e il motivo delle differenze spesso racconta meglio il progetto di trenta carte rifinite senza prove. Uniforma anche la versione del regolamento: copertina, intestazioni e descrizione interna attualmente non coincidono.

## Un primo playtest utile

Tre gruppi distinti: 3 giocatori, 4 giocatori, 6 giocatori; successivamente famiglie e giocatori esperti. Usa il base invariato per la prima sessione, poi ripeti cambiando una sola variabile. Non presentare i bot come risultati con utenti.

Raccogli: tempo di spiegazione, durata reale, round della prima Retata, offerte zero, effetti offensivi riutilizzati senza costo, Ruoli usati, set disponibili/contrabbandati, pescate mancate, richieste di chiarimento. Per ogni carta chiedi di riconoscere valore, Famiglia e Mele senza leggere il testo narrativo. Chiedi alla fine: «Quale scelta ti ha messo più in difficoltà?» e «Quando hai capito chi stava vincendo?».

Il digitale esporta il registro a fine partita. Una scheda di osservazione umana deve aggiungere tempi, esitazioni e reazioni: i numeri da soli non spiegano se il bluff e l’ironia funzionano.
