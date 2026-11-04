# Una estate in tour

Un’avventura musicale 2D di B3PZ: un ragazzo di campagna, tre amici e un’estate per arrivare al festival di settembre.

**Versione 0.5: prototipo completo giocabile.** Dall’ultimo giorno di scuola al festival di settembre: dodici luoghi, otto città musicali con una prova e un concerto ciascuna, un mistero da ricostruire e un finale che cambia a seconda di quanto avete scoperto.

## Gioca

Il gioco è statico e senza dipendenze. I file pubblicabili sono in `dist/`; percorsi relativi compatibili con GitHub Pages e hosting in sottocartella.

Per avviarlo localmente:

```bash
python3 -m http.server 8080 --directory dist
```

Apri `http://localhost:8080`. Usa un server HTTP: aprire direttamente il file con `file://` non carica i moduli JavaScript.

### Comandi

Lo schermo mostra solo il mondo, come nei giochi di ruolo classici: la telecamera segue il personaggio e tutto il resto passa dal menu Start. Entrando in un luogo compare per qualche secondo il suo nome; quando cambia l’obiettivo, un breve avviso lo riassume. Un fumetto «!» segnala persone e oggetti con cui interagire.

| Azione | Tastiera | Touch |
|---|---|---|
| Cammina | WASD / frecce | croce, oppure tocca il terreno |
| Parla, entra, usa | E / Spazio / Z | A |
| Menu Start (obiettivo, mappa, Musicodex, band, bici, opzioni) | Invio / Esc | START |
| Bicicletta, dopo averla ottenuta | B | B |
| Mappa rapida | M | dal menu |
| Chitarra / batteria | D F J K | pulsanti in basso |
| Basso | D F J | pulsanti in basso |
| Pausa durante il brano | Spazio | Pausa |

### Percorso

1. Prologo con il maestro Riva e scelta dello strumento (chitarra, basso o batteria). Scuola a nord-est, poi la sala prove a sud-ovest con Nico e Vale, poi la sfida agli Alta Tensione in piazza.
2. Il viaggio: i cartelli ai bordi dei paesi portano sui sentieri. L’obiettivo in basso suggerisce sempre la tappa musicale più vicina; la mappa (M) mostra l’itinerario fisico.
3. In ogni città musicale l’insegnante propone una prova con una meccanica propria; superata la prova, il palco assegna il pass.
4. Binario Nord: due missioni di Arturo, la bici (B) e poi il pass della metro. La metro collega solo fermate già visitate; Monteferro si raggiunge in funivia da Valdaccordo; l’isola prima in traghetto da Porto del Sol, poi anche dal pontile di Notturnia.
5. Ogni prova superata dà un indizio sul plettro delle Otto Strade, sempre nell’ordine della storia. Con otto indizi, all’archivio di Valdaccordo si ricostruisce il nastro.
6. Con otto pass si torna a Borgo delle Cicale per il concerto a casa; poi il festival di Settembre, il nome della band e l’epilogo. Dopo il finale il viaggio continua.

### Le otto prove

| Città | Prova | Meccanica |
|---|---|---|
| Rivafosca | Le dodici battute scomparse | ricostruire un blues ad orecchio (feedback a punteggio, aiuti progressivi) |
| Officina | Il palco rimasto muto | collegare l’impianto; ogni errore ha la sua diagnosi (larsen, ronzio…) |
| Bellavista | Il ritornello senza casa | riconoscere strofa, ritornello, ponte e ritornello finale da frammenti anonimi |
| Grooveto | Il posto del silenzio | programmare la battuta del basso lasciando le pause giuste |
| Monteferro | La prova nella fortezza | tenere 60, 80 e 100 BPM dopo il conteggio, senza metronomo |
| Porto del Sol | Due battute per ritrovarsi | suonare dal vivo la clave son 3–2 per due giri |
| Isola Levante | Il ponte tra i battiti | distinguere battere e levare; luci per chi non sente |
| Notturnia | La risposta del club | rispondere a un motivo trasformandolo secondo tre regole |

Ogni città ha anche un brano proprio: giro armonico e pattern di chitarra, basso e batteria diversi (shuffle blues, ottavi rock, giro pop, sedicesimi funk, galoppo metal, clave, one drop reggae, swing jazz). Il festival è un medley degli otto stili. La sfida ai rivali non ha soglia; le altre prove richiedono il 50%, oppure il 35% in modalità accessibile.

## Contenuti presenti

- Tre strumenti, otto stili, accompagnamento che suona le parti reali degli altri due strumenti.
- Musicodex: 8 capacità di ascolto e 24 per strumento, completabili cambiando strumento nelle sale prove.
- Abitanti diversi per città, con battute che cambiano con i progressi; rivali che ricompaiono lungo il viaggio; un incontro e un cartello per ogni sentiero.
- Interni arredati, tutti diversi, con un dettaglio da esaminare.
- Salvataggio locale automatico (anche su sentieri e interni), esportazione e importazione JSON.
- Modalità QA per lo sviluppo: `?qa=1` (vedi sotto).

## Telefono, messaggi e percorsi (0.7)

