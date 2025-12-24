import { initAct1 } from './act1_opening.js';
import { initScene1 } from './act2_scene1_puzzle.js';
import { initMatchGame } from './act2_scene2_match.js';
import { initCatchGame } from './act2_scene3_catch.js';
import { initScriptViewer } from './act3_reasons.js';
import { initAct4 as initAct4_module } from './act4_final.js';

const app = document.getElementById('app');

// render basic layout (Acts I-IV containers)
app.innerHTML = `
  <section id="act-1" class="act">
    <div class="stage">
      <h1 class="title">Tonight's Feature<br><span class="subtitle">A Play About Us</span></h1>
      <button id="startBtn" class="playbill">Start the Show</button>
    </div>
  </section>

  <section id="act-2" class="act hidden">
    <div class="stage-header">Act II — The Playful Acts</div>

    <div id="scene-1" class="scene">
      <h2>Scene 1 — The Puppy Puzzle</h2>
      <div id="puzzle" class="puzzle"></div>
      <div class="controls"><button id="s1-complete" class="small">Mark Complete</button></div>
    </div>

    <div id="scene-2" class="scene hidden">
      <h2>Scene 2 — The Ensemble Cast (Matching Game)</h2>
      <div id="match-board" class="match-board"></div>
      <div class="controls"><button id="s2-complete" class="small">Mark Complete</button></div>
    </div>

    <div id="scene-3" class="scene hidden">
      <h2>Scene 3 — Backstage Chaos (Catch Props)</h2>
      <div id="catch-area"><div id="basket" class="basket">🧺</div></div>
      <div id="caught-list" class="caught-list"></div>
      <div class="controls"><button id="s3-complete" class="small">Mark Complete</button></div>
    </div>
  </section>

  <section id="act-3" class="act hidden">
    <div class="stage-header">Act III — Reasons I Like You</div>
    <div id="script-viewer" class="script-viewer"></div>
    <div class="controls"><button id="prev-page" class="small">Prev</button><button id="next-page" class="small">Next</button></div>
  </section>

  <section id="act-4" class="act hidden">
    <div class="stage">
      <h1 class="final-question">So… SOOO EHEHHEHEHE JOWA?</h1>
      <div class="final-buttons">
        <button id="yes-btn" class="yes">Yes!</button>
        <button id="no-btn" class="no">Think Again 👀</button>
      </div>
      <div id="final-msg" class="final-msg hidden"></div>
    </div>
  </section>
`;

// simple helpers
const acts = {
  act1: document.getElementById('act-1'),
  act2: document.getElementById('act-2'),
  act3: document.getElementById('act-3'),
  act4: document.getElementById('act-4'),
};
function showAct(actEl){
  Object.values(acts).forEach(a=>a.classList.add('hidden'));
  actEl.classList.remove('hidden');
  window.scrollTo({top:0,behavior:'smooth'});
}

// curtain control
function openCurtain(){ 
  const curtain = document.getElementById('curtain-overlay');
  if(curtain) curtain.classList.add('curtain-open'); 
}
function closeCurtain(){ 
  const curtain = document.getElementById('curtain-overlay');
  if(curtain) curtain.classList.remove('curtain-open'); 
}

// initialize Act 1
initAct1({
  startButtonSelector: '#startBtn',
  onStart: ()=>{
    // transition to Act II (curtain already opening from act1_opening.js)
    setTimeout(()=>{ showAct(acts.act2); initSceneFlow(); }, 900);
  }
});

// init scene flow inside Act II
function initSceneFlow(){
  // show scene 1 initially
  showScene('scene-1');
  
  // Disable completion buttons initially
  const s1Btn = document.getElementById('s1-complete');
  const s2Btn = document.getElementById('s2-complete');
  const s3Btn = document.getElementById('s3-complete');
  s1Btn.disabled = true;
  s2Btn.disabled = true;
  s3Btn.disabled = true;
  
  initScene1({
    containerSelector:'#puzzle', 
    onComplete: ()=>{
      s1Btn.disabled = false;
    }
  });
  initMatchGame({
    boardSelector:'#match-board', 
    onComplete: ()=>{
      s2Btn.disabled = false;
    }
  });
  initCatchGame({
    areaSelector:'#catch-area', 
    basketSelector:'#basket', 
    caughtListSelector:'#caught-list', 
    onComplete: ()=>{
      s3Btn.disabled = false;
    }
  });

  // wiring completion buttons to go to next scenes
  s1Btn.addEventListener('click',()=>{ 
    if(!s1Btn.disabled) showScene('scene-2'); 
  });
  s2Btn.addEventListener('click',()=>{ 
    if(!s2Btn.disabled) showScene('scene-3'); 
  });
  s3Btn.addEventListener('click',()=>{ 
    if(!s3Btn.disabled) {
      showAct(acts.act3); 
      initScriptViewer({onFinish: ()=>{ showAct(acts.act4); initAct4Wrapper(); }}); 
    }
  });
}

function showScene(id){
  document.querySelectorAll('#act-2 .scene').forEach(s=>s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

// init Act 4 wiring
function initAct4Wrapper(){
  initAct4_module();
}
