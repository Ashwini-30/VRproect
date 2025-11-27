/* Clean VR Navigation + Audio + PPE + Quest Controller Support */

(() => {
const ASSETS='Images/';
const AUDIO='Audio/';
const START='mainentry';
const FADE=document.getElementById('fade');

const sky=document.getElementById('sky');
const btnPrev=document.getElementById('btnPrev');
const btnNext=document.getElementById('btnNext');
const btnEnter=document.getElementById('btnEnter');

const subBox=document.getElementById('subtitles');
const progWrap=document.getElementById('progressWrap');
const progBar=document.getElementById('progressBar');
const btnAudioPlay=document.getElementById('btnAudioPlay');
const btnAudioStop=document.getElementById('btnAudioStop');
const btnAudioReplay=document.getElementById('btnAudioReplay');

const ppeToggle=document.getElementById('ppeToggle');
const ppePanel=document.getElementById('ppePanel');
const ppeMsg=document.getElementById('ppeMsg');
const ppeSceneType=document.getElementById('ppeSceneType');
const ppeClose=document.getElementById('ppeClose');
const ppeItems=document.querySelectorAll('.ppe-item');

let currentAudio=null,currentScene=null,ppeAudio=null,ppeOrder=[],step=0;

/******************* NAV MAP (unchanged) *******************/
const nav={mainentry:{prev:"",next:"cn1",enter:"cn1"},c1:{prev:"c2",next:"entry",enter:"c2"},
c2:{prev:"c1",next:"c3",enter:"eb1"},c3:{prev:"c2",next:"c4",enter:""},c4:{prev:"c3",next:"c5",enter:""},
c5:{prev:"c4",next:"c6",enter:""},c6:{prev:"c5",next:"c7",enter:"cr"},c7:{prev:"c6",next:"c8",enter:"gb1"},
c8:{prev:"c7",next:"cn7",enter:"wb1"},cn1:{prev:"mainentry",next:"cn2",enter:""},cn2:{prev:"cn1",next:"cn3",enter:""},
cn3:{prev:"cn2",next:"cn5",enter:"l1"},cn5:{prev:"cn3",next:"cn6",enter:""},cn6:{prev:"cn5",next:"cn7",enter:""},
cn7:{prev:"c8",next:"",enter:"ch1"},entry:{prev:"",next:"c1",enter:"c1"},ch1:{prev:"cn7",next:"ch2",enter:""},
ch2:{prev:"ch1",next:"ch3",enter:""},ch3:{prev:"ch2",next:"ch4",enter:""},ch4:{prev:"ch3",next:"ch5",enter:""},
ch5:{prev:"ch4",next:"ch6",enter:""},ch6:{prev:"ch5",next:"ch7",enter:""},ch7:{prev:"ch6",next:"",enter:""},
cr:{prev:"c6",next:"",enter:""},eb1:{prev:"c2",next:"eb2",enter:""},eb2:{prev:"eb1",next:"eb3",enter:""},
eb3:{prev:"eb2",next:"eb4",enter:""},eb4:{prev:"eb3",next:"",enter:""},gb1:{prev:"c7",next:"gb2",enter:""},
gb2:{prev:"gb1",next:"gb3",enter:""},gb3:{prev:"gb2",next:"c8",enter:""},l1:{prev:"cn3",next:"l2",enter:""},
l2:{prev:"l1",next:"l3",enter:""},l3:{prev:"l2",next:"l4",enter:""},l4:{prev:"l3",next:"",enter:""},
wb1:{prev:"c8",next:"wb2",enter:""},wb2:{prev:"wb1",next:"",enter:""}};

/**************** PPE ORDERS ****************/
let isL=i=>i.startsWith('l')||i.startsWith('ch');
let isW=i=>i.startsWith('wb')||i.startsWith('gb')||i.startsWith('cr')||i.startsWith('eb');

function orderFor(s){
return isL(s)?["ppe6","ppe7","ppe8","ppe10","ppe9","ppe3","ppe4","ppe5"]
:            ["ppe1","ppe7","ppe2","ppe10","ppe9","ppe3","ppe4","ppe5"];
}

function resetPPE(){
step=0;ppePanel.style.display='none';ppeMsg.innerText="Tap PPE to start";
ppeItems.forEach(i=>{i.classList.remove('selected');i.style.opacity='1'});
ppeAudio&&(ppeAudio.pause(),ppeAudio.currentTime=0);
}

/**************** AUDIO ****************/
function stopAudio(){currentAudio&&(currentAudio.pause(),currentAudio.currentTime=0);
subBox.style.display="none";progWrap.style.display="none";progBar.style.width="0";}

function play(scene){
stopAudio();currentScene=scene;
let a=new Audio(`${AUDIO}${scene}.mp3`);currentAudio=a;
subBox.style.display="block";progWrap.style.display="block";
subBox.innerText=scene;

a.ontimeupdate=()=>{progBar.style.width=((a.currentTime/a.duration)*100)+"%"};
a.onended=()=>subBox.innerText=`${scene} complete.`;
a.play().catch(()=>{});
}

/**************** SCENE LOAD ****************/
function load(s){
FADE.classList.add("on");
setTimeout(()=>{
sky.setAttribute("src",`${ASSETS}${s}.jpg`);
let n=nav[s];btnPrev.setAttribute("src","Images/prevb.png");
btnNext.setAttribute("src","Images/nextb.png");btnEnter.setAttribute("src","Images/enterbb.png");

btnPrev.onclick=()=>n.prev&&load(n.prev);
btnNext.onclick=()=>n.next&&load(n.next);
btnEnter.onclick=()=>n.enter&&load(n.enter);

ppeOrder=orderFor(s);resetPPE();
play(s);
FADE.classList.remove("on");
},250);
}

/**************** VR BUTTON MAPPING ****************/
document.querySelectorAll(".vrbtn").forEach(b=>{
 b.addEventListener("click",()=>{
   if(b.id=="vrPlay")btnAudioPlay.click();
   if(b.id=="vrStop")btnAudioStop.click();
   if(b.id=="vrReplay")btnAudioReplay.click();
   if(b.id=="vrPPE")ppeToggle.click();
 });
});

document.querySelectorAll(".ppe-item").forEach(p=>{
 p.addEventListener("click",e=>{
   if(ppePanel.style.display=='none')return;
   let id=p.dataset.id,ex=ppeOrder[step];
   if(id==ex){p.classList.add("selected");p.style.opacity=".3";step++;
     ppeMsg.innerText=step==ppeOrder.length?"✔ Complete":"Next item "+(step+1);}
   else ppeMsg.innerText="Wrong order ❌";
 });
});

/**************** PPE BUTTON ****************/
ppeToggle.onclick=()=>{
 resetPPE();ppeMsg.innerText="Audio Playing...";
 let x=new Audio(isL(currentScene)?`${AUDIO}cl.mp3`:`${AUDIO}others.mp3`);
 x.onended=()=>{ppePanel.style.display="block";ppeMsg.innerText="Select PPE in correct order"};
 x.play().catch(()=>ppePanel.style.display="block");
 ppeAudio=x;
};

ppeClose.onclick=()=>resetPPE();

/**************** INIT ****************/
window.onload=()=>load(START);

})();
