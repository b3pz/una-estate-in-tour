# Una estate in tour

Un’avventura musicale 2D di B3PZ: un ragazzo di campagna, tre amici e un’estate per arrivare al festival di settembre.

**Versione 0.1: prototipo giocabile.** Contiene una progressione compatta dall’ultimo giorno di scuola fino al festival, con otto città musicali, tre località narrative e una città finale. Le mappe sono ancora modulari e le storie brevi: non è il gioco lungo e definitivo descritto nella stesura.

## Gioca

Il gioco è statico e senza dipendenze. I file pubblicabili sono in `dist/`; percorsi relativi compatibili con GitHub Pages e hosting in sottocartella.

Per avviarlo localmente:

```bash
python3 -m http.server 8080 --directory dist
```

Apri `http://localhost:8080`. Usa un server HTTP: aprire direttamente il file con `file://` non carica i moduli JavaScript.

### Comandi

| Azione | Tastiera |
|---|---|
| Cammina | WASD / frecce |
| Parla, entra, usa | E / Invio |
| Bicicletta, dopo averla ottenuta | B |
| Mappa e ritorni nei luoghi visitati | M |
| Impostazioni | Esc |
| Chitarra / batteria | D F J K |
| Basso | D F J |
| Pausa durante il brano | Spazio |

Puoi anche fare clic o toccare il terreno per camminare; toccando una porta o una persona la raggiungi e interagisci automaticamente. Su touch sono presenti anche frecce, azione, bici e pulsanti musicali. Le note lunghe vanno tenute premute; gli accordi richiedono più tasti insieme. Impostazioni: volume, difficoltà e compensazione input manuale. La musica parte dopo un’interazione.

### Percorso

1. Scegli lo strumento. Raggiungi la scuola a nord-est e interagisci con la porta.
2. Raggiungi il garage a ovest, completa il tutorial e affronta i rivali in piazza.
3. Usa i cartelli a est per imboccare i sentieri. Avvicinati al cartello e premi E.
4. In ogni città musicale parla con l’insegnante, ripeti la frase e poi suona sul palco.
5. A Binario Nord parla con il viaggiatore per ricevere la bicicletta.
6. Da Porto del Sol raggiungi l’isola superando il concerto della nave.
7. Dopo otto pass torna a casa per il concerto di ritorno.
8. Raggiungi Settembre e affronta il festival.

La prima sfida ha una sconfitta narrativa della band: il punteggio personale è reale e viene riconosciuto nei dialoghi. Il tutorial non ha una soglia minima. Le altre prove richiedono il 50%, oppure il 35% in modalità accessibile. La mappa consente il ritorno diretto nei luoghi già scoperti.

## Contenuti presenti

- Tre strumenti con pattern differenti, note sostenute e accordi per la chitarra.
- Sfide con difficoltà, precisione, serie, errori e ripetizione immediata.
- Musica sintetizzata tramite Web Audio: nessun brano commerciale o download esterno.
- Mappe e personaggi disegnati via Canvas, senza file sprite e senza modelli 3D.
- Sentieri, incontri facoltativi, bicicletta e collegamenti ad anello.
- Prove di memoria sonora con indizi visivi e riascolto.
- Otto pass, concerto della nave, ritorno a casa e finale.
- Salvataggio locale, esportazione e importazione JSON.
- Pausa automatica quando il gioco perde il primo piano.

## Limiti della versione

Le città condividono il kit grafico e differiscono per palette, dialoghi e musica. Gli enigmi usano per ora la medesima struttura di memoria sonora. Gli interni sono rappresentati tramite dialoghi. Il livello registra i traguardi: non include ancora talenti sbloccabili. Il repertorio è procedurale e breve; la canzone componibile della band, i veri enigmi specifici, le lunghe missioni locali e gli archi dei rivali sono da sviluppare. L’epoca ’99 e tutti i nomi sono provvisori.

Le parti principali sono progettate per il ruolo dello strumento; non costituiscono un simulatore realistico. La compensazione input è manuale. Le prestazioni audio e il multitouch devono essere verificati sui dispositivi finali.

## Struttura

```text
dist/index.html     Interfaccia
dist/style.css      Layout responsive
dist/core.js        Mondo, partiture, salvataggi e progressione
dist/audio.js       Sintesi e accompagnamento
dist/game.js        Esplorazione, UI, enigmi e prove ritmiche
tests/core.test.js  Verifiche della logica
docs/PROGETTO.md    Stesura del progetto completo
```

## Verifiche

Richiede Node.js con test runner integrato. Nessuna installazione npm necessaria.

```bash
npm run check
npm test
```

## GitHub Pages

Il workflow `.github/workflows/pages.yml` verifica il codice e pubblica `dist/`. Nelle impostazioni del repository, **Pages → Source → GitHub Actions**. Per un hosting diverso è sufficiente pubblicare il contenuto di `dist/`.

I salvataggi appartengono all’origine del sito e al browser: passando da un’anteprima a GitHub Pages, usa Esporta/Importa per trasferirli.

## Sviluppo successivo

1. Validare risposta musicale e comandi sui dispositivi scelti.
2. Ampliare il paese iniziale con interni e un prologo più ricco.
3. Sviluppare una città completa prima di espandere tutte le altre.
4. Introdurre brani originali con tracce separate e partiture curate.
5. Differenziare enigmi, ritorni e crescita dei talenti.
6. Scrivere la storia estiva completa e la canzone del festival.

Nessuna licenza open source è stata scelta: il repository pubblico non concede automaticamente una licenza di riutilizzo.
