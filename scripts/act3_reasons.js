export function initScriptViewer(opts={}) {
  const viewer = document.getElementById('script-viewer');
  const nextBtn = document.getElementById('next-page');
  const prevBtn = document.getElementById('prev-page');
  if(!viewer) return;
  // load reasons from /data/reasons.json; fallback to inline list
  fetch('/data/reasons.json').then(resp=>{
    if(!resp.ok) throw new Error('no json');
    return resp.json();
  }).catch(()=>[
    "I like you because your laugh is my favorite opening line.",
    "I like you because you make small moments feel like scenes.",
    "I like you because you care even when no one is watching.",
    "I like you because you became my favorite person to share a stage with."
  ]).then(reasons=>{
    let page=0;
    function render(){
      viewer.textContent = 'Page ' + (page+1) + ' of ' + reasons.length + '\n\n' + reasons[page];
    }
    render();
    nextBtn.onclick = ()=>{
      if(page < reasons.length-1){ page++; render(); } else {
        // finished: call onFinish if provided
        if(opts.onFinish) opts.onFinish();
      }
    };
    prevBtn.onclick = ()=>{ if(page>0){ page--; render(); } };
  });
}
