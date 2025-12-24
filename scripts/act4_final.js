export function initAct4(opts={}) {
  const yes = document.getElementById('yes-btn');
  const no = document.getElementById('no-btn');
  const finalMsg = document.getElementById('final-msg');
  if(yes){
    yes.addEventListener('click', ()=>{
      finalMsg.classList.remove('hidden');
      finalMsg.textContent = "AMAZING LETSGOOOOOOOOOOOOOOOOOO!!🌟";
      yes.disabled = true; no.disabled = true;
      // small confetti effect (DOM-based)
      for(let i=0;i<60;i++){
        const p = document.createElement('div');
        p.textContent = ['💖','✨','🎉'][Math.floor(Math.random()*3)];
        p.style.position='fixed';
        p.style.left = (20 + Math.random()*60) + '%';
        p.style.top = (10 + Math.random()*60) + '%';
        p.style.fontSize = (10 + Math.random()*18) + 'px';
        p.style.transform = 'rotate(' + (Math.random()*360) + 'deg)';
        document.body.appendChild(p);
        setTimeout(()=>p.remove(),2200);
      }
    });
  }
  if(no){
    no.addEventListener('mouseover', ()=>{
      no.style.transform = 'translateX(' + (Math.random()*140-70) + 'px)';
    });
    no.addEventListener('click', ()=>{ alert("It slipped away... try the other button ♥"); });
  }
}
