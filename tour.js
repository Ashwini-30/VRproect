(() => {

const ASSETS="Images/", AUDIO="Audio/", START="mainentry";
const sky=document.getElementById("sky");
const sub=document.getElementById("subtitles"), bar=document.getElementById("progressBar");
let current=null,audio=null;

const btnPrev=document.getElementById("btnPrev");
const btnNext=document.getElementById("btnNext");
const btnEnter=document.getElementById("btnEnter");

const vrPlay=document.getElementById("vrPlay");
const vrStop=document.getElementById("vrStop");
const vrReplay=document.getElementById("vrReplay");
const vrPPE=document.getElementById("vrPPE");
const ppeGrid=document.getElementById("ppeGridVR");
const ppeItems=[...document.querySelectorAll(".ppeVR")];

const nav={mainentry:{next:"cn1",enter:"cn1"},c1:{prev:"c2",next:"entry",enter:"c2"},
c2:{prev:"c1",next:"c3",enter:"eb1"},c3:{prev:"c2",next:"c4"},
c4:{prev:"c3",next:"c5"},c5:{prev:"c4",next:"c6"},
c6:{prev:"c5",next:"c7",enter:"cr"},c7:{prev:"c6",next:"c8",enter:"gb1"},
c8:{prev:"c7",next:"cn7",enter:"wb1"},cn1:{prev:"mainentry",next:"cn2"},
cn2:{prev:"cn1",next:"cn3"},cn3:{prev:"cn2",next:"cn5",enter:"l1"},
cn5:{prev:"cn3",next:"cn6"},cn6:{prev:"cn5",next:"cn7"},cn7:{prev:"c8",enter:"ch1"},
entry:{next:"c1",enter:"c1"},ch1:{prev:"cn7",next:"ch2"},ch2:{prev:"ch1",next:"ch3"},
ch3:{prev:"ch2",next:"ch4"},ch4:{prev:"ch3",next:"ch5"},ch5:{prev:"ch4",next:"ch6"},
ch6:{prev:"ch5",next:"ch7"},l1:{prev:"cn3",next:"l2"},l2:{prev:"l1",next:"l3"},
l3:{prev:"l2",next:"l4"},wb1:{prev:"c8",next:"wb2"}};

function load(id){
 current=id; sky.setAttribute("src",`${ASSETS}${id}.jpg`);
 let n=nav[id]||{};
 set(btnPrev,n.prev); set(btnNext,n.next); set(btnEnter,n.enter);
 playAudio(id);
}

function set(btn,target){
 btn.setAttribute("visible",!!target);
 btn.onclick=target?()=>load(target):null;
}

function playAudio(id){
 if(audio)audio.pause();
 audio=new Audio(`${AUDIO}${id}.mp3`);
 sub.style.display="block"; bar.style.width="0";
 audio.ontimeupdate=()=>bar.style.width=(audio.currentTime/audio.duration)*100+"%";
 audio.play();
}

vrPlay.onclick=()=>audio&&audio.play();
vrStop.onclick=()=>audio&&(audio.pause(),audio.currentTime=0);
vrReplay.onclick=()=>current&&playAudio(current);

vrPPE.onclick=()=>ppeGrid.setAttribute("visible",true);
ppeItems.forEach(i=>i.onclick=()=>i.setAttribute("opacity",0.3));

load(START);

})();
