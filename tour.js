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


 let currentAudio    = null;   // scene narration
 let currentSceneId  = null;


 let ppeAudio        = null;   // PPE instructions audio
 let ppeAudioFile    = 'others.mp3';
 let currentPpeOrder = [];
 let ppeStep         = 0;


 // Navigation table (your exact mapping)
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


 const ICONS = {
   prev:  `${ASSETS}prevb.png`,
   next:  `${ASSETS}nextb.png`,
   enter: `${ASSETS}enterbb.png`,
   iitm:  `${ASSETS}iit.png`
 };


 // Floor logo
 (function trySetLogo() {
   const img = new Image();
   img.onload  = () => floorLogo.setAttribute('src', ICONS.iitm);
   img.onerror = () => floorLogo.setAttribute('material','color:#222; opacity:0.6');
   img.src = ICONS.iitm;
 })();


 /* -------------------- Scene Label Helper -------------------- */
 function sceneLabel(id) {
   if (id.startsWith('wb')) return 'Wet Bench Room';
   if (id.startsWith('gb')) return 'Processing Room';
   if (id.startsWith('cr')) return 'Chemical Storage Room';
   if (id.startsWith('l'))  return 'Lithography Room';
   if (id.startsWith('ch')) return 'Characterisation Room';
   if (id.startsWith('eb')) return 'E-beam & Glass Cutting Room';
   return 'Corridor';
 }


 // Simple default subtitles; you can tune per scene
 const subtitleScripts = {
   mainentry: [
     "Welcome to the IIT Madras CNNP MEMS & Cleanroom VR tour.",
     "Use the navigation controls to move through corridors and lab areas."
   ]
 };


 /* ==================== AUDIO + SUBTITLES ==================== */


 function stopCurrentAudio() {
   if (currentAudio) {
     currentAudio.pause();
     currentAudio.currentTime = 0;
   }
   progWrap.style.display = 'none';
   subBox.style.display   = 'none';
   progBar.style.width    = '0%';
 }


 function playSceneAudio(sceneId) {
   stopCurrentAudio();
   currentSceneId = sceneId;


   const audioPath = `${AUDIO}${sceneId}.mp3`;
   const audio = new Audio(audioPath);
   currentAudio = audio;


   const lines = subtitleScripts[sceneId] || [`${sceneLabel(sceneId)}`];
   let lineIdx = 0;


   subBox.style.display   = 'block';
   progWrap.style.display = 'block';
   subBox.textContent     = lines[0];


   audio.addEventListener('timeupdate', () => {
     if (!audio.duration || isNaN(audio.duration)) return;
     const p = (audio.currentTime / audio.duration) * 100;
     progBar.style.width = `${Math.min(100,p)}%`;
   });


   audio.addEventListener('ended', () => {
     progBar.style.width = '100%';
     if (lines.length > 1 && lineIdx < lines.length - 1) {
       lineIdx = lines.length - 1;
       subBox.textContent = lines[lineIdx];
     } else {
       subBox.textContent = `${sceneLabel(sceneId)} narration completed. You can continue exploring.`;
     }
   });


   if (lines.length > 1) {
     let interval = setInterval(() => {
       if (!audio || audio.paused || !audio.duration) return;
       const chunk  = audio.duration / lines.length;
       const newIdx = Math.floor(audio.currentTime / (chunk || 1));
       if (newIdx !== lineIdx && newIdx < lines.length) {
         lineIdx = newIdx;
         subBox.textContent = lines[lineIdx];
       }
     }, 500);
     audio.addEventListener('ended', () => clearInterval(interval));
   }


   audio.play().catch(() => {
     // autoplay blocked
     subBox.textContent = lines[0];
     progBar.style.width = '0%';
   });
 }


 if (btnAudioPlay) {
   btnAudioPlay.addEventListener('click', () => {
     if (!currentSceneId) return;
     if (currentAudio) currentAudio.play();
     else playSceneAudio(currentSceneId);
   });
 }
 if (btnAudioStop) {
   btnAudioStop.addEventListener('click', () => {
     stopCurrentAudio();
   });
 }
 if (btnAudioReplay) {
   btnAudioReplay.addEventListener('click', () => {
     if (!currentSceneId) return;
     playSceneAudio(currentSceneId);
   });
 }


 /* ==================== PPE GAME LOGIC ==================== */


 function isLithOrChar(id) {
   return id.startsWith('l') || id.startsWith('ch');
 }


 function isWetType(id) {
   return id.startsWith('wb') || id.startsWith('gb') || id.startsWith('cr') || id.startsWith('eb');
 }


 // Order logic:
 // Litho/Char: gown → shoe cover → boot → blue glove → purple glove → hair net → mask → goggle
 // Wet/others: lab coat → shoe cover → shoe → blue glove → purple glove → hair net → mask → goggle
 function getPPEOrderForScene(id) {
   if (isLithOrChar(id)) {
     return ["ppe6","ppe7","ppe8","ppe10","ppe9","ppe3","ppe4","ppe5"];
   }
   if (isWetType(id)) {
     return ["ppe1","ppe7","ppe2","ppe10","ppe9","ppe3","ppe4","ppe5"];
   }
   // default: treat as wet lab / general lab
   return ["ppe1","ppe7","ppe2","ppe10","ppe9","ppe3","ppe4","ppe5"];
 }


 function resetPPEGame() {
   ppeStep = 0;
   ppeMsg.textContent = "Tap “Cleanroom PPE Test” to begin.";
   ppePanel.style.display = 'none';
   if (ppeAudio) {
     ppeAudio.pause();
     ppeAudio.currentTime = 0;
   }
   ppeItems.forEach(el => {
     el.classList.remove('selected');
     el.style.opacity = '1';
   });
 }


 function updatePPEForScene(id) {
   const label = sceneLabel(id);
   ppeSceneType.textContent = label;
   currentPpeOrder = getPPEOrderForScene(id);
   ppeAudioFile = isLithOrChar(id) ? 'cl.mp3' : 'others.mp3';
   resetPPEGame();
 }


 if (ppeToggle) {
   ppeToggle.addEventListener('click', () => {
     if (!currentSceneId) return;
     resetPPEGame();
     // stop scene narration when PPE instructions play
     stopCurrentAudio();


     ppeMsg.textContent = "Playing gowning instruction audio...";
     ppeAudio = new Audio(`${AUDIO}${ppeAudioFile}`);


     ppeAudio.onended = () => {
       ppePanel.style.display = 'flex';
       ppeMsg.textContent = "Select PPE items in the correct gowning order.";
     };


     ppeAudio.play().catch(() => {
       // if blocked
       ppePanel.style.display = 'flex';
       ppeMsg.textContent = "Select PPE items in the correct gowning order.";
     });
   });
 }


 if (ppeClose) {
   ppeClose.addEventListener('click', () => {
     resetPPEGame();
   });
 }


 ppeItems.forEach(el => {
   el.addEventListener('click', () => {
     if (!currentPpeOrder || !currentPpeOrder.length) return;
     if (ppePanel.style.display === 'none') return;


     const id = el.dataset.id;
     const expected = currentPpeOrder[ppeStep];


     if (id === expected) {
       el.classList.add('selected');
       el.style.opacity = '0.3';
       ppeStep++;


       if (ppeStep === currentPpeOrder.length) {
         ppeMsg.textContent = "✅ Gowning sequence completed correctly. You are cleanroom ready!";
       } else {
         ppeMsg.textContent = `✔ Correct. Select step ${ppeStep + 1} next.`;
       }
     } else {
       ppeMsg.textContent = "❌ Incorrect item. Re-check the gowning order and try again.";
     }
   });
 });


 /* ==================== NAVIGATION & UI ==================== */


 // Helper to safely set a nav button (keeps your original structure)
 function setButtonPlane(btnEl, iconPath, targetId) {
   // remove old listeners
   btnEl.onclick = null;
   btnEl.removeEventListener('click', btnEl._listener);
   btnEl.removeEventListener('touchstart', btnEl._listener);


   if (!targetId || targetId === '') {
     btnEl.setAttribute('visible','false');
     return;
   }


   const test = new Image();
   test.onload = () => {
     btnEl.setAttribute('src', iconPath);
     btnEl.setAttribute('material','transparent:true;');
     btnEl.setAttribute('visible','true');
   };
   test.onerror = () => {
     btnEl.setAttribute('material','color:#37474f; opacity:0.95');
     btnEl.setAttribute('visible','true');
   };
   test.src = iconPath;


   const listener = (evt) => {
     evt && evt.stopPropagation();
     gotoScene(targetId);
   };
   btnEl._listener = listener;
   btnEl.addEventListener('click', listener);
   btnEl.addEventListener('touchstart', listener);
 }


 // Rotate nav panel to always face camera, but keep position fixed (so no "dancing")
 function orientPanelToCamera() {
   if (!camera || !navPanel || !window.THREE) return;
   const camWorldPos = new THREE.Vector3();
   camera.object3D.getWorldPosition(camWorldPos);


   const panelObj  = navPanel.object3D;
   const panelPos  = new THREE.Vector3();
   panelObj.getWorldPosition(panelPos);


   const lookAt = camWorldPos.clone();
   lookAt.y = panelPos.y; // same height → no tilting up/down
   panelObj.lookAt(lookAt);
 }


 // Load a panorama and update visible buttons per table
 function loadScene(id) {
   if (!id) return;
   currentSceneId = id;


   FADE.classList.add('on');
   setTimeout(() => {
     sky.setAttribute('src', `${ASSETS}${id}.jpg`);


     const cfg = nav[id] || {prev:'', next:'', enter:''};
     setButtonPlane(btnPrev,  ICONS.prev,  cfg.prev);
     setButtonPlane(btnNext,  ICONS.next,  cfg.next);
     setButtonPlane(btnEnter, ICONS.enter, cfg.enter);


     const hasPrev  = cfg.prev  && cfg.prev  !== '';
     const hasNext  = cfg.next  && cfg.next  !== '';
     const hasEnter = cfg.enter && cfg.enter !== '';


     const leftX   = -0.6, centerX = 0, rightX = 0.6;


     if (hasPrev && !hasEnter && !hasNext) {
       btnPrev.setAttribute('position', `${centerX} 0 0`);
     } else if (!hasPrev && hasEnter && !hasNext) {
       btnEnter.setAttribute('position', `${centerX} 0 0`);
     } else if (!hasPrev && !hasEnter && hasNext) {
       btnNext.setAttribute('position', `${centerX} 0 0`);
     } else {
       btnPrev.setAttribute('position',
         hasPrev ? `${(hasEnter || hasNext) ? leftX : centerX} 0 0` : `${leftX} 0 0`);
       btnEnter.setAttribute('position', `${centerX} 0 0`);
       btnNext.setAttribute('position',
         hasNext ? `${(hasEnter || hasPrev) ? rightX : centerX} 0 0` : `${rightX} 0 0`);
     }


     // Update PPE context for this scene
     updatePPEForScene(id);


     // Preload neighbors
     const neighbors = [];
     if (cfg.prev)  neighbors.push(cfg.prev);
     if (cfg.next)  neighbors.push(cfg.next);
     if (cfg.enter) neighbors.push(cfg.enter);
     neighbors.forEach(n => {
       const img = new Image();
       img.src = `${ASSETS}${n}.jpg`;
     });


     // Auto-play narration for this scene
     playSceneAudio(id);


     FADE.classList.remove('on');
   }, 220);
 }


 function gotoScene(target) {
   if (!target) return;
   loadScene(target);
 }


 function tickOrient() {
   orientPanelToCamera();
   requestAnimationFrame(tickOrient);
 }


 function preloadAll() {
   Object.keys(nav).forEach(k => {
     const img = new Image();
     img.src = `${ASSETS}${k}.jpg`;
   });
 }


 // init
 window.addEventListener('DOMContentLoaded', () => {
   preloadAll();
   loadScene(START);
   setTimeout(() => tickOrient(), 120);
 });


})();
