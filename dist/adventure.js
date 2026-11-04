export const PEOPLE = [
 ['Elia', 'Leader degli Alta Tensione: teme di essere dimenticato.'],
 ['Bea', 'Bassista rivale. Ascolta prima di giudicare.'],
 ['Tommi', 'Batterista rivale: scherza per nascondere la paura di sbagliare.'],
 ['Nino', 'Conserva i manifesti dei concerti sul fiume.'],
 ['Ada', 'Ripara amplificatori e organizza i concerti del quartiere.'],
 ['Lia', 'Vuole riaprire il teatro.'],
 ['Tito', 'Cerca un groove che lasci spazio agli altri.'],
 ['Iris', 'Preferisce una prova lenta a una nota confusa.'],
 ['Rosa', 'Unisce percussionisti di generazioni diverse.'],
 ['Teo', 'Ripara le reti del padre prima delle prove.'],
 ['Mina', 'Annota anche le idee degli sconosciuti.'],
 ['Emma', 'Conduce la radio del campeggio e segue la tournée città per città.'],
 ['Leo', 'Viaggia in bicicletta con la sua chitarra.'],
 ['Arturo', 'Ex ferroviere: ricorda la band di Riva.'],
 ['Dario', 'Custodisce l’archivio di Valdaccordo e le vecchie scalette.'],
 ['Sami', 'Registra le voci dei paesi e sogna il festival.']
];
export const TEACHER_ART = { 1: 3, 2: 4, 3: 13, 4: 5, 5: 6, 6: 14, 7: 7, 8: 8, 9: 9, 10: 10, 11: 11 };
export const NPC_NAMES = { 0: 'Nico e Vale', 3: 'Arturo', 6: 'Dario', 11: 'Emma' };

