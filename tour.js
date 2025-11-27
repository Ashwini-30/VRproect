/* Clean controls: floor logo + image buttons (prev/enter/next)
  360 images: Images/<scene>.jpg
  Nav icons: Images/prevb.png, Images/nextb.png, Images/enterbb.png, Images/iit.png
  Scene audio: Audio/<scene>.mp3
  PPE audio:  Audio/cl.mp3 (litho + char), Audio/others.mp3 (all other rooms)
*/

(() => {
 const ASSETS = 'Images/';
 const AUDIO  = 'Audio/';
 const START  = 'mainentry';
 const FADE   = document.getElementById('fade');

 // Scene DOM refs
 const sky       = document.getElementById('sky');
 const floorLogo = document.getElementById('floorLogo');
 const navPanel  = document.getElementById('navPanel');
 const btnPrev   = document.getElementById('btnPrev');
 const btnNext   = document.getElementById('btnNext');
 const btnEnter  = document.getElementById('btnEnter');
 const camera    = document.getElementById('camera');

 // Audio UI
 const subBox         = document.getElementById('subtitles');
 const progWrap       = document.getElementById('progressWrap');
 const progBar        = document.getElementById('progressBar');
 const btnAudioPlay   = document.getElementById('btnAudioPlay');
 const btnAudioStop   = document.getElementById('btnAudioStop');
 const btnAudioReplay = document.getElementById('btnAudioReplay');

 // PPE UI
 const ppeToggle    = document.getElementById('ppeToggle');
 const ppePanel     = document.getElementById('ppePanel');
 const ppeMsg       = document.getElementById('ppeMsg');
 const ppeSceneType = document.getElementById('ppeSceneType');
 const ppeClose     = document.getElementById('ppeClose');
 const ppeItems     = document.querySelectorAll('.ppe-item');

 let currentAudio    = null;
 let currentSceneId  = null;
 let ppeAudio        = null;
 let ppeAudioFile    = 'others.mp3';
 let currentPpeOrder = [];
 let ppeStep         = 0;

 // 🔥 VR controller raycaster hotspot enable
 btnPrev.classList.add("vr-hotspot");
 btnNext.classList.add("vr-hotspot");
 btnEnter.classList.add("vr-hotspot");


 //================ NAV MAP (unchanged) =================//

 const nav = {
   mainentry:{prev:"",    next:"cn1",  enter:"cn1"},
   c1:{prev:"c2",         next:"entry",enter:"c2"},
   c2:{prev:"c1",         next:"c3",   enter:"eb1"},
   c3:{prev:"c2",         next:"c4",   enter:""},
   c4:{prev:"c3",         next:"c5",   enter:""},
   c5:{prev:"c4",         next:"c6",   enter:""},
   c6:{prev:"c5",         next:"c7",   enter:"cr"},
   c7:{prev:"c6",         next:"c8",   enter:"gb1"},
   c8:{prev:"c7",         next:"cn7",  enter:"wb1"},
   cn1:{prev:"mainentry", next:"cn2",  enter:""},
   cn2:{prev:"cn1",       next:"cn3",  enter:""},
   cn3:{prev:"cn2",       next:"cn5",  enter:"l1"},
   cn4:{prev:"",          next:"",     enter:""},
   cn5:{prev:"cn3",       next:"cn6",  enter:""},
   cn6:{prev:"cn5",       next:"cn7",  enter:""},
   cn7:{prev:"c8",        next:"",     enter:"ch1"},
   entry:{prev:"",        next:"c1",   enter:"c1"},
   ch1:{prev:"cn7",       next:"ch2",  enter:""},
   ch2:{prev:"ch1",       next:"ch3",  enter:""},
   ch3:{prev:"ch2",       next:"ch4",  enter:""},
   ch4:{prev:"ch3",       next:"ch5",  enter:""},
   ch5:{prev:"ch4",       next:"ch6",  enter:""},
   ch6:{prev:"ch5",       next:"ch7",  enter:""},
   ch7:{prev:"ch6",       next:"",     enter:""},
   cr:{prev:"c6",         next:"",     enter:""},
   eb1:{prev:"c2",        next:"eb2",  enter:""},
   eb2:{prev:"eb1",       next:"eb3",  enter:""},
   eb3:{prev:"eb2",       next:"eb4",  enter:""},
   eb4:{prev:"eb3",       next:"",     enter:""},
   gb1:{prev:"c7",        next:"gb2",  enter:""},
   gb2:{prev:"gb1",       next:"gb3",  enter:""},
   gb3:{prev:"gb2",       next:"c8",   enter:""},
   l1:{prev:"cn3",        next:"l2",   enter:""},
   l2:{prev:"l1",         next:"l3",   enter:""},
   l3:{prev:"l2",         next:"l4",   enter:""},
   l4:{prev:"l3",         next:"",     enter:""},
   wb1:{prev:"c8",        next:"wb2",  enter:""},
   wb2:{prev:"wb1",       next:"",     enter:""}
 };


 //================ PPE ORDER LOGIC =================//

 function isLithOrChar(id) { return id.startsWith('l') || id.startsWith('ch'); }
 function isWetType(id)   { return id.startsWith('wb')||id.startsWith('gb')||id.startsWith('cr')||id.startsWith('eb'); }

 function getPPEOrderForScene(id){
   if (isLithOrChar(id))
     return ["ppe6","ppe7","ppe8","ppe10","ppe9","ppe3","ppe4","ppe5"];

   return ["ppe1","ppe7","ppe2","ppe10","ppe9","ppe3","ppe4","ppe5"];
 }

 function resetPPEGame(){
   ppeStep = 0;
   ppeMsg.textContent = "Tap “Cleanroom PPE Test” to begin.";
   ppePanel.style.display = 'none';

   if (ppeAudio){ ppeAudio.pause(); ppeAudio.currentTime = 0; }
   ppeItems.forEach(el=>{ el.classList.remove("selected"); el.style.opacity="1"; });
 }

 function updatePPEForScene(id){
   ppeSceneType.textContent = sceneLabel(id);
   currentPpeOrder = getPPEOrderForScene(id);
   ppeAudioFile = isLithOrChar(id) ? "cl.mp3" : "others.mp3";
   resetPPEGame();
 }


 //============ AUDIO CORE ============//

 function stopCurrentAudio(){
   if(currentAudio){ currentAudio.pause(); currentAudio.currentTime=0; }
   progWrap.style.display="none"; subBox.style.display="none"; progBar.style.width="0%";
 }

 function playSceneAudio(id){
   stopCurrentAudio();
   currentSceneId=id;

   currentAudio=new Audio(`${AUDIO}${id}.mp3`);
   const lines=[`${sceneLabel(id)}`];
   let i=0;

   subBox.style.display="block"; progWrap.style.display="block";
   subBox.textContent=lines[0];

   currentAudio.addEventListener("timeupdate",()=>{
     if(currentAudio.duration){
       progBar.style.width=((currentAudio.currentTime/currentAudio.duration)*100)+"%";
     }
   });

   currentAudio.play().catch(()=>{});
 }


 //==== UI BUTTON CLICK ====/ (mouse works already)
 btnAudioPlay.addEventListener("click",()=>currentAudio?currentAudio.play():playSceneAudio(currentSceneId));
 btnAudioStop.addEventListener("click",stopCurrentAudio);
 btnAudioReplay.addEventListener("click",()=>playSceneAudio(currentSceneId));

 ppeToggle.addEventListener("click",()=>{
   if(!currentSceneId) return;
   stopCurrentAudio(); resetPPEGame();

   ppeMsg.textContent="Playing gowning instruction audio...";
   ppeAudio=new Audio(`${AUDIO}${ppeAudioFile}`);

   ppeAudio.onended=()=>{
     ppePanel.style.display="flex";
     ppeMsg.textContent="Select PPE items in correct order.";
   };

   ppeAudio.play().catch(()=>{
     ppePanel.style.display="flex";
     ppeMsg.textContent="Select PPE Items.";
   })
 });

 ppeClose.addEventListener("click", resetPPEGame);

 ppeItems.forEach(el=>{
   el.addEventListener("click",()=>{
     const id=el.dataset.id;
     if(id===currentPpeOrder[ppeStep]){
       el.classList.add("selected"); el.style.opacity="0.3"; ppeStep++;
       if(ppeStep===currentPpeOrder.length) ppeMsg.textContent="✔ PPE Complete!";
       else ppeMsg.textContent="Correct → Next item";
     }
     else ppeMsg.textContent="Wrong item — try again.";
   });
 });


 //============ SCENE SYSTEM ============//

 function sceneLabel(id){
   if(id.startsWith("wb"))return"Wet Bench Room";
   if(id.startsWith("gb"))return"Processing Room";
   if(id.startsWith("cr"))return"Chemical Storage Room";
   if(id.startsWith("l")) return"Lithography Room";
   if(id.startsWith("ch"))return"Characterisation Room";
   if(id.startsWith("eb"))return"E-Beam + Glass Cutting";
   return "Corridor";
 }

 function gotoScene(id){ if(id) loadScene(id); }

 function loadScene(id){
   currentSceneId=id;
   sky.setAttribute("src",`${ASSETS}${id}.jpg`);
   updatePPEForScene(id);
   playSceneAudio(id);

   const cfg=nav[id]||{};
   btnPrev.onclick=()=>gotoScene(cfg.prev);
   btnNext.onclick=()=>gotoScene(cfg.next);
   btnEnter.onclick=()=>gotoScene(cfg.enter);
 }


 //============= VR CONTROLLER EVENTS 🔥=============//

 /** 
  * Controller fires → ray hits a-plane → JS triggers original HTML click
  * This keeps your entire UI design unchanged.
 **/
 document.querySelectorAll(".vr-hotspot").forEach(el=>{
   el.addEventListener("click",()=>{ el.object3D.visible=true; el.click(); });
 });

 AFRAME.registerComponent("controller-click",{
   init(){
     this.el.addEventListener("triggerdown",()=>{
       let p=document.querySelector("[raycaster]").components.raycaster.intersectedEls[0];
       if(p) p.emit("click");
     });
   }
 });


 //============ INIT ============//

 window.addEventListener("DOMContentLoaded",()=>{
   loadScene(START);
 });

})();
