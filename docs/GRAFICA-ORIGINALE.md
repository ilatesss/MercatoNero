# Il mercato illustrato di Ilaria Testa

La revisione grafica usa i disegni forniti dall’autrice nel PDF `Il_Mercato_Nero_delle_Fiabe_Regolamento_e_Catalogo.pdf`, senza generare nuove versioni delle illustrazioni. Colori e decorazioni dell’interfaccia riprendono i riferimenti della plancia e delle immagini mostrati in chat: viola notturno, crema, rosso lampone, rosa e oro, tende e cornici da bancarella.

## Materiale usato

Dal catalogo sono state estratte **43 immagini incorporate**, conservando i byte originali senza ritocco o ricompressione:

- 36 immagini Oggetto, dalle pagine 10–15;
- 6 carte Personaggio complete, dalle pagine 8–9;
- 1 Carovana con due spazi per i tris, dalla pagina 20.

Il file `assets/provenance.json` registra pagina, dimensioni e SHA-256 di ogni immagine. Le immagini sono risorse locali e vengono conservate dalla cache offline. Nessuna risorsa grafica è caricata da un sito esterno.

I due PDF separati `carte personaggi.pdf` e `carte oggetti.pdf` superano il limite di trasferimento di 32 MiB e non sono stati acquisiti. La versione attuale usa le immagini già incorporate nel catalogo, adatte alla visualizzazione del prototipo. Per un esecutivo ad alta risoluzione serviranno eventualmente esportazioni più piccole delle tavole originali. Le grandi illustrazioni mostrate nel messaggio sono riferimenti visivi: non sono state scaricate come file autonomi né riprodotte artificialmente.

## Nell’app

- **Home:** carte originali della Strega Furfante, del Ladro di Sogni e della Fata Ribelle in apertura; galleria di tutti e sei i Personaggi. Tende e fregio sono decorazioni vettoriali dell’interfaccia, ispirate alla plancia.
- **Oggetti:** ogni carta ha la propria illustrazione al posto delle precedenti icone di Famiglia. Cornice crema e oro e colore della Famiglia restano riconoscibili anche nel tema scuro. Nome, valore, Mele e lettera rimangono testo del browser, selezionabile e leggibile.
- **Personaggi:** carte complete nel pannello del Ruolo, miniature nel tavolo e originali nel catalogo e nella stampa. Il potere usato è indicato anche a testo; non dipende soltanto dall’immagine attenuata.
- **Carovana:** la plancia originale con due spazi compare nelle collezioni. Ogni spazio indica un tris e il suo valore; la lista testuale degli Oggetti resta disponibile.
- **Dolci Avvelenati:** sei carte visibili in un’anteprima separata del catalogo, esclusa dalla stampa del mazzo attivo e dalla partita. Non sono state introdotte nuove Famiglie nel motore.
- **Tema scuro:** viola, crema e lampone; le carte mantengono il fondo chiaro delle tavole originali. La preferenza del tema resta salvata. La stampa è chiara.

## Regole e testo delle carte

L’intervento è grafico: restano le regole 0.5 concordate in chat, compresa la modalità Facile. Nomi, battute e nomi dei Personaggi sono allineati al nuovo catalogo. Gli identificatori delle carte e dei poteri non cambiano; i vecchi salvataggi 0.5 possono essere ripresi, aggiornando soltanto i nomi e le battute degli Oggetti.

Il nuovo PDF presenta differenze di regolamento (cinque round, altre carte, altri pagamenti e pareggi). Non sono state applicate automaticamente. Anche alcuni valori stampati nelle immagini differiscono dal motore:

| Oggetto | Partita 0.5: valore / Mele | Nuovo catalogo |
| --- | --- | --- |
| Corona della Rana | 2 / 1 | 2 / 0 |
| Libro delle Ombre, Edizione Tascabile | 2 / 1 | 4 / 2 |
| Calderone Autopulente Esplosivo | 4 / 2 | 3 / 1 |

Per evitare di mostrare contemporaneamente numeri diversi, una finestra SVG visualizza la porzione illustrata di ogni immagine Oggetto, escludendo la fascia numerica originale. Il file immagine non viene modificato. I numeri stampati e visualizzati sulle carte digitali sono sempre quelli del motore 0.5. Le carte Personaggio mantengono il fronte completo: i poteri sintetici corrispondono a quelli già implementati; per il dettaglio dei tempi vale la guida della partita.

Sostituzioni nominali principali: Mela Quasi Biologica → Fuso Incantato Spuntato; Cavallo di Troia Gonfiabile → Topino Sarto della Mala; Strega Contrabbandiera → Strega Furfante; Alchimista Truffaldino → Speziale Losco; Mago Corrotto → Maga Corrotta. Non cambiano valori o poteri associati.

## Verifica

I 29 test del motore restano superati, incluse 600 partite automatiche nei due livelli. La prova nel browser verifica una partita completa offline, ricarica, immagini originali tutte disponibili senza rete, tema scuro persistente, layout a 390 px, personaggio illustrato, anteprima dei Dolci, catalogo e PDF di 78 carte attive. Le 43 immagini esportate sono confrontate con i checksum della provenienza.

Il PDF per playtest usa ora i disegni dell’autrice; rimane una stampa domestica RGB, non un esecutivo CMYK con abbondanze. La risoluzione delle illustrazioni Oggetto nel catalogo è circa 424 × 424 pixel: non va confusa con l’alta risoluzione dei file di stampa originali.