// Abitanti: chi, dove e cosa dice a seconda dei progressi (start → puzzle → pass → final).
const R = (who, x, y, lines) => ({ who, x, y, lines });
export const RESIDENTS = {
 0: [R(15, 19, 22, { start: '«Registro le cicale per la radio di Emma. Tu che suoni? Quando avrete una canzone, la registro io.»', tour: '«Il maestro Riva suonava qui con altri ragazzi, tanti anni fa. Mia nonna dice che erano in quattro, ma sulle foto ne vede sempre tre.»', home: '«Tutto il paese è in piazza. Ho portato il registratore: stasera non sbagliate!»' })],
 1: [R(12, 17, 18, { start: '«Seguo il fiume in bici da tre giorni. Nino è il tipo con il cappello: dice che il blues si impara ascoltando la risacca.»', puzzle: '«Hai sentito quel nastro? Nino lo tiene come una reliquia.»', pass: '«Ci vediamo per strada! Io proseguo verso le officine: là il suono è più ruvido.»' })],
 2: [R(11, 28, 23, { start: '«Emma, radio del campeggio! Sto intervistando Ada: qualcuno le ha staccato tutti i cavi dell’impianto la notte prima del concerto.»', puzzle: '«Ada dice che sapete leggere un impianto meglio di suo nipote. Lo dirò in onda.»', pass: '«Il pezzo rock è andato in onda stasera. Al campeggio di Binario Nord tutti chiedono di voi.»' })],
 3: [R(11, 19, 22, { start: '«Benvenuti al campeggio! Qui di notte suonano le band in viaggio. Arturo, il signore con il berretto da ferroviere, aggiusta tutto.»', puzzle: '«Arturo è di buon umore: non vedeva la sua bici girare da anni.»', pass: '«Seguo il vostro viaggio in diretta. Prossima tappa?»' }), R(12, 28, 23, { start: '«Arturo mi ha prestato la pompa due giorni fa… o era Emma? Chiedete a lei.»', puzzle: '«Con la bici si va dappertutto. Con la metro si torna a casa la sera.»', pass: '«Ci vediamo al festival, se non mi si stacca la catena.»' })],
 4: [R(15, 19, 22, { start: '«Il Teatro Aurora è chiuso da anni. Lia vuole riaprirlo con una canzone sola, ma i nastri sono stati rimontati a caso.»', puzzle: '«Ho registrato il ritornello! Lo faccio sentire a mia sorella: lei piange sempre con i cambi di tonalità.»', pass: '«Il teatro riapre a settembre. Avete fatto partire voi la raccolta firme, lo sapete?»' })],
 5: [R(12, 28, 23, { start: '«A Grooveto suonano tutti insieme nei cortili. Il difficile è stare zitti al momento giusto.»', puzzle: '«Tito dice che il silenzio più bello è quello che arriva puntuale.»', pass: '«Ho imparato il vostro giro di basso in bici: si pedala a tempo!»' })],
 6: [R(15, 19, 22, { start: '«L’archivio di Dario è pieno di nastri. Lui firma il registro dei visitatori con una A tutta arricciata, guarda.»', tour: '«Dario non parla mai di sé. Ma quando passa una canzone delle Otto Strade, smette di scrivere.»' })],
 7: [R(11, 28, 23, { start: '«Quassù la radio prende malissimo, ma il metal di Iris si sente fino a valle.»', puzzle: '«Iris non sorride quasi mai. Oggi sì: ha detto che tenete il tempo come un orologio.»', pass: '«La funivia chiude alle otto. Non perdetela, o dormite in fortezza!»' })],
 8: [R(15, 19, 22, { start: '«Rosa vuole far suonare insieme i vecchi del porto e i ragazzi delle congas. Si sono offesi per una battuta… letteralmente.»', puzzle: '«Ho registrato la clave! Toc, toc-toc… no aspetta, toc-toc-toc, toc-toc.»', pass: '«Il capitano del traghetto vi cerca: il suo gruppo di apertura non si presenta mai.»' })],
 9: [R(12, 28, 23, { start: '«Sono arrivato col traghetto con la bici in spalla. Teo sta rimettendo in piedi il pontile: ogni asse ha il suo ritmo.»', puzzle: '«Il pontile adesso regge. Domani lo provo in bici… forse.»', pass: '«Dal pontile si arriva a Notturnia: di notte le luci sembrano note sospese.»' })],
 10: [R(11, 19, 22, { start: '«Mina conserva l’ultima bobina del concerto delle Otto Strade. Non la fa ascoltare a nessuno, finora.»', puzzle: '«Quattro nomi sul nastro… Emma, radio del campeggio, è senza parole. Succede raramente.»', pass: '«Dicono che al festival qualcuno dovrà restituire un plettro.»' }), R(15, 28, 23, { start: '«Al Settimo si suona fino alle tre. Io mi addormento sempre al secondo assolo.»', pass: '«Ho la vostra risposta a Mina registrata. Vale ride a metà, si sente benissimo.»' })],
 11: [R(3, 21, 18, { start: '«Sono sceso dal fiume apposta. Ricordatevi: l’ultima battuta tira già verso l’inizio.»' }), R(4, 27, 18, { start: '«Ho controllato io l’impianto del festival. Stavolta nessuno stacca i cavi.»' }), R(5, 16, 24, { start: '«Il Teatro Aurora riapre a ottobre. Il primo concerto è vostro, se lo volete.»' }), R(6, 29, 29, { start: '«Stasera lasciate spazio. Il pubblico riempirà il resto.»' }), R(7, 19, 29, { start: '«Prima pulito. Poi veloce. Poi… divertitevi.»' }), R(8, 14, 19, { start: '«I vecchi del porto e i ragazzi delle congas sono venuti insieme. Merito della vostra clave.»' }), R(9, 12, 21, { start: '«Ho portato un’asse del pontile come portafortuna. Battere o levare? Levare, sempre.»' }), R(10, 36, 21, { start: '«Stasera non ripetete niente. Rispondete.»' }), R(12, 17, 18, { start: '«Ci siamo tutti! Ho pedalato dal fiume fino a qui.»', final: '«Domani riparto. Voi dove andate?»' }), R(15, 28, 23, { start: '«Settembre… Il registratore è carico. Tocca a voi.»', final: '«È la registrazione più bella dell’estate. Ve la regalo.»' })]
};

