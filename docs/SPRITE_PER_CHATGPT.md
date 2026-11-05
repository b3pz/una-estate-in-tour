# Sprite da generare — istruzioni per ChatGPT

Questo documento va dato a ChatGPT (o a un altro generatore di immagini) insieme alle tre tavole esistenti, che fanno da **riferimento di stile**:

- `dist/assets/hero-world-atlas.png` (protagonista, alberi, case)
- `dist/assets/people-atlas.png` (16 personaggi frontali)
- `dist/assets/interiors-atlas.png` (16 arredi)

Il gioco carica i nuovi file **da solo**: basta salvarli nella cartella indicata e lanciare `npm run assets`. Finché un file manca, il gioco usa il disegno di riserva attuale, quindi si può procedere un file alla volta.

## Come funziona l’automatismo

1. Salva il file con il nome esatto in `dist/assets/extra/` (gli sfondi dei concerti in `dist/assets/extra/concert/`).
2. Lancia `npm run assets`. Lo script:
   - controlla formato, dimensioni, proporzioni e trasparenza;
   - scrive `dist/assets/extra/manifest.json` con i file validi;
   - elenca quelli ancora mancanti.
   I file con errori non entrano nel manifest e non compaiono nel gioco.
3. Ricarica il gioco: i nuovi sprite sostituiscono i disegni di riserva.
4. Fai commit dei file e del manifest.

## Regole comuni per tutti gli sprite

- **Stile:** illustrazione dipinta morbida, colori caldi estivi, contorno scuro sottile, luce dall’alto a sinistra. Identico alle tavole di riferimento.
- **Tavole (atlas):** PNG **1536 × 1536** con **sfondo trasparente**, divise in una griglia **4 × 4** di celle da 384 × 384.
- **Una figura per cella**, centrata in orizzontale, con **piedi, ruote o base nella parte bassa della cella**, lasciando **circa 20 px di margine su tutti i lati, anche sotto**. Il gioco ritaglia da solo lo spazio trasparente e appoggia il punto più basso della figura a terra, quindi il margine non la fa galleggiare. Nessuna figura deve sconfinare nella cella vicina.
- **Scala costante:** in tutte le celle un personaggio adulto occupa circa l’80% dell’altezza della cella; i ragazzi circa il 70%.
- Niente testo, niente ombre portate sul pavimento, niente sfondi o cornici. Unica eccezione: la «M» dell’insegna della metro, che è un simbolo grafico e va mantenuta.
- Vista dall’alto inclinata (come i giochi di ruolo classici): si vedono testa e fronte del corpo.

La posizione nella griglia si indica come **riga, colonna**, partendo da 0 in alto a sinistra.

---

## 1. `hero-bike.png` — il protagonista in bicicletta

Oggi la bici è un disegno provvisorio. Il protagonista è quello di `hero-world-atlas.png`: cappellino rosso, maglietta gialla, zaino verde, pantaloncini blu. Bici da città verde salvia con cestino.

| Riga | Direzione | Col. 0 | Col. 1 | Col. 2 | Col. 3 |
|---|---|---|---|---|---|
| 0 | verso il basso (si vede il viso) | fermo | pedalata A | pedalata B | vuota |
| 1 | verso sinistra | fermo | pedalata A | pedalata B | vuota |
| 2 | verso destra | fermo | pedalata A | pedalata B | vuota |
| 3 | verso l’alto (di spalle) | fermo | pedalata A | pedalata B | vuota |

> Prompt: «Crea una tavola sprite 1536×1536 a sfondo trasparente, griglia 4×4. Il ragazzo del riferimento allegato (cappellino rosso, maglietta gialla, zaino verde) su una bici da città verde salvia con cestino. Riga 0 di fronte, riga 1 verso sinistra, riga 2 verso destra, riga 3 di spalle. Colonna 0 fermo, colonne 1 e 2 due fasi della pedalata, colonna 3 vuota. Stesso stile dipinto del riferimento, ruote a terra sul bordo basso di ogni cella.»

