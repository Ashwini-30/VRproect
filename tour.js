/* Clean controls: floor logo + image buttons (prev/enter/next)
  360 images: Images/<scene>.jpg
  Scene audio: Audio/<scene>.mp3
  PPE audio:  Audio/cl.mp3 , Audio/others.mp3
*/


(() => {

 const ASSETS = 'Images/';
 const AUDIO  = 'Audio/';
 const START  = 'mainentry';
 const FADE   = document.getElementById('fade');

 /* DOM ELEMENTS */
 const sky       = document.getElementById('sky');
 const btnPrev   = document.getElementById('btnPrev');
 const btnNext   = document.getElementById('btnNext');
 const btnEnter  = document.getElementById('btnEnter');

 /* AUDIO */
 const subBox   = document.getElementById('subtitles');
 const progWrap = document.getElementById('progressWrap');
 const progBar  = document.getElementById('progressBar');
 const btnAudioPlay   = document.getElementById('btnAudioPlay');
 const btnAudioStop   = document.getElementById('btnAudioStop');
 const btnAudioReplay = document.getElementById('btnAudioReplay');

 let currentSceneId=null,currentAudio=null;

 /* PPE ELEMENTS */
 const ppeToggle    = document.getElementById('ppeToggle');
 const ppePanel     = document.getElementById('ppePanel');
 const ppeMsg       = document.getElementById('ppeMsg');
 const ppeItems     = document.querySelectorAll('.ppe-item');
 let ppeAudio=null,ppeAudioFile="others.mp3",order=[],step=0;


 /* SCENE MAP */
 const nav = {
   mainentry:{prev:"",next:"cn1",enter:"cn1"},
   c1:{prev:"c2",next:"entry",enter:"c2"},
   c2:{prev:"c1",next:"c3",enter:"eb1"},
   c3:{prev:"c2",next:"c4",enter:""},
   c4:{prev:"c3",next:"c5",enter:""},
   c5:{prev:"c4",next:"c6",enter:""},
   c6:{prev:"c5",next:"c7",enter:"cr"},
   c7:{prev:"c6",next:"c8",enter:"gb1"},
   c8:{prev:"c7",next:"cn7",enter:"wb1"},
   cn1:{prev:"mainentry",next:"cn2",enter:""},
   cn2:{prev:"cn1",next:"cn3",enter:""},
   cn3:{prev:"cn2",next:"cn5",enter:"l1"},
   cn4:{prev:"",next:"",enter:""},
   cn5:{prev:"cn3",next:"cn6",enter:""},
   cn6:{prev:"cn5",next:"cn7",enter:""},
   cn7:{prev:"c8",next:"",enter:"ch1"},
   entry:{prev:"",next:"c1",enter:"c1"},
   ch1:{prev:"cn7",next:"ch2",enter:""},
   ch2:{prev:"ch1",next:"ch3",enter:""},
   ch3:{prev:"ch2",next:"ch4",enter:""},
   ch4:{prev:"ch3",next:"ch5",enter:""},
   ch5:{prev:"ch4",next:"ch6",enter:""},
   ch6:{prev:"ch5",next:"ch7",enter:""},
   ch7:{prev:"ch6",next:"",enter:""},
   cr:{prev:"c6",next:"",enter:""},
   eb1:{prev:"c2",next:"eb2",enter:""},
   eb2:{prev:"eb1",next:"eb3",enter:""},
   eb3:{prev:"eb2",next:"eb4",enter:""},
   eb4:{prev:"eb3",next:"",enter:""},
   gb1:{prev:"c7",next:"gb2",enter:""},
   gb2:{prev:"gb1",next:"gb3",enter:""},
   gb3:{prev:"gb2",next:"c8",enter:""},
   l1:{prev:"cn3",next:"l2",enter:""},
   l2:{prev:"l1",next:"l3",enter:""},
   l3:{prev:"l2",next:"l4",enter:""},
   l4:{prev:"l3",next:"",enter:""},
   wb1:{prev:"c8",next:"wb2",enter:""},
   wb2:{prev:"wb1",next:"",enter:""}
 };

 /* ============== AUDIO CONTROL ============== */

 function stopAudio(){
   if(currentAudio){currentAudio.pause();currentAudio.currentTime=0;}
   subBox.style.display="none";progWrap.style.display="none";progBar.style.width="0%";
 }

 function playAudio(id){
   stopAudio();
   currentAudio=new Audio(`${AUDIO}${id}.mp3`);
   subBox.style.display="block";progWrap.style.display="block";

   currentAudio.ontimeupdate=()=>progBar.style.width=
     (currentAudio.currentTime/currentAudio.duration)*100+"%";

   currentAudio.onended=()=>subBox.textContent="Narration done.";
   currentAudio.play().catch(()=>{});
 }

 btnAudioPlay.onclick=()=> currentSceneId && (currentAudio?currentAudio.play():playAudio(currentSceneId));
 btnAudioStop.onclick=()=> stopAudio();
 btnAudioReplay.onclick=()=> currentSceneId && playAudio(currentSceneId);


 /* ============== PPE ============== */

 function sceneType(id){
   if(id.startsWith("l")||id.startsWith("ch")) return "cl.mp3",["ppe6","ppe7","ppe8","ppe10","ppe9","ppe3","ppe4","ppe5"];
   return "others.mp3",["ppe1","ppe7","ppe2","ppe10","ppe9","ppe3","ppe4","ppe5"];
 }

 ppeToggle.onclick=()=>{
   step=0;
   ppePanel.style.display="block";
   ppeAudioFile = sceneType(currentSceneId)[0];
   ppeAudio=new Audio(`${AUDIO}${ppeAudioFile}`);
   ppeAudio.play();
 };

 ppeItems.forEach(el=>{
   el.onclick=()=>{
     const id=el.dataset.id;let arr=sceneType(currentSceneId)[1];
     if(id===arr[step]){el.style.opacity=0.3;step++;ppeMsg.textContent="Next...";}
     else ppeMsg.textContent="Wrong item!";
   };
 });


 /* ============== SCENE LOAD ============== */

 function gotoScene(id){
   currentSceneId=id;
   FADE.classList.add("on");

   setTimeout(()=>{
     sky.setAttribute("src",`${ASSETS}${id}.jpg`);
     let cfg=nav[id];

     setBtn(btnPrev,cfg.prev);
     setBtn(btnNext,cfg.next);
     setBtn(btnEnter,cfg.enter);

     playAudio(id);
     FADE.classList.remove("on");
   },200);
 }

 function setBtn(btn,target){
   btn.classList.remove("clickable");
   if(target){
     btn.classList.add("clickable");
     btn.onclick=()=>gotoScene(target);
   }
 }


 /* ============== INIT ============== */

 window.onload=()=>gotoScene(START);






 /* **********************************************************************************
   🔥 MAIN CONTROLLER FIX:
   Controller → triggers click() on whatever is in center of view → audio+PPE works
 ***********************************************************************************/

function fireDOMClickFromVR(){
    const el=document.elementFromPoint(window.innerWidth/2,window.innerHeight/2);
    if(el) el.click(); // THIS is what makes UI work in Quest
}

AFRAME.registerComponent("vr-click",{
 init(){
   this.el.addEventListener("triggerdown",fireDOMClickFromVR);
 }
});

document.querySelector("#rightHand")?.setAttribute("vr-click","");
document.querySelector("#leftHand")?.setAttribute("vr-click","");

})();