// Rivali lungo il viaggio: un piccolo arco che si chiude al concerto a casa.
export const RIVAL_POSTS = {
 0: [[0, 27.5, 24.5], [1, 25.5, 26.5], [2, 28.5, 27.5]],
 2: [[0, 26, 25.5]],
 5: [[1, 28, 19]],
 8: [[2, 29.5, 21]],
 11: [[0, 32, 24], [1, 34, 19], [2, 30, 20]]
};
export const RIVAL_LINES = {
 0: { 11: '«L’anno prossimo ci saremo anche noi su quel palco. Ma stasera tocca a voi: spaccate tutto. In senso buono.»', 2: '«Pensavate di essere gli unici in tournée? Gli Alta Tensione suonano stasera al Capannone. Il pubblico rock non perdona.»' },
 1: { 11: '«Siamo venuti a sentirvi. Tutti e tre. Elia ha anche comprato la maglietta del festival.»', 5: '«Elia non lo ammetterà mai, ma ha copiato il vostro giro della piazza. Io invece sto imparando a tacere: Tito dice che suono troppo.»' },
 2: { 11: '«Le bacchette nuove reggono. Le mie mani un po’ meno. Andate!»', 8: '«Rosa mi ha chiesto di suonare la clave e ho perso il conto dopo due giri. Voi come fate a non correre?»' }
};