## 2. `people-dir-1.png` … `people-dir-4.png` — personaggi nelle quattro direzioni

Oggi i 16 personaggi di `people-atlas.png` sono solo frontali. Ogni tavola contiene **4 personaggi** (una riga ciascuno) in **4 direzioni**:

- colonna 0: di fronte
- colonna 1: verso sinistra
- colonna 2: verso destra
- colonna 3: di spalle

Ricalca fedelmente vestiti e colori della cella corrispondente di `people-atlas.png`.

| File | Riga 0 | Riga 1 | Riga 2 | Riga 3 |
|---|---|---|---|---|
| `people-dir-1.png` | Elia (rivale, giacca nera) | Bea (rivale, camicia gialla) | Tommi (rivale, giacca verde) | Nino (anziano, cappello) |
| `people-dir-2.png` | Ada (salopette) | Lia (bionda, gonna) | Tito (camicia viola) | Iris (metal, nero) |
| `people-dir-3.png` | Rosa (gonna a fiori) | Teo (dreadlock, righe) | Mina (cappotto blu) | Emma (impermeabile giallo) |
| `people-dir-4.png` | Leo (chitarra in spalla) | Arturo (berretto da ferroviere) | Dario (cartellino e rotolo di fogli) | Sami (felpa rossa, registratore) |

> Prompt (uno per file): «Tavola sprite 1536×1536 trasparente, griglia 4×4. Ogni riga è un personaggio del riferimento allegato: [nomi della riga]. Colonna 0 di fronte, 1 verso sinistra, 2 verso destra, 3 di spalle. Stessi vestiti, colori e proporzioni del riferimento, piedi sul bordo basso della cella.»

## 3. `people-extra.png` — nuovi abitanti (frontali)

Il gioco li mostra già negli interni appena il file esiste. Numero della cella = riga × 4 + colonna.

| Cella | Personaggio | Dove compare |
|---|---|---|
| 0 (0,0) | **Mamma** del protagonista: quarantenne, grembiule, capelli castani raccolti | Casa, Borgo delle Cicale |
| 1 (0,1) | Capitano del traghetto: berretto bianco, barba grigia | previsto, non ancora usato |
| 2 (0,2) | Barista: gilet scuro, papillon | Caffè Blu, Notturnia |
| 3 (0,3) | Fabbro: grembiule di cuoio, braccia robuste | Fucina, Monteferro |
| 4 (1,0) | Signora delle rose: anziana elegante, cappello di paglia con fiori | Casa delle rose, Bellavista |
| 5 (1,1) | Venditore di spezie: camicia a righe, fazzoletto al collo | Mercato, Grooveto |
| 6 (1,2) | Vecchio pescatore: maglione blu, stivali | Mercato del porto, Porto del Sol |
| 7 (1,3) | Proprietario della bottega di dischi: occhiali tondi, cardigan | Bottega, Rivafosca |
| 8–15 | Fan del festival, vari e allegri (magliette, cappellini, uno con cartello) | previsti per il pubblico del festival |

## 4. `transport-stage.png` — ingressi dei trasporti e palchi

| Cella | Oggetto | Note |
|---|---|---|
| (0,0) | Ingresso della metro | scala che scende, insegna «M» blu, ringhiera verde |
| (0,1) | Stazione della funivia | piccola stazione in legno e pietra con cabina rossa |
| (0,2) | Imbarco del traghetto | pontile corto con un battello bianco ormeggiato |
| (0,3) | Ingresso del pontile | inizio di passerella in legno con due lanterne |
| (1,0) | **Palco di città** | palco in legno rialzato, fondale verde scuro, batteria e due amplificatori, nessuna scritta (l’insegna la aggiunge il gioco) |
| (1,1) | **Palco del festival** | palco grande con traliccio, luci e bandierine, batteria e amplificatori, nessuna scritta |
| (1,2), (1,3) | riserva | lasciare vuote |
| righe 2 e 3 | non usate | lasciare vuote (trasparenti) |

