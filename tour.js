/* IITM MEMS VR — Cleanroom Tour + Scene Audio + PPE Game
   - Uses your original nav mapping
   - Works with mouse + Quest controllers (laser-controls)
   - Audio per scene: Audio/<scene>.mp3
   - PPE audio: Audio/cl.mp3 (litho/char), Audio/others.mp3 (others)
   - PPE order:
        Litho / Char (l*, ch*):
          gown → shoe cover → boot → blue glove → purple glove → hair net → mask → goggles
        Wet / others (wb, gb, cr, eb, corridors):
          lab coat → shoe cover → shoe → blue glove → purple glove → hair net → mask → goggles
*/

(() => {
  const IMG   = 'Images/';
  const AUD   = 'Audio/';
  const START = 'mainentry';

  const sky   = document.getElementById('sky');
  const fade  = document.getElementById('fade');

  // Camera (for making panels always face view)
  const cam = document.querySelector('#cam') || document.querySelector('#camera') || document.getElementById('camera');

  // Nav panel + buttons
  const navPanel = document.getElementById('navPanel');
  const btnPrev  = document.getElementById('btnPrev');
  const btnNext  = document.getElementById('btnNext');
  const btnEnter = document.getElementById('btnEnter');

  // Audio panel buttons
  const audioPlay   = document.getElementById('audioPlay');
  const audioStop   = document.getElementById('audioStop');
  const audioReplay = document.getElementById('audioReplay');

  // PPE UI
  const ppeButton = document.getElementById('ppeButton');
  const ppePanel  = document.getElementById('ppePanel');
  const ppeMsg    = document.getElementById('ppeMsg');
  const ppeClose  = document.getElementById('ppeClose');
  const ppeImages = Array.from(document.querySelectorAll('.ppe'));

  // Extra panels that must face camera
  const audioPanelAF = document.getElementById('audioPanel');
  const ppePanelAF   = document.getElementById('ppePanel');

  // icon textures
  if (audioPlay)   audioPlay.setAttribute('src', IMG + 'start.png');
  if (audioStop)   audioStop.setAttribute('src', IMG + 'stop.png');
  if (audioReplay) audioReplay.setAttribute('src', IMG + 'replay.png');

  // PPE textures
  const PPE_SRC = {
    ppe1:  'ppe_labcoat.png',
    ppe2:  'ppe_shoe.png',
    ppe3:  'ppe_hairnet.png',
    ppe4:  'ppe_mask.png',
    ppe5:  'ppe_goggle.png',
    ppe6:  'ppe_gown.png',
    ppe7:  'ppe_shoecover.png',
    ppe8:  'ppe_boot.png',
    ppe9:  'ppe_purpleglove.png',
    ppe10: 'ppe_glove_blue.png'
  };
  ppeImages.forEach(el => {
    const file = PPE_SRC[el.id];
    if (file) el.setAttribute('src', IMG + file);
  });

  // === Your original navigation mapping ===
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
    prev:  IMG + 'prevb.png',
    next:  IMG + 'nextb.png',
    enter: IMG + 'enterbb.png',
    iitm:  IMG + 'iit.png'
  };

  // floor logo (optional)
  const floorLogo = document.getElementById('floorLogo');
  if (floorLogo) {
    const img = new Image();
    img.onload  = () => floorLogo.setAttribute('src', ICONS.iitm);
    img.onerror = () => floorLogo.setAttribute('material', 'color:#222;opacity:0.7');
    img.src = ICONS.iitm;
  }

  /* ====================== SCENE CLASSIFICATION ====================== */

  function isLithChar(id) {
    return id && (id.startsWith('l') || id.startsWith('ch'));
  }
  function isWetType(id) {
    return id && (id.startsWith('wb') || id.startsWith('gb') ||
                  id.startsWith('cr') || id.startsWith('eb'));
  }

  // helpers for label (if you want to reuse in subtitles later)
  function sceneLabel(id) {
    if (!id) return '';
    if (id.startsWith('wb')) return 'Wet Bench Room';
    if (id.startsWith('gb')) return 'Processing Room';
    if (id.startsWith('cr')) return 'Chemical Storage Room';
    if (id.startsWith('l'))  return 'Lithography Room';
    if (id.startsWith('ch')) return 'Characterisation Room';
    if (id.startsWith('eb')) return 'E-beam & Glass Cutting Room';
    if (id.startsWith('c') && id !== 'cr') return 'Corridor';
    if (id.startsWith('cn')) return 'Cleanroom Corridor';
    if (id === 'entry' || id === 'mainentry') return 'Lab Entry Area';
    return 'Lab Area';
  }

  // PPE order based on room
  function getPpeOrder(sceneId) {
    if (isLithChar(sceneId)) {
      // gown → shoe cover → boot → blue glove → purple glove → hair net → mask → goggles
      return ['ppe6','ppe7','ppe8','ppe10','ppe9','ppe3','ppe4','ppe5'];
    }
    // wet/others: lab coat → shoe cover → shoe → blue glove → purple glove → hair net → mask → goggles
    return ['ppe1','ppe7','ppe2','ppe10','ppe9','ppe3','ppe4','ppe5'];
  }

  function getPpeAudioFile(sceneId) {
    return isLithChar(sceneId) ? 'cl.mp3' : 'others.mp3';
  }

  /* ====================== AUDIO HANDLING ====================== */

  let currentSceneId = null;
  let sceneAudio     = null;
  let ppeAudio       = null;

  function stopSceneAudio() {
    if (sceneAudio) {
      sceneAudio.pause();
      sceneAudio.currentTime = 0;
    }
  }

  function stopPpeAudio() {
    if (ppeAudio) {
      ppeAudio.pause();
      ppeAudio.currentTime = 0;
    }
  }

  function playSceneAudio(id) {
    stopSceneAudio();
    if (!id) return;
    const src = AUD + id + '.mp3';
    const audio = new Audio(src);
    sceneAudio = audio;
    audio.play().catch(() => {});
  }

  /* ======================= PPE GAME LOGIC ======================= */

  let ppeOrder = [];
  let ppeIndex = 0;

  function resetPpeState(showTextOnly) {
    ppeIndex = 0;
    if (!showTextOnly) {
      if (ppePanel) ppePanel.setAttribute('visible', false);
    }
    if (ppeMsg) ppeMsg.setAttribute('value', 'Select PPE in correct order once instructions finish.');
    stopPpeAudio();
    ppeImages.forEach(el => {
      el.setAttribute('opacity', 1);
    });
  }

  function startPpeForScene(sceneId) {
    if (!sceneId) return;
    resetPpeState(true);
    ppeOrder = getPpeOrder(sceneId);

    const file = getPpeAudioFile(sceneId);
    stopSceneAudio();
    stopPpeAudio();

    ppeAudio = new Audio(AUD + file);
    if (ppeMsg) {
      const msg = isLithChar(sceneId)
        ? 'Listening: Cleanroom gowning steps for Lithography / Characterisation...'
        : 'Listening: Lab and wet bench gowning steps...';
      ppeMsg.setAttribute('value', msg);
    }

    ppeAudio.onended = () => {
      if (ppePanel) ppePanel.setAttribute('visible', true);
      if (ppeMsg) ppeMsg.setAttribute('value', 'Now select PPE icons in the correct order.');
    };

    ppeAudio.play().catch(() => {
      // If autoplay blocked, still show panel
      if (ppePanel) ppePanel.setAttribute('visible', true);
      if (ppeMsg) ppeMsg.setAttribute('value', 'Audio blocked. Select PPE icons in the correct order.');
    });
  }

  // PPE button: open test for current scene
  if (ppeButton) {
    ppeButton.addEventListener('click', () => {
      if (!currentSceneId) return;
      startPpeForScene(currentSceneId);
    });
  }

  if (ppeClose) {
    ppeClose.addEventListener('click', () => {
      resetPpeState(false);
    });
  }

  ppeImages.forEach(el => {
    el.addEventListener('click', () => {
      if (!ppeOrder || !ppeOrder.length) return;
      if (!ppePanel || ppePanel.getAttribute('visible') !== true && ppePanel.getAttribute('visible') !== 'true') {
        // game not shown yet
        return;
      }
      const expected = ppeOrder[ppeIndex];
      const id = el.id;

      if (id === expected) {
        el.setAttribute('opacity', 0.3);
        ppeIndex++;
        if (ppeIndex >= ppeOrder.length) {
          if (ppeMsg) ppeMsg.setAttribute('value', '✅ Gowning sequence completed correctly. You are cleanroom ready!');
        } else {
          if (ppeMsg) ppeMsg.setAttribute('value', `✔ Correct. Select step ${ppeIndex + 1} next.`);
        }
      } else {
        if (ppeMsg) ppeMsg.setAttribute('value', '❌ Incorrect item. Follow the gowning order described in the instructions and try again.');
      }
    });
  });

  /* ======================= NAV BUTTON HANDLING ======================= */

  function setButtonPlane(btnEl, iconPath, targetId) {
    if (!btnEl) return;

    // clear old listeners
    if (btnEl._listener) {
      btnEl.removeEventListener('click', btnEl._listener);
      btnEl.removeEventListener('touchstart', btnEl._listener);
      btnEl._listener = null;
    }

    if (!targetId) {
      btnEl.setAttribute('visible', false);
      return;
    }

    btnEl.setAttribute('src', iconPath);
    btnEl.setAttribute('visible', true);

    const handler = (evt) => {
      evt && evt.stopPropagation();
      gotoScene(targetId);
    };
    btnEl._listener = handler;
    btnEl.addEventListener('click', handler);
    btnEl.addEventListener('touchstart', handler);
  }

  /* ======================= PANEL FACING CAMERA ======================= */

  function faceCamera(el) {
    if (!el || !cam || !window.THREE) return;
    const camPos = new THREE.Vector3();
    const objPos = new THREE.Vector3();
    cam.object3D.getWorldPosition(camPos);
    el.object3D.getWorldPosition(objPos);
    camPos.y = objPos.y;
    el.object3D.lookAt(camPos);
  }

  function tickPanels() {
    faceCamera(navPanel);
    faceCamera(audioPanelAF);
    faceCamera(ppeButton);
    faceCamera(ppePanelAF);
    requestAnimationFrame(tickPanels);
  }

  /* ======================= SCENE LOADING ======================= */

  function loadScene(id) {
    if (!id) return;
    currentSceneId = id;

    // fade
    if (fade) {
      fade.classList.add('on');
    }

    // stop current audio when moving
    stopSceneAudio();
    resetPpeState(false);

    setTimeout(() => {
      // 360 image
      sky.setAttribute('src', IMG + id + '.jpg');

      const cfg = nav[id] || {prev:'', next:'', enter:''};
      const hasPrev  = !!cfg.prev;
      const hasNext  = !!cfg.next;
      const hasEnter = !!cfg.enter;

      setButtonPlane(btnPrev,  ICONS.prev,  cfg.prev);
      setButtonPlane(btnNext,  ICONS.next,  cfg.next);
      setButtonPlane(btnEnter, ICONS.enter, cfg.enter);

      // positions: left / center / right like your old logic
      const leftX = -0.6, centerX = 0, rightX = 0.6;

      if (hasPrev && !hasEnter && !hasNext) {
        btnPrev && btnPrev.setAttribute('position', `${centerX} 0 0`);
      } else if (!hasPrev && hasEnter && !hasNext) {
        btnEnter && btnEnter.setAttribute('position', `${centerX} 0 0`);
      } else if (!hasPrev && !hasEnter && hasNext) {
        btnNext && btnNext.setAttribute('position', `${centerX} 0 0`);
      } else {
        if (btnPrev)  btnPrev.setAttribute('position',
          hasPrev ? `${(hasEnter || hasNext) ? leftX : centerX} 0 0` : `${leftX} 0 0`);
        if (btnEnter) btnEnter.setAttribute('position', `${centerX} 0 0`);
        if (btnNext)  btnNext.setAttribute('position',
          hasNext ? `${(hasEnter || hasPrev) ? rightX : centerX} 0 0` : `${rightX} 0 0`);
      }

      // preload neighbours
      const neighbors = [];
      if (cfg.prev)  neighbors.push(cfg.prev);
      if (cfg.next)  neighbors.push(cfg.next);
      if (cfg.enter) neighbors.push(cfg.enter);
      neighbors.forEach(n => {
        const img = new Image();
        img.src = IMG + n + '.jpg';
      });

      // auto play scene audio
      playSceneAudio(id);

      if (fade) {
        fade.classList.remove('on');
      }
    }, 220);
  }

  function gotoScene(targetId) {
    if (!targetId) return;
    loadScene(targetId);
  }

  /* ======================= AUDIO BUTTON EVENTS ======================= */

  if (audioPlay) {
    audioPlay.addEventListener('click', () => {
      if (sceneAudio) {
        sceneAudio.play().catch(() => {});
      } else if (currentSceneId) {
        playSceneAudio(currentSceneId);
      }
    });
  }

  if (audioStop) {
    audioStop.addEventListener('click', () => {
      stopSceneAudio();
    });
  }

  if (audioReplay) {
    audioReplay.addEventListener('click', () => {
      if (!currentSceneId) return;
      playSceneAudio(currentSceneId);
    });
  }

  /* ======================= INIT ======================= */

  function preloadAllImages() {
    Object.keys(nav).forEach(k => {
      const img = new Image();
      img.src = IMG + k + '.jpg';
    });
  }

  window.addEventListener('DOMContentLoaded', () => {
    preloadAllImages();
    loadScene(START);
    // keep panels facing camera in VR
    setTimeout(() => tickPanels(), 150);
  });

})();
