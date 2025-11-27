(() => {

const ASSETS="Images/";
const AUDIO="Audio/";
const START="mainentry";

let scene=START;
let audio=null;

/************* Scene Load *************/
function load(id){
 scene=id;
 document.getElementById("sky").setAttribute("src",ASSETS+id+".jpg");
 play(id);
}

/************* Audio Control *************/
function stopAudio(){
 if(audio){audio.pause();audio.currentTime=0;}
}
function play(id){
 stopAudio();
 audio=new Audio(AUDIO+id+".mp3");
 audio.play().catch(()=>{});
}

document.getElementById("btnAudioPlay").onclick=()=> audio?audio.play():play(scene);
document.getElementById("btnAudioStop").onclick=()=> stopAudio();
document.getElementById("btnAudioReplay").onclick=()=> play(scene);

/************* PPE Logic *************/
const ppePanel=document.getElementById("ppePanel");
let step=0,order=[];

function setOrder(){
 if(scene.startsWith("l")||scene.startsWith("ch"))
   order=["ppe6","ppe7","ppe8","ppe10","ppe9","ppe3","ppe4","ppe5"];
 else
   order=["ppe1","ppe7","ppe2","ppe10","ppe9","ppe3","ppe4","ppe5"];
}

document.getElementById("ppeToggle").onclick=()=>{
 stopAudio();ppePanel.style.display="block";step=0;setOrder();
 new Audio(AUDIO+(scene.startsWith("l")||scene.startsWith("ch")?"cl.mp3":"others.mp3")).play();
}
document.getElementById("ppeClose").onclick=()=>{ppePanel.style.display="none";step=0;}

document.querySelectorAll(".ppe-item").forEach(i=>{
 i.onclick=()=>{
   if(i.dataset.id===order[step]){i.classList.add("selected");step++;}
 }
});

/************* NAV TABLE *************/
const nav={
 mainentry:{next:"cn1",enter:"cn1"},
 c1:{prev:"c2",next:"entry",enter:"c2"},
 c2:{prev:"c1",next:"c3",enter:"eb1"},
 c3:{prev:"c2",next:"c4"},
 c4:{prev:"c3",next:"c5"},
 c5:{prev:"c4",next:"c6"},
 c6:{prev:"c5",next:"c7",enter:"cr"},
 c7:{prev:"c6",next:"c8",enter:"gb1"},
 c8:{prev:"c7",next:"cn7",enter:"wb1"},
 cn1:{prev:"mainentry",next:"cn2"},
 cn2:{prev:"cn1",next:"cn3"},
 cn3:{prev:"cn2",next:"cn5",enter:"l1"},
 cn5:{prev:"cn3",next:"cn6"},
 cn6:{prev:"cn5",next:"cn7"},
 cn7:{prev:"c8",enter:"ch1"},
 ch1:{prev:"cn7",next:"ch2"},
 ch2:{prev:"ch1",next:"ch3"},
 ch3:{prev:"ch2",next:"ch4"},
 ch4:{prev:"ch3",next:"ch5"},
 ch5:{prev:"ch4",next:"ch6"},
 ch6:{prev:"ch5",next:"ch7"},
 eb1:{prev:"c2",next:"eb2"},
 eb2:{prev:"eb1",next:"eb3"},
 eb3:{prev:"eb2",next:"eb4"},
 gb1:{prev:"c7",next:"gb2"},
 gb2:{prev:"gb1",next:"gb3"},
 wb1:{prev:"c8",next:"wb2"}
};

/************* VR Interaction *************/
AFRAME.registerComponent("vr-click",{init(){
 this.el.addEventListener("click",()=>{
   switch(this.el.id){

     case "vrPrev":  if(nav[scene]?.prev)  load(nav[scene].prev);  break;
     case "vrNext":  if(nav[scene]?.next)  load(nav[scene].next);  break;
     case "vrEnter": if(nav[scene]?.enter) load(nav[scene].enter); break;

     case "vrPlay":   document.getElementById("btnAudioPlay").click();break;
     case "vrStop":   document.getElementById("btnAudioStop").click();break;
     case "vrReplay": document.getElementById("btnAudioReplay").click();break;
     case "vrPPE":    document.getElementById("ppeToggle").click();break;
     case "vrPPEclose":document.getElementById("ppeClose").click();break;
   }
 });
}});

["vrPrev","vrNext","vrEnter","vrPlay","vrStop","vrReplay","vrPPE","vrPPEclose"]
.forEach(id=>document.getElementById(id)?.setAttribute("vr-click",""));

/************* Start *************/
window.onload=()=>load(START);

})();