In questa tavola sono usate solo sei celle: le altre dieci restano vuote.

Il palco di città viene mostrato 1,6 volte più grande di un personaggio, quello del festival 2,5 volte: disegnali larghi quanto quasi tutta la cella.

## 5. `interiors-extra.png` — arredi in più

Si aggiungono a quelli di `interiors-atlas.png` e compaiono da soli nelle stanze indicate.

| Cella | Arredo | Stanza |
|---|---|---|
| (0,0) | Scaffale dell’archivio pieno di nastri e cassette etichettate | Vecchia accademia |
| (0,1) | Giradischi su mobiletto | riserva |
| (0,2) | Tre congas di altezze diverse | Casa del Sol |
| (0,3) | Reti da pesca appese a una cornice di legno | Casa del vento |
| (1,0) | Metronomo a pendolo grande, su piedistallo | La Fortezza |
| (1,1) | Incudine con martello | Fucina |
| (1,2) | Bancone da bar con macchina del caffè | Caffè Blu |
| (1,3) | Fila di poltroncine rosse da teatro | Teatro Aurora |
| (2,0) | Sportello della biglietteria con griglia e campanello | Stazione Nord |
| (2,1) | Panchina di stazione | riserva |
| (2,2) | Palma in vaso | riserva |
| (2,3) | Banco da lavoro con valvole e un amplificatore aperto | Officine |
| (3,0) | Jukebox colorato | Il Settimo, Club Elastico |
| (3,1) | Attaccapanni con pass del festival appesi | Backstage |
| (3,2) | Postazione radio con microfono e cuffie | riserva |
| (3,3) | Vecchia foto di una band su un cavalletto | Vecchia accademia |

## 6. Sfondi dei concerti — `concert/*.jpg`

JPEG **1600 × 600**, senza persone né testo. Il gioco li mette dietro la band, nella parte alta dello schermo. Tenere i dettagli importanti nella metà superiore e scurire leggermente il bordo inferiore.

| File | Scena |
|---|---|
| `concert/blues.jpg` | fiume al tramonto con ponte di legno e luna |
| `concert/rock.jpg` | capannoni industriali in mattoni con ciminiere e luci arancioni |
| `concert/pop.jpg` | giardini fioriti con archi e la facciata del teatro |
| `concert/funk.jpg` | cortile di mercato con tendoni a righe e festoni |
| `concert/metal.jpg` | montagne innevate con fortezza di pietra |
| `concert/latino.jpg` | porto con barche, case colorate e sole basso |
| `concert/reggae.jpg` | spiaggia con palme e mare turchese |
| `concert/jazz.jpg` | skyline notturno con finestre illuminate e luna |
| `concert/casa.jpg` | piazza di paese con lucine e campi al tramonto |
| `concert/rivali.jpg` | piazza di sera con striscione rosso e fulmini dipinti |
| `concert/traghetto.jpg` | ponte di un traghetto in mare aperto, alberi e cime |
| `concert/festival.jpg` | grande festival estivo, fuochi d’artificio, luci e bandiere |

> Prompt: «Fondale illustrato 1600×600 per un concerto in un videogioco, stile dipinto morbido come il riferimento allegato, nessuna persona e nessun testo: [scena]. Dettagli nella metà superiore, parte bassa più scura.»

## 7. `title-art.jpg` — immagine del titolo

JPEG **1920 × 1080**: i tre ragazzi della band (protagonista, Nico con il basso, Vale alla batteria) di spalle su una collina. Sotto si vedono le Otto Strade che portano verso un palco lontano al tramonto. Lasciare libera la parte centrale, dove compare il riquadro del titolo.

---

## Verifica

Dopo ogni aggiunta:

```bash
npm run assets
```

```bash
npm test
```

Lo script elenca ✓ i file accettati, ✗ quelli da correggere (con il motivo) e quelli ancora mancanti.

---

