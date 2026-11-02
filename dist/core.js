export const INSTRUMENTS={guitar:{name:'Chitarra',role:'Riff, accordi e note sostenute.',lanes:4,labels:['D','F','J','K'],colors:['#d48d5b','#d9bd65','#80ad96','#9b91bc']},bass:{name:'Basso',role:'Pause, sincopi e groove.',lanes:3,labels:['D','F','J'],colors:['#d48d5b','#d9bd65','#80ad96']},drums:{name:'Batteria',role:'Cassa, rullante, charleston e piatto.',lanes:4,labels:['D','F','J','K'],colors:['#d48d5b','#d9bd65','#80ad96','#9b91bc']}};
export const CITIES=[
{id:0,name:'Borgo delle Cicale',genre:'Casa',type:'story',color:'#6a9270',roof:'#b66b50',month:'GIUGNO',text:'Il profumo dei campi, la strada verso scuola. Il mondo comincia qui.'},
{id:1,name:'Rivafosca',genre:'Blues',type:'music',color:'#6b9d9e',roof:'#647b93',bpm:90,root:110,teacher:'Nino',lesson:'Ascolta la frase. Poi rispondi, senza avere fretta.',pattern:[0,1,0,2]},
{id:2,name:'Officina',genre:'Rock',type:'music',color:'#87947a',roof:'#a35746',bpm:112,root:146.83,teacher:'Ada',lesson:'Un riff semplice, suonato insieme, può riempire una stanza.',pattern:[0,0,2,3]},
{id:3,name:'Binario Nord',genre:'Crocevia',type:'story',color:'#8fa38b',roof:'#8e775c',month:'LUGLIO',text:'Al campeggio passano band da tutta la regione. Qui trovi una vecchia bicicletta.'},
{id:4,name:'Bellavista',genre:'Pop',type:'music',color:'#aac38b',roof:'#cb9488',bpm:108,root:130.81,teacher:'Lia',lesson:'Strofa, ritornello, ponte. Ogni parte ha il suo posto.',pattern:[0,1,0,3]},
{id:5,name:'Grooveto',genre:'Funk',type:'music',color:'#9aaa71',roof:'#9e8053',bpm:104,root:98,teacher:'Tito',lesson:'Il silenzio tra due note è parte del groove.',pattern:[0,2,1,2]},
{id:6,name:'Valdaccordo',genre:'Archivio',type:'story',color:'#8fa68b',roof:'#8c7384',text:'Una scuola chiusa, una vecchia cassetta. Anche il vostro insegnante aveva una band.'},
{id:7,name:'Monteferro',genre:'Metal',type:'music',color:'#7e8c8c',roof:'#666d80',bpm:136,root:82.41,teacher:'Iris',lesson:'Energia e controllo. Prima pulito, poi veloce.',pattern:[0,0,1,3]},
{id:8,name:'Porto del Sol',genre:'Latino',type:'music',color:'#a4b58a',roof:'#ca805c',bpm:116,root:123.47,teacher:'Rosa',lesson:'Segui gli accenti. Il ritmo è un cerchio, non una fila.',pattern:[0,2,1,3]},
{id:9,name:'Isola Levante',genre:'Reggae',type:'music',color:'#94bd8a',roof:'#b8935d',bpm:84,root:130.81,teacher:'Teo',lesson:'Lascia respirare il battere. Cerca lo spazio in mezzo.',pattern:[1,3,1,3]},
{id:10,name:'Notturnia',genre:'Jazz',type:'music',color:'#7e8f9b',roof:'#777396',bpm:100,root:116.54,teacher:'Mina',lesson:'Ascolta gli altri. Una variazione può diventare una risposta.',pattern:[0,2,3,1]},
{id:11,name:'Settembre',genre:'Festival',type:'final',color:'#99a77a',roof:'#c29c62',month:'SETTEMBRE',text:'Il palco che sembrava lontanissimo. Tutte le strade portano qui.'}
];
export const EDGES=[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11],[3,6],[5,8],[2,0],[10,6]];
export const MUSIC_CITIES=CITIES.filter(c=>c.type==='music');
export const DEFAULT_SETTINGS={volume:.55,offset:0,difficulty:'normal',muted:false};
export function initialState(instrument='guitar'){return {version:1,instrument,city:0,x:10.5,y:14,facing:'south',introDone:false,scene:null,stage:'school',passes:[],puzzles:[],visited:[0],stories:[],bicycle:false,bike:false,boat:false,homeShow:false,finished:false,xp:0,best:{},settings:{...DEFAULT_SETTINGS}};}
export function validateState(s){
 if(!s||s.version!==1||!INSTRUMENTS[s.instrument]||!Number.isInteger(s.city)||!CITIES[s.city])return null;
 const out=initialState(s.instrument);const ids=a=>Array.isArray(a)?[...new Set(a.filter(n=>Number.isInteger(n)&&CITIES[n]))]:[];
 out.city=s.city;out.x=Number.isFinite(s.x)?Math.min(46.7,Math.max(1.3,s.x)):10.5;out.y=Number.isFinite(s.y)?Math.min(32.7,Math.max(1.3,s.y)):14;
 out.facing=['north','south','east','west'].includes(s.facing)?s.facing:'south';out.introDone=s.introDone===undefined?true:s.introDone===true;
 if(s.scene?.type==='road'&&s.scene.from===s.city&&neighbors(s.scene.from).includes(s.scene.to))out.scene={type:'road',from:s.scene.from,to:s.scene.to};
 if(s.scene?.type==='interior'&&typeof s.scene.label==='string'&&s.scene.label.length<80)out.scene={type:'interior',label:s.scene.label};
 out.stage=['school','practice','rival','tour'].includes(s.stage)?s.stage:'school';out.passes=ids(s.passes).filter(id=>CITIES[id].type==='music');out.puzzles=ids(s.puzzles).filter(id=>CITIES[id].type==='music');out.visited=[...new Set([0,...ids(s.visited),out.city])];out.stories=ids(s.stories).filter(id=>CITIES[id].type==='story');
 for(const k of ['bicycle','bike','boat','homeShow','finished'])out[k]=s[k]===true;
 out.xp=Number.isFinite(s.xp)?Math.min(100000,Math.max(0,Math.floor(s.xp))):0;
 if(s.best&&typeof s.best==='object')for(const [key,value]of Object.entries(s.best))if(/^\d+$/.test(key)&&Number.isFinite(value))out.best[key]=Math.max(0,Math.min(100,value));
 const st=s.settings||{};out.settings={volume:Number.isFinite(st.volume)?Math.max(0,Math.min(1,st.volume)):.55,offset:Number.isFinite(st.offset)?Math.max(-250,Math.min(250,st.offset)):0,difficulty:['assist','normal','expert'].includes(st.difficulty)?st.difficulty:'normal',muted:st.muted===true};return out;
}
export function neighbors(id){return EDGES.filter(e=>e.includes(id)).map(e=>e[0]===id?e[1]:e[0]);}
export function stepToward(start,target,budget){const dx=target.x-start.x,dy=target.y-start.y,length=Math.hypot(dx,dy);if(!length)return {dx:0,dy:0};const distance=Math.min(Math.max(0,budget),length);return {dx:dx/length*distance,dy:dy/length*distance};}
export function findPath(start,target,canEnter,maxX=66,maxY=34){
 const from=[Math.round(start.x),Math.round(start.y)],to=[Math.round(target.x),Math.round(target.y)],key=(x,y)=>x+','+y;
 if(!canEnter(to[0],to[1]))return [];
 const queue=[from],parents=new Map([[key(...from),null]]);let head=0;
 while(head<queue.length){const p=queue[head++];if(p[0]===to[0]&&p[1]===to[1]){const path=[];let current=p;while(current){path.push({x:current[0],y:current[1]});current=parents.get(key(...current));}return path.reverse().slice(1);}
 for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const x=p[0]+dx,y=p[1]+dy,k=key(x,y);if(x<0||y<0||x>maxX||y>maxY||parents.has(k)||!canEnter(x,y))continue;parents.set(k,p);queue.push([x,y]);}}
 return [];
}
export function gate(s,to){if(s.stage!=='tour')return 'Prima ritrova gli amici alla sala prove.';if(to===11&&s.passes.length<8)return 'Il festival richiede tutti e otto i pass.';if(to===11&&!s.homeShow)return 'Prima del festival, gli amici ti aspettano per il concerto a casa.';return null;}
export function month(s){return s.finished||s.city===11?'SETTEMBRE':s.passes.length>=5?'AGOSTO':s.passes.length>=2?'LUGLIO':'GIUGNO';}
export function makeChart(instrument,city,difficulty='normal',kind='concert'){
 const c=CITIES[city]||CITIES[1],bpm=c.bpm||104,beat=60/bpm,lanes=INSTRUMENTS[instrument].lanes;
 const bars=kind==='tutorial'?6:kind==='rival'?8:kind==='final'?24:16;
 const notes=[];const add=(b,l,d=0)=>notes.push({id:notes.length,t:2+b*beat,lane:l%lanes,duration:d*beat});
 for(let bar=0;bar<bars;bar++)for(let b=0;b<4;b++){
   const pos=bar*4+b,root=(bar+Math.floor(bar/4))%lanes;
   if(instrument==='guitar'){
    const off=c.genre==='Reggae'?.5:c.genre==='Jazz'&&b%2?1/6:0;
    if(difficulty==='assist'&&b%2)continue;
    add(pos+off,(root+b)%lanes,b===3&&bar%3===1?.65:0);
    if(difficulty!=='assist'&&bar%4===3&&b===0)add(pos+off,(root+b+2)%lanes);
    if(difficulty==='expert'&&b%2===0)add(pos+.5,(root+b+1)%lanes);
   }else if(instrument==='bass'){
    if(b===0||b===2)add(pos,(root+(b===2?1:0))%lanes,b===0&&bar%4===1?.7:0);
    if(difficulty!=='assist'&&b===3&&bar%2===1)add(pos+.5,(root+2)%lanes);
    if(difficulty==='expert'&&b===1)add(pos+.5,(root+1)%lanes);
   }else{
    if(b%2===0)add(pos,0);else add(pos,1);
    if(difficulty!=='assist')add(pos+(c.genre==='Jazz'?1/6:0),2);
    if(bar%4===3&&b===3)add(pos+.5,3);
    if(difficulty==='expert'&&b%2===0)add(pos+.5,2);
   }
 }
 notes.sort((a,b)=>a.t-b.t||a.lane-b.lane);return {notes,bpm,beat,bars,duration:2+bars*4*beat+1,city,instrument};
}
export function hitWindow(difficulty){return difficulty==='assist'?.24:difficulty==='expert'?.105:.16;}
export function findNote(notes,lane,time,window){let candidate=null;for(const n of notes){if(n.lane!==lane||n.status||Math.abs(n.t-time)>window)continue;if(!candidate||Math.abs(n.t-time)<Math.abs(candidate.t-time))candidate=n;}return candidate;}
export function accuracy(notes){if(!notes.length)return 0;return Math.round(100*notes.reduce((s,n)=>s+(n.points||0),0)/notes.length);}
export function award(s,id,score,kind){
 const first=!(String(id)in s.best);s.best[id]=Math.max(s.best[id]||0,score);
 const threshold=s.settings.difficulty==='assist'?35:50;const won=score>=threshold;
 if(kind==='tutorial'){s.stage='rival';return {won:true,message:'Ora siete pronti per provare a suonare insieme.'};}
 if(kind==='rival'){s.stage='tour';return {won:true,message:score>=75?'Hai sorpreso i rivali. La band ha ancora strada da fare: loro vincono il confronto, ma ricordano il tuo nome.':'I rivali vincono il confronto. Voi avete appena cominciato: è il momento di partire.'};}
 if(!won)return {won:false,message:'Ci siamo quasi. Puoi allenarti, riprovare o scegliere la modalità accessibile.'};
 if(kind==='boat'){s.boat=true;return {won:true,message:'Il concerto sul ponte è riuscito. Prossima fermata: Isola Levante.'};}
 if(kind==='home'){s.homeShow=true;return {won:true,message:'Stavolta il paese chiede il bis. Il festival vi aspetta.'};}
 if(kind==='final'){s.finished=true;return {won:true,message:'Dal garage al festival. Questa estate è vostra.'};}
 if(kind==='practice')return {won:true,message:'Una buona prova. Il palco ti aspetta quando vuoi.'};
 if(!s.passes.includes(id)){s.passes.push(id);s.xp+=100;}else if(first)s.xp+=10;
 return {won:true,message:`Pass ${CITIES[id].genre} ottenuto. Un altro pezzo di estate da portare con voi.`};
}
