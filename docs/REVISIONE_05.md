# Revisione 0.5 — varietà, mistero e città abitate

Questa revisione risponde alla valutazione QA della 0.4.1 (voto 4,5/10). La run aveva mostrato un viaggio comprensibile ma ripetitivo: ogni città riproponeva la stessa pianta, gli stessi abitanti, la stessa coppia di enigmi e la stessa partitura.

## Musica
- `music.js`: un giro armonico e pattern distinti per chitarra, basso e batteria in ognuno degli otto stili, con terzine nei generi in swing. Le partiture sono diverse in tutte le otto città per tutti e tre gli strumenti (verificato da test).
- Brani strutturati: intro, strofa, ritornello e chiusura con fill. Il festival è un medley degli otto stili.
- L’accompagnamento suona le parti reali degli altri due strumenti e gli accordi della battuta. La nota colpita ha l’altezza della partitura.
- La scena del concerto ha una scenografia per città e per occasione (rivali, nave, casa, festival).

## Prove
Otto meccaniche diverse, descritte nel README. Gli appunti spiegano il principio e non elencano la soluzione. Gli errori ricevono un riscontro specifico; nel blues gli aiuti diventano progressivi dopo alcuni tentativi. Le prove basate sull’ascolto hanno un equivalente visivo (luci, contorni melodici, griglie).

## Mistero
- Ogni città dà un oggetto proprio, ma il contenuto rivelato segue l’ordine della storia: nessuna città può anticipare la soluzione.
- All’archivio di Valdaccordo, con otto indizi, si risponde a tre domande. Gli errori sono spiegati con riferimento agli indizi. Segue la rivelazione (Andrea è Dario) e la scena con Riva.
- Il concerto a casa e il festival cambiano a seconda dell’esito. Al festival si sceglie il nome della band; l’epilogo è in tre pagine con il riepilogo del viaggio.

## Mondo e personaggi
- Abitanti diversi per città, con battute legate ai progressi. I rivali ricompaiono lungo il viaggio e al concerto a casa si può scegliere di suonare con loro.
- Un incontro e un cartello propri per ogni sentiero.
- Interni narrativi tutti diversi, ognuno con un dettaglio da esaminare.
- Il festival è popolato da insegnanti, rivali e viaggiatori.
- L’obiettivo suggerisce sempre la tappa musicale più vicina, con il primo tratto del percorso.

## Correzioni
- Il varco della funivia non riapre più il pannello in ciclo.
- Il tocco seleziona il personaggio più vicino.
- Gli interni sono inquadrati per intero.
- In verticale il campo visivo è più ampio e l’atlante non è più tagliato.
- I testi dei risultati sono coerenti con il punteggio e le intestazioni corrette.
- Ponte con torrente, niente cespugli sul mare, ingressi dei trasporti lontani dagli edifici.
- Rimossi i testi di sviluppo visibili al giocatore.

## Verifica
- Test automatici sulle partiture, sulle prove, sul mistero, sugli abitanti e sugli interni.
- Run completa in modalità QA da partita nuova: prove risolte dall’interfaccia, concerti simulati attraverso il flusso normale.
- Non verificati su dispositivi reali: latenza audio, Safari e multitouch.