// Interni: arredi [id, x, y, larghezza, altezza] e un punto da esaminare.
const it = (id, x, y, w, h) => [id, x, y, w, h];
export const ROOMS = {
 'Casa': { people: [{ who: 0, x: 19, y: 18.5, label: 'Mamma', text: st => st.homeShow ? '«Vi ho sentiti dalla prima fila. Sono fiera di voi tre.»' : st.passes.length ? '«Ogni tanto la radio di Emma parla di voi. Mangiate qualcosa, in giro?»' : '«Merenda nello zaino. E torna per cena, rockstar.»' }], items: [it(7, 24, 23, 170, 100), it(4, 14, 14, 145, 120), it(5, 20, 14, 64, 120), it(3, 34, 14, 100, 130), it(0, 15, 22, 135, 100), it(1, 34, 22, 90, 150), it(2, 33, 27, 115, 110), it(15, 26, 11, 110, 85), it(6, 25, 18, 120, 100)], spot: { x: 25, y: 19.6, label: 'Il biglietto sul tavolo', text: s => s.homeShow ? '«Siamo tutti in piazza a sentirvi. Il pane è nel forno. — Mamma»' : s.passes.length ? '«Ho ritagliato l’articolo della radio di Emma. Mangia qualcosa ogni tanto. — Mamma»' : '«Merenda nello zaino, crema solare nella tasca piccola. Divertitevi, ma tornate per il concerto. — Mamma»' } },
 'Bottega': { people: [{ who: 7, x: 27, y: 15, label: 'Il proprietario della bottega', text: '«Questo 45 giri l’ha inciso una band di Borgo, nel 1989. Sulla copertina sono in tre… ma i plettri disegnati sono quattro.»' }], items: [it(3, 14, 14, 100, 130), it(3, 19, 14, 100, 130), it(6, 25, 19, 120, 100), it(2, 33, 15, 115, 110), it(7, 24, 25, 170, 100), it(15, 30, 11, 110, 85)], spot: { x: 25, y: 20.6, label: 'Il bancone della bottega', text: () => 'Dischi di blues ordinati per anno. Il proprietario vi lascia ascoltare un 45 giri: «Sentite? L’ultima battuta tira già verso l’inizio.»' } },
 'Il Delta': { items: [it(11, 15, 15, 120, 85), it(9, 21, 15, 50, 100), it(13, 32, 15, 110, 140), it(0, 15, 24, 135, 100), it(6, 30, 24, 120, 100), it(7, 24, 21, 180, 100)], spot: { x: 30, y: 25.6, label: 'Le foto alle pareti', text: s => s.puzzles.length >= 2 ? 'Una foto del 1989: Riva giovane con altri tre ragazzi. Il quarto è girato di spalle, con un plettro nel taschino.' : 'Le foto dei concerti sul fiume. In una, un ragazzo con i capelli lunghi assomiglia al vostro maestro.' } },
 'Officine': { extras: [it(27, 24, 16, 140, 90)], items: [it(10, 15, 15, 125, 90), it(10, 20, 15, 125, 90), it(11, 33, 15, 120, 85), it(2, 33, 23, 115, 110), it(8, 16, 24, 130, 110), it(15, 26, 11, 110, 85)], spot: { x: 16, y: 25.6, label: 'Il banco di riparazione', text: () => 'Valvole, saldatore, un amplificatore aperto. Un cartello: «Prima si ascolta, poi si alza il volume». La grafia è di Ada.' } },
 'Il Capannone': { items: [it(11, 14, 15, 120, 85), it(11, 34, 15, 120, 85), it(9, 24, 15, 50, 100), it(10, 15, 25, 125, 90), it(7, 24, 22, 190, 100), it(10, 33, 25, 125, 90)], spot: { x: 24, y: 16.6, label: 'Il microfono degli Alta Tensione', text: s => s.passes.includes(2) ? 'Qualcuno ha attaccato un biglietto: «Bel concerto. — E.»' : 'Sul nastro adesivo del palco: «ALTA TENSIONE · stasera». Il microfono è ancora caldo.' } },
 'Stazione Nord': { extras: [it(24, 24, 15.6, 160, 100)], items: [it(0, 15, 15, 135, 100), it(0, 33, 15, 135, 100), it(3, 15, 24, 100, 130), it(6, 33, 24, 120, 100), it(15, 24, 11, 110, 85), it(7, 24, 20, 180, 100)], spot: { x: 24, y: 17.6, label: 'Lo sportello degli annunci', text: s => s.transport.metro >= 2 ? 'Il nastro degli annunci gira di nuovo. Una voce gentile annuncia: «Prossima fermata…»' : 'Uno sportello chiuso e un vecchio registratore senza nastro. Arturo ha la chiave.' } },
 'Casa delle rose': { people: [{ who: 4, x: 20, y: 19.5, label: 'La signora delle rose', text: '«Quando il teatro riaprirà, voglio sedermi in prima fila. Me l’ha promesso Lia.»' }], items: [it(0, 15, 15, 135, 100), it(6, 25, 19, 120, 100), it(15, 20, 11, 110, 85), it(15, 30, 11, 110, 85), it(3, 34, 15, 100, 130), it(7, 24, 25, 170, 100)], spot: { x: 25, y: 20.6, label: 'Il vaso di rose', text: () => 'La signora delle rose vi offre una limonata. «Il teatro era la cosa più bella del paese. Mia figlia ci ha suonato il primo violino.»' } },
 'Teatro Aurora': { extras: [it(23, 33, 27, 140, 80)], items: [it(13, 24, 14, 110, 140), it(9, 24, 19, 50, 100), it(7, 24, 23, 190, 100), it(15, 15, 11, 110, 85), it(15, 33, 11, 110, 85), it(3, 15, 22, 100, 130), it(3, 33, 22, 100, 130)], spot: { x: 15, y: 23.6, label: 'L’archivio delle partiture', text: s => s.puzzles.includes(4) ? 'Tra le partiture c’è una canzone intitolata «Le Otto Strade». Due calligrafie si alternano: una precisa, una con le A arricciate.' : 'Scaffali di partiture impolverate. Lia vi chiede di non toccare niente prima di aver sistemato la sua canzone.' } },
 'Mercato': { people: [{ who: 5, x: 24, y: 19, label: 'Il venditore di spezie', text: '«Pepe, cannella e un po’ di silenzio. Il segreto del funk e della cucina.»' }], items: [it(4, 15, 14, 145, 120), it(5, 21, 14, 64, 120), it(6, 30, 17, 120, 100), it(6, 30, 24, 120, 100), it(7, 18, 23, 170, 100)], spot: { x: 30, y: 25.6, label: 'Il banco delle spezie', text: () => 'Il venditore batte il ritmo con un cucchiaio sul bancone: «Sentite? Non riempio tutto: lascio respirare.»' } },
 'Club Elastico': { extras: [it(28, 29, 26, 80, 120)], items: [it(11, 15, 15, 120, 85), it(8, 33, 15, 130, 110), it(9, 24, 15, 50, 100), it(0, 15, 24, 135, 100), it(7, 24, 21, 190, 100), it(0, 33, 24, 135, 100)], spot: { x: 33, y: 16.6, label: 'Il mixer di Tito', text: () => 'Sul mixer un nastro adesivo: «MENO». Tito lo chiama il suo cursore preferito.' } },
 'Vecchia accademia': { extras: [it(16, 30, 19, 110, 130), it(31, 18, 19, 90, 110)], items: [it(3, 14, 14, 100, 130), it(3, 19, 14, 100, 130), it(3, 29, 14, 100, 130), it(3, 34, 14, 100, 130), it(14, 24, 12, 190, 100), it(2, 15, 24, 115, 110), it(13, 33, 24, 110, 140), it(7, 24, 21, 170, 100)], spot: { x: 15, y: 25.6, label: 'Il tavolo dell’archivio', archive: true } },
 'Casa del custode': { items: [it(1, 34, 15, 90, 150), it(2, 15, 15, 115, 110), it(4, 15, 24, 145, 120), it(3, 33, 24, 100, 130), it(7, 24, 21, 170, 100)], spot: { x: 15, y: 16.6, label: 'La scrivania di Dario', text: s => s.mystery === 2 ? 'Sulla scrivania c’è un plettro identico a quello del nastro. Accanto, una lettera mai spedita: «Caro Riva…»' : 'Un registro dei prestiti. Ogni firma ha una A con un ricciolo, come una chiave di violino.' } },
 'Fucina': { extras: [it(21, 18, 25, 90, 70)], people: [{ who: 3, x: 22, y: 18, label: 'Il fabbro', text: '«Batto il ferro a sessanta colpi al minuto. Iris dice che sono il suo metronomo.»' }], items: [it(10, 15, 15, 125, 90), it(11, 33, 15, 120, 85), it(2, 33, 24, 115, 110), it(15, 24, 11, 110, 85), it(7, 20, 22, 170, 100)], spot: { x: 33, y: 16.6, label: 'Gli amplificatori della fucina', text: () => 'Il fabbro costruisce casse per i gruppi della valle. «Il metal è come il ferro: pulito prima, forte dopo.»' } },
 'La Fortezza': { extras: [it(20, 19, 18, 60, 110)], items: [it(11, 14, 14, 120, 85), it(11, 34, 14, 120, 85), it(10, 15, 24, 125, 90), it(10, 33, 24, 125, 90), it(9, 24, 15, 50, 100), it(7, 24, 21, 190, 100)], spot: { x: 24, y: 16.6, label: 'Il metronomo di Iris', text: () => 'Un vecchio metronomo a pendolo. Sulla base qualcuno ha inciso: «60 · 80 · 100».' } },
 'Mercato del porto': { people: [{ who: 6, x: 28, y: 15, label: 'Il vecchio pescatore', text: '«La clave? Mio nonno la batteva sui remi. Tre e due, tre e due.»' }], items: [it(4, 15, 14, 145, 120), it(6, 25, 19, 120, 100), it(6, 33, 19, 120, 100), it(5, 21, 14, 64, 120), it(7, 25, 25, 170, 100)], spot: { x: 33, y: 20.6, label: 'Il tavolo dei pescatori', text: () => 'I vecchi del porto giocano a carte e battono la clave sul tavolo senza pensarci.' } },
 'Casa del Sol': { extras: [it(18, 16, 24, 110, 100)], items: [it(7, 24, 21, 190, 100), it(0, 15, 15, 135, 100), it(9, 30, 15, 50, 100), it(6, 34, 24, 120, 100), it(15, 24, 11, 110, 85)], spot: { x: 34, y: 25.6, label: 'Le congas di Rosa', text: () => 'Tre congas consumate, una per generazione. Rosa le chiama la nonna, la madre e la ragazza.' } },
 'Casa del vento': { extras: [it(19, 16, 24, 130, 90)], items: [it(1, 15, 15, 90, 150), it(7, 24, 21, 170, 100), it(15, 24, 11, 110, 85), it(6, 33, 19, 120, 100)], spot: { x: 33, y: 20.6, label: 'Le reti da pesca', text: () => 'Teo ripara le reti con lo stesso nodo da anni. «Un nodo sul battere, uno sul levare», dice ridendo.' } },
 'Club Levante': { items: [it(11, 15, 15, 120, 85), it(9, 24, 15, 50, 100), it(0, 33, 15, 135, 100), it(7, 24, 22, 190, 100), it(10, 33, 24, 125, 90)], spot: { x: 24, y: 16.6, label: 'Il palco del club', text: () => 'Un cartello scritto a mano: «Qui si suona piano. Il mare sente tutto.»' } },
 'Caffè Blu': { extras: [it(22, 24, 15, 150, 95)], people: [{ who: 2, x: 27, y: 13.6, label: 'Il barista', text: '«Il signore che lascia melodie sui tovaglioli? Viene da Valdaccordo, ordina sempre un tè e non lo beve mai.»' }], items: [it(6, 16, 16, 120, 100), it(6, 32, 16, 120, 100), it(4, 15, 24, 145, 120), it(15, 24, 11, 110, 85), it(0, 33, 24, 135, 100)], spot: { x: 32, y: 17.6, label: 'Il tavolino vicino alla finestra', text: () => 'Un tovagliolo con una melodia scarabocchiata. Il barista: «Me lo lascia sempre un signore che non ordina mai.»' } },
 'Il Settimo': { extras: [it(28, 18, 24, 80, 120)], items: [it(13, 15, 14, 110, 140), it(9, 24, 15, 50, 100), it(7, 24, 21, 190, 100), it(6, 33, 18, 120, 100), it(0, 33, 25, 135, 100)], spot: { x: 15, y: 16.6, label: 'Il pianoforte del Settimo', text: s => s.puzzles.includes(10) ? 'Sul leggio, la bobina restaurata da Mina. Sull’etichetta: «Le Otto Strade — Riva / A.»' : 'Il pianoforte è accordato un po’ calante. Mina dice che così «canta meglio dopo mezzanotte».' } },
 'Backstage': { extras: [it(29, 28, 25, 70, 120)], items: [it(10, 15, 15, 125, 90), it(11, 33, 15, 120, 85), it(8, 15, 24, 130, 110), it(0, 33, 24, 135, 100), it(9, 24, 15, 50, 100), it(7, 24, 21, 190, 100)], spot: { x: 33, y: 25.6, label: 'Il divano del backstage', text: s => s.finished ? 'Sul divano qualcuno ha lasciato un biglietto: «Grazie per il nome. — A.»' : 'La scaletta del festival è appesa al muro. In fondo, scritto a matita: «ultima band: da confermare».' } }
};

