# Asset illustrati — revisione 0.2

Generati con lo strumento immagini integrato, poi copiati nel progetto. Nessuna API a pagamento aggiuntiva o dipendenza da URL remoti. Gli originali vengono conservati; le singole celle sono ritagliate dal motore durante il rendering.

## Direzione artistica

Avventura musicale 2D con vista dall’alto a tre quarti. Illustrazione dipinta morbida, forme arrotondate, piccoli dettagli di materiali, ombre delicate, palette estiva calda. Non pixel art e non forme geometriche rigide. Personaggi originali.

## Tavole e celle

Ogni tavola contiene quattro colonne e quattro righe. Le direzioni dei personaggi, da sinistra a destra, sono sud, ovest, est, nord.

| File | Righe 1–3 | Riga 4 |
|---|---|---|
| `dist/assets/hero-world-atlas.png` | Protagonista fermo, camminata A, camminata B | Albero, palma, casa, sala prove |
| `dist/assets/band-instruments-atlas.png` | Nico, Vale, maestro Riva | Chitarra, basso, batteria, amplificatore |
| `dist/assets/towns-props-atlas.png` | Dodici edifici tematici | Fontana, rocce, erba e fiori, ponte |

Le dimensioni non sono codificate nel motore: `assets.js` legge la dimensione effettiva delle immagini e divide le celle in quattro parti uguali. Non vengono rimossi o sostituiti i canali alfa.

## Brief dei prompt utilizzati

### Protagonista e primo ambiente

Production raster sprite atlas for a top-down 2D musical adventure. Exactly 4 columns and 4 rows of equal square cells on a genuine transparent background. Soft hand-painted storybook JRPG look, rounded anatomy, watercolor material variation, warm illustrated outlines. Same original 12-year-old country boy in all twelve character cells: rust-red baseball cap, curly brown hair, mustard tee, green backpack with cream straps, blue shorts and brown sneakers. Columns south, west, east, north. Rows idle, walk with left foot forward, walk with right foot forward. Last row: broadleaf tree, palm, cream-plaster terracotta cottage with central door, wooden rehearsal barn with central door. Full bodies and objects, consistent size and baseline, generous separation, no text, grid or scene.

### Band, maestro e strumenti

Matching 4×4 transparent sprite atlas in the same original softly painted game style. Row one: Nico, chestnut hair, round glasses, faded blue overshirt, cream tee, shorts and canvas bag, four directions. Row two: Vale, dark curly hair, olive headband, coral tee, green overalls, four directions. Row three: Maestro Riva, grey wavy hair and small moustache, round glasses, sage cardigan, cream shirt, ochre tie and brown trousers, four directions. Row four: electric guitar, electric bass, orange drum kit and dark green vintage amplifier. Full subjects, equal cells and consistent baseline, true transparent background. An additional background-extraction pass removed the white haze while preserving all sixteen subjects and their layout.

### Città e oggetti

Matching 4×4 production environment sprite atlas, soft hand-painted storybook illustration, curved roofs, material detail, overhead three-quarter game view, central south-facing doors, true transparent background. Row one: country school, brick rock factory, green-roof railway station, rose-colored theatre. Row two: funk market, old music academy, alpine stone cottage, small mountain castle. Row three: Latin stucco club, reggae beach hut, nighttime jazz club, festival tent. Row four: fountain, mossy boulders, wildflower grass tuft, horizontal wooden bridge. Complete isolated objects, no scene, text or grid.

## Parti ancora da rifinire

La bicicletta resta una rappresentazione procedurale provvisoria. I musicisti locali riutilizzano alcune basi dei personaggi; non hanno ancora tutti un volto esclusivo. Palchi, superfici e alcuni elementi dell’arredo sono costruiti dal motore. Le animazioni dei tre strumenti richiederanno pose dedicate quando il sistema musicale e l’inquadratura saranno definitivi.
