# Revisione 0.4.1 — itinerari e arrivi

Selezionando una città sulla mappa, il giocatore vede il percorso fisico più breve disponibile, evidenziato in oro, con una lista delle tappe e dei relativi mezzi. Il calcolo considera la storia attuale senza modificare la partita: prima della tournée non suggerisce partenze, il festival resta bloccato dai pass e dal concerto a casa, la prima visita all’isola richiede il traghetto da Porto del Sol. Una volta completata la traversata, il pontile è incluso nei percorsi in entrambe le direzioni. La funivia è indicata sul collegamento Valdaccordo–Monteferro. La metro conserva il suo menu e i suoi requisiti separati.

Gli arrivi in metro privilegiano caselle camminabili accanto all’ingresso della stazione, mantenendo le posizioni precedenti come riserva.

Verifica: controlli sintattici, 31 test automatici (compresi itinerari e arrivi alle otto stazioni), apertura e selezione delle destinazioni della mappa nel browser. Non eseguito un nuovo playthrough completo della campagna né un test su iPhone fisico.
