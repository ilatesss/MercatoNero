# Il Mercato Nero delle Fiabe

Gioco offline in italiano, con disegni di Ilaria Testa e motore aggiornato al PDF **«Il Mercato Nero delle Fiabe (3).pdf», Regolamento prototipo 0.5**. Questa edizione sostituisce le precedenti interpretazioni concordate in chat. Il PDF completo è in [docs/Regolamento-0.5.pdf](docs/Regolamento-0.5.pdf), accessibile anche da «Come si gioca».

## Aprire il gioco

Estrai **tutta** la cartella ZIP e apri `index.html` in un browser moderno. Mantieni insieme HTML, CSS, JavaScript e `assets/`. Nessun account, CDN, font remoto o dipendenza da installare. Il browser gestito dell’ambiente blocca `file://`: qui la verifica effettiva usa il server locale, poi la rete viene disattivata.

Per sviluppo:

```sh
cd /workspace/MercatoNero
python3 -m http.server 8000 --bind 127.0.0.1
```

Dopo la prima visita HTTP locale o HTTPS, la cache memorizza anche le 43 immagini e il regolamento PDF. Partita e tema sono salvati solo nel browser. La cache attuale è v5. Per ricevere un aggiornamento serve una riapertura online.

Sono disponibili **Facile** e **Normale**, tema chiaro/scuro, aiuti contestuali, suggerimento di puntata, selezione rapida dei tris e modalità locale con passaggio privato del dispositivo. La difficoltà cambia la strategia dei bot, non carte, effetti o punteggio.

## Regole applicate dal nuovo PDF

- 36 Oggetti in **6 Famiglie**, inclusi i Dolci; 30 Monete; **24 Trucchi** (8 tipi × 3); 3 Bianche per giocatore fuori dalla mano.
- Mano iniziale: 5 Monete e 2 Trucchi. Famiglie attive: 2 con 3 giocatori, altrimenti tante quanti i giocatori.
- **n−1 Oggetti per asta** e **5 round fissi**. Nessun riciclo degli Oggetti; nessuna pesca dopo il quinto round. Il secondo set non termina il gioco base.
- Puntata di **1–3 carte**: per passare si usano solo Bianche. Una puntata vera partecipa anche se Fumo la riduce a 0.
- **Tutti pagano**, anche chi perde: si scartano tutte le carte vere puntate. Eccezione: **Resto mancia torna soltanto a chi perde**. Bianche sempre restituite, mai rubate o scartate.
- Rivelazione: Fata, poi Fumo, Soffiata e Raddoppio, dal Mazziere in senso orario. I Trucchi aggiungono anche il proprio valore all’offerta.
- Pareggi: **Mano Leggera**, poi meno Sospetto, infine ordine dal Mazziere.
- Scelta degli Oggetti, poi pagamento per tutti, poi aggiornamento simultaneo del Sospetto con Mele, Maledizioni e Lavanderie, infine eventuali Retate e Contrabbando.
- Mele dell’acquisto: Soffiata (+1 massimo), Sigilli (−1 ciascuno, minimo 0), Strega (azzera). Nessun lavaggio con scarti della mano.
- Pesca: **2 Monete oppure 1 Trucco**. Se mazzo e scarto non bastano si sceglie l’altra opzione. Limite 8, senza Bianche.

Gli otto Trucchi sono Raddoppio, Fumo negli Occhi, Sigillo Anti-Guardie, Maledizione Leggera, Mano Leggera, Soffiata, Resto mancia e Lavanderia Magica. I bersagli si scelgono nel momento dell’effetto; il tavolo evidenzia le Soffiate e le Monete annullate/raddoppiate. Le offerte coperte mostrano dorsi uguali per Monete e Bianche, diversi per i Trucchi.

Il salvataggio ora è **v3**, distinto da quelli precedenti: occorre iniziare una nuova partita. I salvataggi v1/v2 non vengono cancellati o convertiti applicando regole incompatibili.

## Carte e materiali

«Le carte» mostra e stampa **114 fronti**: 36 Oggetti, 30 Monete, 24 Trucchi, 18 Bianche e 6 Ruoli. [PDF per playtest](docs/Carte-playtest.pdf). Grafica RGB per stampa domestica, non esecutivo CMYK con abbondanze.

Gli originali dell’autrice restano in `assets/`, con pagina e checksum in `assets/provenance.json`. Il PDF grafico precedente contiene alcuni nomi e valori diversi: le regole e i numeri operativi sono quelli dell’ultimo regolamento. Provenienza e limiti: [GRAFICA-ORIGINALE.md](docs/GRAFICA-ORIGINALE.md).

## Verifiche

Node.js 18+ per il motore, Python 3 per il server; non serve `npm install`.

```sh
npm test
node tests/simulate.js
node tests/difficulty.js
```

**30 test**, inclusi 800 giochi nei due livelli con controllo di tutte le carte vere, delle Bianche e degli Oggetti, senza blocchi. Casi mirati per ciascun Trucco, ordine dei pagamenti, aggiornamento simultaneo, pareggi, Ruoli, fine del quinto round e salvataggi.

Con server attivo, Playwright Python e Chromium già disponibili nell’ambiente:

```sh
python3 tests/browser_smoke.py
```

Il test verifica partita e ricarica offline, grafica e PDF senza rete, 114 carte, Bianche, privacy, tema persistente, layout a 390 px, Fata e comandi di Fumo/Soffiata/Raddoppio/Maledizione. Rigenera anteprime e PDF in `docs/`.

Le 2.000 simulazioni Normale sono in `SIMULAZIONI.json`; il confronto dei livelli in `DIFFICOLTA.json`. Sono dati di bot, non playtest umani. Risultati delle versioni precedenti in `docs/archivio/`.

La verifica puntuale fra PDF e codice è in [ALLINEAMENTO-PDF.md](docs/ALLINEAMENTO-PDF.md), incluse le poche interpretazioni necessarie per casi non definiti completamente. GitHub Pages: [istruzioni](docs/PUBBLICAZIONE.md).
