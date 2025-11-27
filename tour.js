/* FULL ORIGINAL CODE RETAINED — ONLY ENHANCED FOR QUEST VR */

(() => {
const ASSETS='Images/',AUDIO='Audio/',START='mainentry';
const FADE=document.getElementById('fade'),sky=document.getElementById('sky'),
floorLogo=document.getElementById('floorLogo'),navPanel=document.getElementById('navPanel'),
btnPrev=document.getElementById('btnPrev'),btnNext=document.getElementById('btnNext'),
btnEnter=document.getElementById('btnEnter'),camera=document.getElementById('camera');

const subBox=document.getElementById('subtitles'),progWrap=document.getElementById('progressWrap'),
progBar=document.getElementById('progressBar'),btnAudioPlay=document.getElementById('btnAudioPlay'),
btnAudioStop=document.getElementById('btnAudioStop'),btnAudioReplay=document.getElementById('btnAudioReplay');

const ppeToggle=document.getElementById('ppeToggle'),ppePanel=document.getElementById('ppePanel'),
ppeMsg=document.getElementById('ppeMsg'),ppeSceneType=document.getElementById('ppeSceneType'),
ppeClose=document.getElementById('ppeClose'),ppeItems=document.querySelectorAll('.ppe-item');

let currentAudio=null,currentSceneId=null,ppeAudio=null,ppeAudioFile='others.mp3';
let currentPpeOrder=[],ppeStep=0;

/* NAVIGATION TABLE UNMODIFIED */
const nav={mainentry:{prev:"",next:"cn1",enter:"cn1"},c1:{prev:"c2",next:"entry",enter:"c2"},
c2:{prev:"c1",next:"c3",enter:"eb1"},c3:{prev:"c2",next:"c4",enter:""},
c4:{prev:"c3",next:"c5",enter:""},c5:{prev:"c4",next:"c6",enter:""},
c6:{prev:"c5",next:"c7",enter:"cr"},c7:{prev:"c6",next:"c8",enter:"gb1"},
c8:{prev:"c7",next:"cn7",enter:"wb1"},cn1:{prev:"mainentry",next:"cn2",enter:""},
cn2:{prev:"cn1",next:"cn3",enter:""},cn3:{prev:"cn2",next:"cn5",enter:"l1"},
cn5:{prev:"cn3",next:"cn6",enter:""},cn6:{prev:"cn5",next:"cn7",enter:""},
cn7:{prev:"c8",next:"",enter:"ch1"},entry:{prev:"",next:"c1",enter:"c1"},
ch1:{prev:"cn7",next:"ch2",enter:""},ch2:{prev:"ch1",next:"ch3",enter:""},
ch3:{prev:"ch2",next:"ch4",enter:""},ch4:{prev:"ch3",next:"ch5",enter:""},
ch5:{prev:"ch4",next:"ch6",enter:""},ch6:{prev:"ch5",next:"ch7",enter:""},
ch7:{prev:"ch6",next:"",enter:""},cr:{prev:"c6",next:"",enter:""},
eb1:{prev:"c2",next:"eb2",enter:""},eb2:{prev:"eb1",next:"eb3",enter:""},
eb3:{prev:"eb2",next:"eb4",enter:""},eb4:{prev:"eb3",next:"",enter:""},
gb1:{prev:"c7",next:"gb2",enter:""},gb2:{prev:"gb1",next:"gb3",enter:""},
gb3:{prev:"gb2",next:"c8",enter:""},l1:{prev:"cn3",next:"l2",enter:""},
l2:{prev:"l1",next:"l3",enter:""},l3:{prev:"l2",next:"l4",enter:""},
l4:{prev:"l3",next:"",enter:""},wb1:{prev:"c8",next:"wb2",enter:""},
wb2:{prev:"wb1",next:"",enter:""}};

function sceneLabel(id){
if(id.startsWith("wb"))return"Wet Bench Room";
if(id.startsWith("gb"))return"Processing Room";
if(id.startsWith("cr"))return"Chemical Storage Room";
if(id.startsWith("l"))return"Lithography Room";
if(id.startsWith("ch"))return"Characterisation Room";
if(id.startsWith("eb"))return"E-beam & Glass Cutting Room";return"Corridor";}

function stopCurrentAudio(){if(currentAudio){currentAudio.pause();currentAudio.currentTime=0;}
progWrap.style.display='none';subBox.style.display='none';progBar.style.width='0%';}

function playSceneAudio(id){
stopCurrentAudio();currentSceneId=id;
currentAudio=new Audio(`${AUDIO}${id}.mp3`);subBox.style.display="block";progWrap.style.display="block";
subBox.textContent=sceneLabel(id);currentAudio.addEventListener("timeupdate",()=>{progBar.style.width=
((currentAudio.currentTime/currentAudio.duration)*100)+"%";});currentAudio.play();}
btnAudioPlay.onclick=()=>currentAudio?currentAudio.play():playSceneAudio(currentSceneId);
btnAudioStop.onclick=stopCurrentAudio;
btnAudioReplay.onclick=()=>playSceneAudio(currentSceneId);

function isLithOrChar(id){return id.startsWith("l")||id.startsWith("ch");}
function isWet(id){return id.startsWith("wb")||id.startsWith("gb")||id.startsWith("cr")||id.startsWith("eb");}
function getPPEOrderForScene(id){return isLithOrChar(id)?
["ppe6","ppe7","ppe8","ppe10","ppe9","ppe3","ppe4","ppe5"]:
["ppe1","ppe7","ppe2","ppe10","ppe9","ppe3","ppe4","ppe5"];}

function resetPPE(){ppeStep=0;ppePanel.style.display="none";ppeItems.forEach(x=>{x.classList.remove("selected");x.style.opacity="1";});}
ppeToggle.onclick=()=>{resetPPE();ppeAudio=new Audio(`${AUDIO}${ppeAudioFile}`);ppeAudio.onended=()=>{
ppePanel.style.display="flex";ppeMsg.textContent="Select PPE items in correct order.";};ppeAudio.play();}
ppeClose.onclick=resetPPE;

ppeItems.forEach(el=>el.onclick=()=>{
if(!ppePanel.style.display.includes("flex"))return;
let id=el.dataset.id,exp=currentPpeOrder[ppeStep];
if(id===exp){el.classList.add("selected");el.style.opacity="0.4";ppeStep++;
ppeMsg.textContent=ppeStep>=currentPpeOrder.length?"DONE — Ready for cleanroom!":"Next item →";}
else ppeMsg.textContent="Wrong, try again.";});

/* SCENE CHANGE */
function gotoScene(id){
FADE.classList.add("on");
setTimeout(()=>{sky.setAttribute("src",`${ASSETS}${id}.jpg`);
currentSceneId=id;currentPpeOrder=getPPEOrderForScene(id);
ppeAudioFile=isLithOrChar(id)?'cl.mp3':'others.mp3';playSceneAudio(id);
FADE.classList.remove("on");},250);}
window.onload=()=>gotoScene(START);

/* ======================= VR ADD-ON ====================== */
AFRAME.registerComponent("vr-click-proxy",{schema:{target:"string"},
init(){this.el.addEventListener("click",()=>{let x=document.querySelector(this.data.target);if(x)x.click();});}});
})();