// Incontri sui sentieri: una scena per ogni strada.
export const ROAD_SCENES = {
 '0-1': [12, 'Leo ha forato vicino al ponte. Mentre Nico cerca la toppa, lui strimpella un giro di blues per passare il tempo.'],
 '1-2': [11, 'Emma vi ferma con il microfono: «Due parole per la radio del campeggio? Come vi chiamate?» Nessuno di voi sa rispondere.'],
 '0-2': [15, 'Sami registra il rumore delle officine in lontananza: «Senti? È un rullante enorme.»'],
 '2-3': [12, 'Un treno merci passa lento. Leo conta i vagoni a tempo e vi sfida a seguirlo.'],
 '3-4': [11, 'Emma ha una gomma a terra e un collegamento in diretta tra dieci minuti. Vale tiene il microfono, Nico la bici.'],
 '4-5': [15, 'Un temporale estivo. Sotto una tettoia, Sami fa sentire i tuoni registrati al rallentatore.'],
 '5-6': [12, 'La salita verso l’accademia è ripida. Leo spinge la bici e racconta di un archivio pieno di nastri.'],
 '3-6': [11, 'Emma ha trovato un vecchio manifesto: «Le Otto Strade, 1989». I nomi stampati sono tre.'],
 '5-8': [15, 'Sami ha registrato i gabbiani del porto e li ha messi in loop: diventano un ritmo strano, ma funziona.'],
 '6-10': [12, 'Al tramonto le luci di Notturnia si accendono una alla volta. Leo dice che sembrano note sospese.'],
 '9-10': [11, 'Sul pontile Emma registra le onde: «Battono sul levare, giuro.»'],
 '10-11': [15, 'Sami è emozionato: «Settembre! Ho già finito tre cassette solo con voi.»'],
 '6-7': [12, 'Nella cabina della funivia Leo stringe il manubrio: «Non guardo giù.»'],
 '8-9': [11, 'Emma vi raggiunge sul traghetto: «Il capitano dice che il vostro concerto è stato il più bello dell’anno.»']
};
export const roadKey = (a, b) => Math.min(a, b) + '-' + Math.max(a, b);

