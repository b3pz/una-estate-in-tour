# Prompt da incollare in ChatGPT

Copia tutto il blocco qui sotto in una nuova chat di ChatGPT (con navigazione web e generazione di immagini attive).

```text
Lavoriamo agli sprite del mio videogioco «Fuori Tempo» (un’estate in tour).

1. Leggi le specifiche complete qui:
   https://raw.githubusercontent.com/b3pz/una-estate-in-tour/main/docs/SPRITE_PER_CHATGPT.md
   Contengono, per ogni file: nome esatto, dimensioni, griglia 4×4, cosa va in ogni cella, dove finisce nel gioco e un prompt di partenza.

2. Usa come riferimento di stile queste tavole già presenti nel gioco (aprile e guardale prima di disegnare):
   https://raw.githubusercontent.com/b3pz/una-estate-in-tour/main/dist/assets/hero-world-atlas.png
   https://raw.githubusercontent.com/b3pz/una-estate-in-tour/main/dist/assets/people-atlas.png
   https://raw.githubusercontent.com/b3pz/una-estate-in-tour/main/dist/assets/interiors-atlas.png
   https://raw.githubusercontent.com/b3pz/una-estate-in-tour/main/dist/assets/towns-props-atlas.png
   https://raw.githubusercontent.com/b3pz/una-estate-in-tour/main/dist/assets/band-instruments-atlas.png
   Se non riesci ad aprire le immagini dai link, dimmelo: te le carico io in chat.

3. Prima di disegnare, riassumimi in una tabella l’elenco dei file da produrre (nome, dimensioni, contenuto) nell’ordine delle specifiche, e aspetta il mio «vai».

4. Poi genera UN file alla volta, rispettando alla lettera:
   - nome del file e dimensioni esatte;
   - PNG con sfondo trasparente per le tavole, JPEG per sfondi dei concerti e titolo;
   - griglia 4×4 da 384×384 px, una figura per cella, centrata, piedi o base nella parte bassa con circa 20 px di margine su tutti i lati (anche sotto), nessuna figura che sconfina;
   - stesso stile, palette, contorno e scala delle tavole di riferimento;
   - nessun testo, nessuna cornice, nessuno sfondo nelle tavole (unica eccezione: la «M» dell’insegna della metro);
   - le celle non descritte nelle specifiche restano vuote e trasparenti.
   Dopo ogni file dimmi il nome con cui salvarlo e la cartella:
   - dist/assets/extra/  per le tavole e title-art.jpg
   - dist/assets/extra/concert/  per gli sfondi dei concerti
   Poi aspetta il mio «avanti» prima del file successivo.

5. Se una richiesta del documento è ambigua, chiedimi invece di inventare.

Ordine consigliato: hero-bike.png, people-extra.png, transport-stage.png, interiors-extra.png, people-dir-1…4.png, gli sfondi concert/*.jpg, title-art.jpg.
Seconda serie (sezioni 8–10 delle specifiche): buildings-extra.png, city-props.png, trail-props.png.
Terza serie (sezioni 11–14 delle specifiche): hero-walk.png, hero-girl-walk.png, hero-girl-bike.png, farm-props.png. Allega come riferimento anche hero-world-atlas.png, hero-bike.png e band-instruments-atlas.png.
Quarta serie (sezioni 15–17 delle specifiche): i 9 sfondi rooms/*.jpg (in dist/assets/extra/rooms/), metro-car.png, misc-props.png.
```

## Dopo ogni immagine

1. Salva il file con il nome indicato nella cartella indicata del progetto.
2. Lancia `npm run assets`: controlla dimensioni, formato e trasparenza, aggiorna il manifest e dice se il file va rifatto.
3. Ricarica il gioco: lo sprite compare da solo.

Se `npm run assets` segnala un errore (per esempio «manca la trasparenza» o «proporzioni sbagliate»), incolla il messaggio a ChatGPT e chiedigli di rifare quel file.

Nota: i link puntano al ramo `main`. Se le specifiche non sono ancora state unite in `main`, sostituisci `main` con `claude/brave-keller-ayy5ef` nei link.
