# Pubblicazione con GitHub Pages

Il sito è statico e può essere pubblicato direttamente dalla radice del branch `main`. Non richiede build, variabili, chiavi o un server applicativo. Il file `.nojekyll` evita l'elaborazione Jekyll.

Nel repository GitHub `ilatesss/MercatoNero`:

1. Apri **Settings → Pages**.
2. In **Build and deployment**, scegli **Deploy from a branch**.
3. Seleziona **main** e **/(root)**, quindi **Save**.
4. Attendi il completamento della pubblicazione indicata da GitHub.

L'indirizzo previsto è `https://ilatesss.github.io/MercatoNero/`. L'indirizzo non costituisce conferma della pubblicazione: verifica che GitHub mostri il deployment riuscito e che il titolo del gioco compaia aprendo il sito.

Il service worker usa percorsi relativi, quindi funziona anche nella sottocartella `/MercatoNero/`. Dopo la prima apertura completata puoi riaprire il gioco offline nello stesso browser, purché i dati del sito non vengano cancellati. La partita resta salvata solo nel browser locale.

La pubblicazione rende accessibili i file del repository serviti da Pages: il pacchetto contiene il gioco, le istruzioni, i test, le simulazioni, le anteprime e il PDF di carte per playtest. Non contiene credenziali o il PDF originale caricato in chat.