// Mistero: ogni città dà un oggetto proprio, ma la rivelazione segue l’ordine della storia.
export const CLUE_FINDS = {
 1: 'Nella custodia della cassetta di Nino',
 2: 'Dentro il flight case che Ada vi regala',
 4: 'Tra le schede della canzone di Lia',
 5: 'Sotto la griglia di Tito',
 7: 'Nell’astuccio di Iris',
 8: 'Sul retro del foglio della clave',
 9: 'Su un biglietto infilato tra le assi del pontile',
 10: 'Nella scatola dell’ultima bobina di Mina'
};
export const CLUE_BEATS = [
 'il disegno di un plettro e una scritta: «Lato B. Non cercare un assolo».',
 'la foto di una vecchia locandina: la band di Riva era in quattro, ma i nomi stampati sono tre.',
 'il titolo «Le Otto Strade», scritto da due mani: una precisa, una con la A arricciata come una chiave di violino.',
 'una frase: «Il quarto teneva insieme gli altri lasciando spazio. Il plettro era il suo portafortuna».',
 'una dedica: «A Riva, perché sappia ricominciare», firmata con una sola lettera arricciata: A.',
 'un nome finalmente intero, Andrea, e una nota: lasciò il circuito dopo il primo festival.',
 'parole di Andrea: «Non volevo diventare una leggenda. Volevo essere ascoltato».',
 'la firma del tema delle Otto Strade: «Riva / Andrea». Il manifesto del festival riportava solo Riva.'
];
export function clueIndex(s, city) { const i = s.puzzles.indexOf(city); return i < 0 ? -1 : Math.min(i, CLUE_BEATS.length - 1); }
export function clueText(s, city) { const i = clueIndex(s, city); return i < 0 ? '' : `${CLUE_FINDS[city] || 'Tra gli appunti'}: ${CLUE_BEATS[i]}`; }
export function cluesFound(s) { return s.puzzles.filter(id => CLUE_FINDS[id]).map(id => ({ city: id, text: clueText(s, id) })); }

