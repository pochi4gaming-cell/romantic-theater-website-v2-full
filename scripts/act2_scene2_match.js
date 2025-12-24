export function initMatchGame(opts={}) {
  const board = document.querySelector(opts.boardSelector || '#match-board');
  if(!board) return;
  board.innerHTML = '';
  const items = ['🐶','🐱','🦊','💖','🐶','🐱','🦊','💖'];
  const shuffled = items.sort(()=>Math.random()-0.5);
  shuffled.forEach((it,i)=>{
    const c = document.createElement('div');
    c.className='card';
    c.dataset.value = it;
    c.textContent='❓';
    c.addEventListener('click',()=>flipCard(c));
    board.appendChild(c);
  });
  let first = null, lock=false;
  function flipCard(card){
    if(lock || card.classList.contains('matched')) return;
    card.textContent = card.dataset.value;
    if(!first){ first = card; return; }
    if(first === card) return;
    if(first.dataset.value === card.dataset.value){
      first.classList.add('matched');
      card.classList.add('matched');
      first = null;
      // check win
      if(board.querySelectorAll('.card.matched').length === shuffled.length){
        setTimeout(()=>{ if(opts.onComplete) opts.onComplete(); },400);
      }
    } else {
      lock = true;
      setTimeout(()=>{
        card.textContent='❓';
        first.textContent='❓';
        first = null;
        lock = false;
      },600);
    }
  }
}