- Il mondo non ha scritte: porte, uscite, trasporti e palchi si riconoscono dal disegno. L’unica interfaccia è il telefono (Invio, Esc o START) con le app Mappa, Note, Messaggi, Musicodex, Band, Metro, Bici, Salva e Impostazioni.
- La metro è un viaggio vero: si sale in un vagone percorribile, dura da 8 a 15 secondi secondo la distanza, e a bordo si incontrano persone già conosciute con cui fare due chiacchiere. Il tempo si ferma mentre si parla; un annuncio avvisa della fermata.
- Le persone conosciute in viaggio scrivono al telefono quando la storia lo permette. Alcuni messaggi aprono missioni secondarie (una sfida di Elia in Virtuoso, una foto per la radio di Emma, la funivia per Sami…) che si completano giocando e danno una ricompensa.
- I sentieri Borgo → Rivafosca, Rivafosca → Officina e Officina → Binario Nord sono disegnati a mano in `dist/routes.js`: curve, bivi, radure, erba alta, bosco fitto ai lati e un segreto da trovare. Gli altri sentieri usano ancora il tracciato semplice e si possono aggiungere allo stesso file.

## Sprite aggiuntivi

Bici, personaggi nelle quattro direzioni, nuovi abitanti, palchi, ingressi dei trasporti, arredi extra e sfondi dei concerti si aggiungono senza toccare il codice: le specifiche e i prompt sono in [docs/SPRITE_PER_CHATGPT.md](docs/SPRITE_PER_CHATGPT.md); il prompt pronto da incollare in ChatGPT è in [docs/PROMPT_CHATGPT.md](docs/PROMPT_CHATGPT.md). Si salvano i file in `dist/assets/extra/` e si lancia `npm run assets`, che li controlla e aggiorna il manifest letto dal gioco. Finché un file manca resta il disegno di riserva.

I testi usano Nunito e Fredoka (SIL Open Font License), inclusi in `dist/assets/fonts/`.

## Modalità QA

Aprendo il gioco con `?qa=1` compare la striscia «MODALITÀ QA». Usa un salvataggio separato (`b3pz-tour-v1-qa`) e non tocca la partita normale. Durante un brano i pulsanti concludono il concerto con esito fallito, successo o padronanza: il risultato passa dallo stesso flusso di ricompense del gioco. Ogni simulazione è registrata (pulsante Registro, o `window.__qa.log()` in console). Non esistono comandi per aggiungere pass, indizi o sblocchi.

## Limiti noti

L’audio è sintetizzato via Web Audio. Latenza audio, Safari e multitouch vanno verificati su dispositivi reali. La bici usa ancora un disegno provvisorio e gli abitanti hanno pose frontali.

## Struttura

```text
dist/index.html     Interfaccia
dist/style.css      Layout responsive
dist/game.js        Esplorazione, interfaccia, dialoghi, scene e concerti
dist/core.js        Stato, salvataggi, progressione e partiture
dist/music.js       Stili musicali, giri armonici e pattern per strumento
dist/puzzles.js     Le otto prove (logica verificabile e interfaccia)
dist/adventure.js   Personaggi, abitanti, interni, sentieri e mistero
dist/progress.js    Musicodex, metro e itinerari
dist/world.js       Città, percorsi, collisioni, trasporti e disegno del mondo
dist/concert.js     Scena del concerto
dist/audio.js       Sintesi e accompagnamento
tests/              Verifiche automatiche
docs/               Progetto, direzione artistica e revisioni
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

## Revisione 0.5

Dettagli: [REVISIONE_05.md](docs/REVISIONE_05.md).

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

## Revisione 0.3

Arredi illustrati, sprite proporzionati, abitanti e rivali distinti, otto ricostruzioni musicali e il mistero delle Otto Strade. Calendario guidato dagli eventi. Dettagli, fonti e limiti: [REVISIONE_03.md](docs/REVISIONE_03.md).

## Revisione 0.3.1 — concerti

Pista in prospettiva, band illustrata con strumenti assegnati, palette dei generi, pubblico che reagisce alle serie, feedback sui colpi e comandi touch con colori di corsia. Il rendering non modifica partiture, finestre di precisione o punteggio. Movimento decorativo ridotto secondo le preferenze del dispositivo. Verificati renderer largo e stretto; il collaudo audio/multitouch su iPhone resta da fare.

## Revisione 0.4 — atlante, Musicodex e trasporti

L’illustrazione è la mappa principale con 12 luoghi selezionabili, zoom, percorsi e dettaglio progressi. Musicodex: 8 capacità di ascolto e 24 per strumento, completabili in una sola campagna cambiando ruolo nei garage; acquisizione dopo una prova riuscita e padronanza a 85%. I salvataggi precedenti conservano i pass e migrano le capacità guadagnate sullo strumento iniziale.

A Binario Nord due missioni: recuperare la pompa e riportarla ad Arturo per la bici; ricomporre gli annunci in stazione e consegnare il nastro per il pass metro. La metro parte esclusivamente dagli ingressi fisici nelle città servite: Rivafosca, Officina, Binario Nord, Bellavista, Grooveto, Porto del Sol, Notturnia e Settembre. Le destinazioni devono essere già visitate; i requisiti del festival restano validi. Monteferro ha una funivia da Valdaccordo e nessuna metro. L’isola richiede la prima traversata in nave da Porto del Sol, poi si può ripercorrere il pontile tra Notturnia e l’isola; il traghetto resta disponibile. Il pontile è una mappa percorribile sul mare con ringhiere e collisioni.

Gli ingressi dei mezzi sono rappresentati nel mondo; gli edifici usano le tavole tematiche, anche per sale prove urbane, alpine e insulari. L’atlante guida le tipologie e la disposizione generale, ma la ricostruzione dettagliata di tutte le città non è ancora completa. Le strade hanno palette regionali e restano modulari. La metro e la funivia hanno passaggi narrativi, non un interno esplorabile in movimento.
