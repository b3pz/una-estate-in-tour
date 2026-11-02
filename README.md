# Una estate in tour

Un’avventura musicale 2D di B3PZ: un ragazzo di campagna, tre amici e un’estate per arrivare al festival di settembre.

**Versione 0.2: prototipo giocabile.** Contiene una progressione compatta dall’ultimo giorno di scuola fino al festival, con otto città musicali, tre località narrative e una città finale. Le mappe sono ancora modulari e le storie brevi: non è il gioco lungo e definitivo descritto nella stesura.

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

1. Segui il prologo del maestro Riva, scegli lo strumento e raggiungi la scuola a nord-est. La porta si attraversa camminando; dentro, parla con Riva premendo E.
2. Esci dalla porta in basso, raggiungi il garage a sud-ovest e parla con gli amici. Completa il tutorial e affronta i rivali in piazza.
3. Usa i cartelli a est per imboccare i sentieri. Segui la strada fino al bordo: il cambio di area è automatico.
4. In ogni città musicale parla con l’insegnante, ripeti la frase e poi suona sul palco.
5. A Binario Nord parla con il viaggiatore per ricevere la bicicletta.
6. Da Porto del Sol raggiungi l’isola superando il concerto della nave.
7. Dopo otto pass torna a casa per il concerto di ritorno.
8. Raggiungi Settembre e affronta il festival.

La prima sfida ha una sconfitta narrativa della band: il punteggio personale è reale e viene riconosciuto nei dialoghi. Il tutorial non ha una soglia minima. Le altre prove richiedono il 50%, oppure il 35% in modalità accessibile. La mappa è consultabile con M o dal menu: mostra collegamenti, posizione e luoghi visitati. Gli spostamenti avvengono nel mondo.

## Contenuti presenti

- Tre strumenti con pattern differenti, note sostenute e accordi per la chitarra.
- Sfide con difficoltà, precisione, serie, errori e ripetizione immediata.
- Musica sintetizzata tramite Web Audio: nessun brano commerciale o download esterno.
- Mappe e personaggi con forme morbide disegnate via Canvas, con tre atlas di sprite illustrati e senza modelli 3D. Il protagonista ha quattro orientamenti, anche in bicicletta.
- Sentieri, incontri facoltativi, bicicletta e collegamenti ad anello.
- Prove di memoria sonora con indizi visivi e riascolto.
- Otto pass, concerto della nave, ritorno a casa e finale.
- Salvataggio locale, esportazione e importazione JSON.
- Pausa automatica quando il gioco perde il primo piano.

## Limiti della versione

Le città condividono alcune forme grafiche, ma hanno geometrie e punti di riferimento differenti: ponte e fiume, fabbriche, stazione, teatro e giardini, mercato, accademia, montagna, porto, isola, locali notturni e area festival. Gli enigmi usano per ora la medesima struttura di memoria sonora. Gli interni sono esplorabili in forma essenziale e riutilizzano una base comune. Il livello registra i traguardi: non include ancora talenti sbloccabili. Il repertorio è procedurale e breve; la canzone componibile della band, i veri enigmi specifici, le lunghe missioni locali e gli archi dei rivali sono da sviluppare. Tutti i nomi sono provvisori.

Le parti principali sono progettate per il ruolo dello strumento; non costituiscono un simulatore realistico. La compensazione input è manuale. Le prestazioni audio e il multitouch devono essere verificati sui dispositivi finali.

## Struttura

```text
dist/index.html     Interfaccia
dist/style.css      Layout responsive
dist/core.js        Mondo, partiture, salvataggi e progressione
dist/audio.js       Sintesi e accompagnamento
dist/world.js       Geometria, portali, ingressi e disegno del mondo
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

## Revisione 0.2 — esplorazione

- Schermata di gioco unica a tutta finestra, senza pagina e taccuino laterale.
- Prologo narrativo originale con il maestro Riva prima della scelta dello strumento.
- Mappa geografica consultabile, con tutti i collegamenti e descrizioni dei luoghi.
- Passaggi automatici fra aree e porte; ingressi conservati sul bordo corretto.
- Salvataggi compatibili con la versione precedente, con supporto a sentieri e interni.
- Personaggi in quattro direzioni e ambienti più morbidi e differenziati.
- Test sulla percorribilità di ogni ingresso verso tutti gli edifici e sulla coerenza dei ritorni.

La revisione migliora esplorazione e orientamento. La scrittura completa delle città, la differenziazione degli enigmi e il repertorio musicale restano da ampliare.

## Asset illustrati

Tre tavole raster locali in `dist/assets/`: protagonista con 12 pose, amici e maestro nelle quattro direzioni, strumenti, vegetazione ed edifici delle diverse città. Il motore ritaglia le celle al momento del disegno e conserva gli originali con trasparenza. Le immagini non vengono caricate da servizi esterni. Il disegno procedurale rimane come fallback durante il caricamento e per superfici, percorsi ed effetti. La bicicletta usa ancora un disegno provvisorio. Dettagli: [direzione artistica e tavole](docs/ART_ASSETS.md).