export const DEDUCTION = [
 { q: 'Chi ha scritto il tema delle Otto Strade?', options: ['Riva, da solo', 'Riva e Andrea, insieme', 'Il festival di settembre', 'Andrea, da solo'], answer: 1, why: 'Ricordate il titolo scritto da due mani e la firma del tema delle Otto Strade.' },
 { q: 'Perché il nome di Andrea è scomparso?', options: ['Andrea non voleva essere nominato', 'Fu cacciato dalla band', 'Il manifesto lo dimenticò e Andrea si allontanò', 'Riva lo cancellò per invidia'], answer: 2, why: 'Andrea scriveva di voler essere ascoltato, non dimenticato. E il manifesto riportava solo tre nomi.' },
 { q: 'Chi ha scritto la dedica firmata «A»? Confrontate la calligrafia con il registro dei visitatori.', options: ['Arturo, il ferroviere', 'Dario, il custode', 'Mina, del Settimo', 'Riva, per scherzo'], answer: 1, why: 'La A arricciata come una chiave di violino è la stessa del registro dei visitatori.' }
];
export const BAND_NAMES = ['Le Otto Strade', 'Ultimo Banco', 'Cicale Elettriche'];

export function chapter(s) {
 return s.finished ? 'SETTEMBRE · IL BIS' : s.homeShow ? 'SETTEMBRE · VERSO IL FESTIVAL' : s.passes.length >= 8 ? 'FINE AGOSTO · RITORNO A CASA' : s.passes.length >= 5 ? 'AGOSTO · IL VIAGGIO CONTINUA' : s.passes.length >= 2 ? 'LUGLIO · LE STRADE SI APRONO' : s.stage === 'tour' ? 'GIUGNO · LA PARTENZA' : s.stage === 'rival' ? 'GIUGNO · SERA' : s.stage === 'practice' ? 'GIUGNO · POMERIGGIO' : 'GIUGNO · ULTIMA MATTINA DI SCUOLA';
}
export function mysteryReady(s) { return s.puzzles.filter(id => CLUE_FINDS[id]).length === 8; }
export function mysteryEnding(s) { return s.mystery === 2; }