# Seconda serie: città, arredo urbano e sentieri

Tre tavole nuove, stesse regole comuni (PNG 1536 × 1536 trasparente, griglia 4 × 4, una figura per cella, circa 20 px di margine, stile delle tavole di riferimento). Finché mancano, il gioco usa i disegni attuali.

## 8. `buildings-extra.png` — palazzi delle città

Le città (Officina, Bellavista, Grooveto, Porto del Sol, Notturnia) hanno isolati di palazzi attorno alle strade. Oggi ripetono gli edifici principali; questi sono palazzi «di fila», più semplici e più larghi che alti, senza insegne. Vista frontale dall’alto come gli altri edifici, porta in basso al centro.

| Cella | Città | Edificio |
|---|---|---|
| (0,0) | Officina | casa operaia a schiera in mattoni rossi, due finestre e una porta |
| (0,1) | Officina | piccolo magazzino con saracinesca e casse impilate |
| (0,2) | Officina | palazzina in mattoni con ciminiera sottile e panni stesi |
| (0,3) | Bellavista | villetta color pesca con balconcino fiorito |
| (1,0) | Bellavista | casa a due piani color crema con persiane verdi |
| (1,1) | Bellavista | serra di vetro e ferro battuto piena di piante |
| (1,2) | Grooveto | casa con tendone a righe e bancarella davanti |
| (1,3) | Grooveto | piccolo negozio di dischi con vetrina colorata |
| (2,0) | Grooveto | casa giallo ocra con murales di note musicali |
| (2,1) | Porto del Sol | casa di pescatori azzurra con reti appese |
| (2,2) | Porto del Sol | casa rosa a due piani con buganvillea |
| (2,3) | Porto del Sol | piccolo deposito di barche in legno |
| (3,0) | Notturnia | palazzina scura con finestre accese e balcone in ferro |
| (3,1) | Notturnia | piccolo bar notturno con luci calde in vetrina |
| (3,2) | Notturnia | casa stretta e alta con abbaino illuminato |
| (3,3) | riserva | lasciare vuota |

## 9. `city-props.png` — arredo urbano

| Cella | Oggetto | Note |
|---|---|---|
| (0,0) | Lampione | alto e sottile, ferro verde scuro, lanterna gialla; usato lungo le strade delle città |
| (0,1) | Panchina | legno e ferro, vista di tre quarti |
| (0,2) | Fontanella | piccola, in pietra |
| (0,3) | Cassetta della posta | rossa, su palo |
| (1,0) | Fioriera | rettangolare in pietra con fiori misti |
| (1,1) | Edicola | chiosco di giornali con tettoia |
| (1,2) | Bancarella | carretto della frutta con ombrellone |
| (1,3) | Bici parcheggiate | due biciclette appoggiate a una rastrelliera |
| righe 2 e 3 | riserva | lasciare vuote |

## 10. `trail-props.png` — decorazioni dei sentieri

| Cella | Oggetto | Note |
|---|---|---|
| (0,0) | Erba alta | ciuffo largo, verde intenso; si ripete affiancato |
| (0,1) | Cartello di legno | palo con tavoletta vuota, senza scritte |
| (0,2) | Sasso grande | con muschio |
| (0,3) | Ceppo d’albero | tagliato, con funghetti |
| (1,0) | Staccionata | tre assi orizzontali, pezzo modulare |
| (1,1) | Cespuglio di more | basso e largo |
| (1,2) | Panchina da parco | di legno grezzo |
| (1,3) | Segreto del sentiero | piccola luce dorata che brilla tra l’erba |
| righe 2 e 3 | riserva | lasciare vuote |

> Prompt (uno per tavola): «Tavola sprite 1536×1536 a sfondo trasparente, griglia 4×4 da 384 px, stesso stile dipinto delle tavole di riferimento allegate. Una figura per cella, centrata, base nella parte bassa con circa 20 px di margine, nessun testo. Contenuto delle celle: [tabella della tavola].»
