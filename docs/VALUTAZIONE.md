# Valutazione del prototipo — regole 0.5

Questa revisione applica le modifiche dell’autrice successive al PDF originale: pesca fra 2 Monete e 1 Trucco, pareggi al Mazziere, fine per secondo set, nessun lavaggio e mercato di 3 Oggetti (2 a tre giocatori). La precedente analisi e le simulazioni 0.4 sono archiviate in `docs/archivio/`: non descrivono il comportamento attuale.

## Regole effettive

Il secondo set contrabbandato fa chiudere a fine round: tutti completano le azioni finali e poi vince chi ha più punti. Non si pesca nell’ultimo round. Tre oggetti della stessa Famiglia costituiscono un set; la Carovana raddoppia i valori e protegge dalle confische. Il numero di Famiglie resta quello del PDF: 2, 3, 4 e 5 rispettivamente per 3, 4, 5 e 6 giocatori. Non è stato mantenuto il limite di cinque round.

Se il mazzo Oggetti finisce, si rimescolano gli scarti, incluse le confische, senza toccare le collezioni. Se le carte disponibili sono meno degli spazi del mercato, il mercato è più piccolo. Come concordato con l’autrice, soltanto se tutti gli Oggetti sono posseduti e mazzo e scarti sono vuoti si chiude ai punti anche senza un secondo set.

La pesca è una scelta unica: 2 Monete oppure 1 Trucco. Non si può pescare una carta per tipo o due Trucchi. Si rimescola soltanto lo scarto del tipo scelto. Se è insufficiente, si ricevono meno carte; il tipo non viene sostituito dall’altro. La mano iniziale resta 5 Monete e 2 Trucchi e il limite resta 8.

Nelle aste conta il valore dell’offerta, poi la posizione dal Mazziere in senso orario. Il Sospetto non modifica più gli spareggi delle aste. Restano la Retata a 6, il reset a 2 e la penalità di −2 a fine partita per i Ricercati. Il lavaggio del denaro è eliminato.

## Verifiche e risultati esplorativi

28 test del motore, comprese 400 partite Normale e 200 Facile complete con conservazione di tutte le carte. Test mirati per pesca 2/1, assenza del lavaggio, precedenza del Mazziere anche se Ricercato, rimescolo degli Oggetti, mercato parziale, passaggio oltre il quinto round, secondo set e chiusura solo dopo le azioni degli altri, limite 8 finale e formato dei salvataggi.

Il test nel browser copre una partita completa offline, riapertura del salvataggio e dei risultati offline, catalogo di 78 carte, passaggio privato del dispositivo e layout a 390 px. Scenari mirati verificano i pulsanti 2 Monete/1 Trucco, un solo Trucco pescato, limite della mano e secondo set a fine round. Il browser gestito continua a bloccare `file://`; la verifica effettiva usa HTTP locale e cache, poi rete disattivata.

La modalità Facile, gli aiuti e il tema scuro sono descritti in `FACILE-E-TEMA.md`. I bot non leggono mani o offerte segrete. Le 2.000 simulazioni **Normale** a seed fissi, in `SIMULAZIONI.json`, sono un’esplorazione della politica dei bot e non sostituiscono il playtest umano. Non sono stati misurati i tempi reali, il divertimento o l’accessibilità con utenti.

| Giocatori | Round medi | Retate / partita | Fine per secondo set | Fine con tutti gli Oggetti posseduti |
| --- | ---: | ---: | ---: | ---: |
| 3 | 6,208 | 0,612 | 2,0% | 98,0% |
| 4 | 6,378 | 1,118 | 6,8% | 93,2% |
| 5 | 8,098 | 1,466 | 9,6% | 90,4% |
| 6 | 10,000 | 2,042 | 14,2% | 85,8% |

### Cosa osservare adesso

1. **Il secondo set resta raro in questi bot.** Servono almeno sei acquisti, mentre una persona può comprare al massimo un oggetto per round. Con le Famiglie divise fra le collezioni, spesso il secondo set diventa impossibile anche dopo i rimescoli: gli Oggetti posseduti non tornano in mercato. È il motivo per cui la chiusura di riserva concordata è necessaria. Non è stata introdotta una regola di scambio fra persone. Osserva nei playtest se l’obiettivo è percepito come raggiungibile; prima di aggiungere scambi, valuta i risultati reali.
2. **Le Retate aumentano.** Durata più lunga e rimozione del lavaggio cambiano significativamente l’economia del Sospetto. Il valore a quattro giocatori è circa una Retata a partita con questi bot; non è una prova del momento o della qualità della tensione.
3. **A sei giocatori manca spesso la valuta del tipo desiderato.** Nelle 500 partite si contano 1.036 tentativi individuali di pesca senza carta, non 1.036 turni saltati. È un effetto della scelta esclusiva e della scarsità iniziale. Il motore registra la pesca parziale senza violare il tipo scelto. Testa se questa scarsità è interessante; non sono state aggiunte Monete al mazzo.
4. **Il Mazziere è ora un vantaggio reale nei pareggi.** La rotazione è necessaria; con durata variabile non tutti avranno lo stesso numero di turni da Mazziere. Raccogli vincitore, posto iniziale e numero di aste vinte per spareggio.
5. **Alchimista e Trucchi offensivi richiedono ancora osservazione.** Lo scambio può aumentare il valore senza nuove Mele; chi perde può riprendere un Trucco già risolto. Queste regole non sono state cambiate. Non dedurre dominanza dalle sole vittorie dei bot: copia dell’Apprendista, presenza dei Ruoli e qualità delle euristiche non sono normalizzate.

## Interpretazioni che restano nel digitale

- Trucchi dal Mazziere in senso orario e nell’ordine selezionato; un solo bersaglio per gli effetti offensivi della stessa offerta.
- Più Fumi annullano Monete diverse, mai Trucchi; più Sigilli si sommano, minimo zero Mele. Strega azzera le Mele dell’acquisto.
- Maledizioni sommate in una finestra; graduatoria fissata dopo gli effetti e prima dei reset da Retata. Una Retata per bersaglio in quella finestra.
- Carte puntate riservate fino al pagamento, non spendibili per una Retata precedente all’acquisto. Chi non ha merce e carte sufficienti scarta il disponibile.
- Fata può aggiungere una quarta carta; Apprendista può copiare un Ruolo presente anche se già usato dal proprietario, senza ricorsione.
- Alchimista scambia solo merce libera senza nuove Mele; Ladro agisce dopo i pagamenti e può conservare il potere.
- La Confisca chiede quale oggetto perdere se più oggetti liberi hanno il valore massimo.
- Chi fa chiudere la partita con il secondo set non vince automaticamente: si contano i punti. Parità finale: meno Sospetto, poi vittoria condivisa.

I moduli opzionali restano fuori dal prototipo. Le interpretazioni non espressamente decise dall’autrice restano da confermare durante i playtest.

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
