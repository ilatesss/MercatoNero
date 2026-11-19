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
- **Dolci Avvelenati:** sesta Famiglia del catalogo, ora attiva nel mazzo del nuovo regolamento e inclusa nella stampa.
- **Tema scuro:** viola, crema e lampone; le carte mantengono il fondo chiaro delle tavole originali. La preferenza del tema resta salvata. La stampa è chiara.

## Regole e testo delle carte: nuova edizione PDF

Il motore ora segue «Il Mercato Nero delle Fiabe (3).pdf», non il precedente limite di due set. I 36 Oggetti, inclusi i Dolci, sono attivi. Il mazzo stampabile comprende 114 fronti, con 24 Trucchi e 18 Bianche. I nomi operativi di alcuni Personaggi e Oggetti tornano a quelli dell’ultimo PDF; le illustrazioni originali restano quelle già estratte.

Le tavole precedenti contengono nomi alternativi: Strega Furfante/Contrabbandiera, Speziale/Alchimista e Maga/Mago. La carta A4 ha la stessa posizione e gli stessi valori, ma il nuovo PDF la chiama Cavallo di Troia Gonfiabile mentre l’illustrazione disponibile è il Topino Sarto della Mala. Questa discrepanza grafica è documentata: non è stata generata una nuova immagine al posto del disegno dell’autrice.

Una finestra SVG esclude la fascia numerica originale delle immagini Oggetto: i valori e le Mele mostrati come testo sono quelli del nuovo regolamento. I file grafici originali non sono ritoccati. I nuovi Trucchi sono carte tipografiche con simboli distinti e testo operativo, dato che il PDF caricato descrive gli effetti ma non fornisce nuove tavole grafiche separate.

Per provenienza, risoluzione e stampa resta valido quanto sopra. La verifica aggiornata è in [ALLINEAMENTO-PDF.md](ALLINEAMENTO-PDF.md). Il PDF stampabile è RGB per playtest e non un esecutivo CMYK.