// Messaggi sul telefono: arrivano quando la storia lo permette e possono aprire missioni secondarie.
// done(evento, stato) riceve gli eventi del gioco: song, metro, cable, room, roadPractice.
export const MESSAGES = [
 { id: 'mamma-partenza', from: 'Mamma', when: s => s.stage === 'tour', text: 'Tesoro, hai preso la crema solare? Divertitevi. E rispondi ogni tanto!', reply: null },
 { id: 'emma-foto', from: 11, when: s => s.passes.length >= 2, text: 'Ciao! Sono Emma, della radio del campeggio. Mi mandi una foto della band sul palco di Bellavista? Mi basta un concerto lì, anche se il pass ce l’avete già.', quest: 'Suona un concerto a Bellavista.', done: e => e.type === 'song' && e.city === 4 && e.won && e.kind === 'concert', reply: 'Foto ricevuta! Va in copertina sul notiziario del campeggio.', xp: 40 },
 { id: 'elia-rivincita', from: 0, when: s => s.passes.includes(2), text: 'Ok, ammetto che a Officina non eravate male. Ma il vero rock si suona in Virtuoso. Almeno il 70%. Se ci riesci, il gelato lo offro io.', quest: 'Suona il concerto di Officina in modalità Virtuoso con almeno il 70%.', done: e => e.type === 'song' && e.city === 2 && e.won && e.difficulty === 'expert' && e.score >= 70, reply: '…Ok. Il gelato è vostro. Non ditelo a Bea.', xp: 80 },
 { id: 'nino-strumento', from: 3, when: s => s.passes.length >= 3, text: 'Il blues cambia faccia con ogni strumento. Torna a Rivafosca e suonalo con uno strumento diverso dal tuo: le sale prove ti lasciano cambiare.', quest: 'A Rivafosca, supera una prova o un concerto con uno strumento diverso da quello iniziale.', done: (e, s) => e.type === 'song' && e.city === 1 && e.won && e.instrument !== s.starter, reply: 'Hai sentito? Stesse dodici battute, un’altra storia.', xp: 50 },
 { id: 'leo-foratura', from: 12, when: s => s.bicycle, text: 'Ho forato sul sentiero tra Grooveto e Valdaccordo. Se passate di lì fermatevi a suonare con me, almeno il tempo passa.', quest: 'Sul sentiero tra Grooveto e Valdaccordo, fermati a provare con Leo.', done: e => e.type === 'roadPractice' && e.road === '5-6', reply: 'Ruota sistemata e giro imparato. Giornata perfetta!', xp: 40 },
 { id: 'arturo-mare', from: 13, when: s => s.transport?.metro === 3, text: 'Il pass funziona? Provate la linea fino al mare, a Porto del Sol. Poi ditemi se gli annunci si sentono bene.', quest: 'Prendi la metro fino a Porto del Sol (dopo averlo raggiunto una prima volta).', done: e => e.type === 'metro' && e.to === 8, reply: 'Allora gli annunci arrivano fino al porto. Grazie, ragazzi.', xp: 30 },
 { id: 'sami-funivia', from: 15, when: s => s.passes.length >= 4, text: 'Mi serve il suono della funivia di Monteferro per la mia collezione! Lo registrate per me?', quest: 'Prendi la funivia tra Valdaccordo e Monteferro.', done: e => e.type === 'cable', reply: 'Il cigolio è perfetto. Ci farò un ritmo, giuro.', xp: 30 },
 { id: 'bea-spazio', from: 1, when: s => s.passes.includes(5), text: 'Tito mi ha insegnato a tacere. Vieni a Grooveto e suona il funk: voglio sentire come lasci spazio tu.', quest: 'Suona un concerto o una prova a Grooveto.', done: e => e.type === 'song' && e.city === 5 && e.won, reply: 'Ho contato le pause. Erano tutte al posto giusto.', xp: 40 },
 { id: 'mina-frase', from: 10, when: s => s.puzzles.includes(10), text: 'Ho scritto una frase nuova sul pianoforte del Settimo. Passa a leggerla, quando sei a Notturnia.', quest: 'Entra al Settimo, a Notturnia.', done: e => e.type === 'room' && e.label === 'Il Settimo', reply: '«Chi ascolta, poi risponde.» L’ho scritta pensando a voi.', xp: 30 },
 { id: 'mamma-torta', from: 'Mamma', when: s => s.passes.length >= 6, text: 'Quando passi da Borgo fai un salto a casa? Ho fatto la torta di pesche.', quest: 'Entra in casa a Borgo delle Cicale.', done: e => e.type === 'room' && e.label === 'Casa', reply: 'Era buona? Te ne ho messa una fetta nello zaino. Fate i bravi.', xp: 20 }
];
export function newMessages(s) { return MESSAGES.filter(m => !s.msgs?.[m.id] && m.when(s)); }
export function questsFor(s, event) { return MESSAGES.filter(m => m.quest && s.msgs?.[m.id] && !s.msgs[m.id].d && m.done(event, s)); }
