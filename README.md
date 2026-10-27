# Il Mercato Nero delle Fiabe

Prototipo digitale giocabile, in italiano, del gioco di carte. Basato sul PDF «Il Mercato Nero delle Fiabe – Regole v0.2», che nel corpo descrive la **versione 0.4**. Nessun framework, dipendenza JavaScript, account, CDN o font remoto.

## Giocare

Apri `index.html` in un browser moderno. I file `index.html`, `style.css`, `game.js` e `app.js` devono restare nella stessa cartella. Questa modalità non richiede Internet; la persistenza di `localStorage` su `file://` dipende dal browser. Il Chromium gestito dell’ambiente blocca l’apertura di file locali per policy: qui la verifica effettiva è stata svolta usando il server locale e poi disattivando la rete.

Modalità consigliata per sviluppo e cache offline:

```sh
cd /workspace/MercatoNero
python3 -m http.server 8000 --bind 127.0.0.1
```

Apri l’indirizzo del server nel tuo browser. Alla prima apertura il service worker memorizza l’app; dopo l’attivazione puoi giocare e ricaricare anche offline, mantenendo lo stesso indirizzo. Per installarla su un dominio, servi questi file via HTTPS. Il server Python è destinato allo sviluppo locale. Nessun backend necessario.

- **Tu + avversari automatici:** una persona e 2–5 bot euristici. Non leggono mani o puntate coperte altrui.
- **Stesso dispositivo:** 3–6 persone si passano il dispositivo. Una schermata copre il tavolo prima di ogni cambio di giocatore. I nomi sono predefiniti.
- **Salvataggio:** automatico a ogni azione, nel browser. «Riprendi la partita salvata» ripristina anche una fase intermedia. Nessuna sincronizzazione o cifratura: non è un sistema contro chi ispeziona il codice o lo storage.
- **Carte:** «Le carte» mostra 78 carte e permette la stampa domestica. PDF già generato: [Carte-playtest.pdf](docs/Carte-playtest.pdf).
- **Risultati:** punteggio, Retate, set e registro esportabile JSON.

## Cosa è implementato

Gioco base di 5 round per 3–6 giocatori: 30 Oggetti, composizioni esatte di Monete e Trucchi, Famiglie variabili, aste segrete, spareggi, pagamento dei soli acquirenti, quattro Trucchi, sei Ruoli una volta per partita, Sospetto, Retate, Confisca, lavaggio, scelta dei tre oggetti da contrabbandare, due mazzi e scarti separati, pesca a scelta con fallback e limite di 8 carte. La Fata può portare la puntata a quattro carte. Parità finale assoluta: vittoria condivisa.

I moduli Eventi, poteri passivi e Trucchi extra non sono implementati. Le decisioni prese per colmare le ambiguità sono esplicite nella guida dell’app e in [VALUTAZIONE.md](docs/VALUTAZIONE.md). Non è una trascrizione definitiva approvata del regolamento.

## Verifiche

Node.js 18+ per i test del motore; Python 3 per il server. Nell’ambiente corrente: Node 24.19.0, Python 3.12.14, Chromium di sistema.

```sh
npm test
node tests/simulate.js
```

Non serve `npm install`. `npm test` esegue 16 test, tra cui 400 partite complete con invarianti di conservazione delle carte. `simulate.js` esegue altre 2.000 partite (500 per numerosità); risultato conservato in [SIMULAZIONI.json](docs/SIMULAZIONI.json). Sono prove software ed esplorazioni euristiche, non playtest umani.

Test browser opzionale con Playwright Python e Chromium già installati nell’ambiente, mentre il server è attivo:

```sh
python3 tests/browser_smoke.py
```

Verifica: partita completa offline, ricarica offline della partita e dei risultati, catalogo di 78 carte, passaggio delle mani, assenza di overflow a 390 px, errori JavaScript e richieste esterne. Genera screenshot e PDF in `docs/`. I rami di Ruolo non incontrati nella singola partita browser sono coperti dai test del motore; non è una matrice cross-browser.

## Struttura

| File | Scopo |
| --- | --- |
| `game.js` | Motore e dati, indipendenti dal DOM, generatore casuale riproducibile |
| `app.js` | Interfaccia, salvataggio, passaggio del dispositivo, illustrazioni SVG locali |
| `style.css` | Layout responsive, palette, focus, stampa poker 63,5 × 88,9 mm |
| `sw.js` | Cache per ricarica offline dopo la prima visita via HTTP locale o HTTPS |
| `tests/` | Test di regole, simulazioni, prova nel browser |
| `docs/VALUTAZIONE.md` | Critica delle regole e della grafica, scelte interpretative e piano di playtest |

Le illustrazioni sono cinque simboli originali di Famiglia, riusati per i relativi oggetti; le 30 battute sono proposte redazionali nuove. Grafica RGB per schermo e stampa domestica, senza font incorporati, dorsi, plance, segnalini o esecutivi CMYK. Per l’esame serve ancora un progetto editoriale completo: dettagli e priorità nel documento di valutazione.
