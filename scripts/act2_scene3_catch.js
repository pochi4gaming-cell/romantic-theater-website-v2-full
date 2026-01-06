export function initCatchGame(opts={}) {
  const area = document.querySelector(opts.areaSelector || '#catch-area');
  const basket = document.querySelector(opts.basketSelector || '#basket');
  const caughtList = document.querySelector(opts.caughtListSelector || '#caught-list');
  if(!area || !basket || !caughtList) {
    console.error('Catch game: Missing required elements', { area, basket, caughtList });
    return;
  }
  caughtList.innerHTML='';

  // control basket with mouse
  area.addEventListener('mousemove', (e)=>{
    const rect = area.getBoundingClientRect();
    let x = e.clientX - rect.left;
    if(x < 40) x = 40; if(x > rect.width-40) x = rect.width-40;
    basket.style.left = (x-60)+'px';
  });

  // Use PNG images instead of emojis
  // You can customize these paths to your PNG files
  const things = opts.items || [
    { image: 'greengrape.png', name: 'Green Grape' },
    { image: 'greengrape.png', name: 'Green Grape' },
    { image: 'greengrape.png', name: 'Green Grape' },
    { image: 'greengrape.png', name: 'Green Grape' },
    { image: 'greengrape.png', name: 'Green Grape' },
    { image: 'greengrape.png', name: 'Green Grape' }
  ];
  const compliments = (opts.compliments) ? opts.compliments : [
    "You're cuter than your dog. Yes, I said it.",
    "Your laugh should win Best Soundtrack Award.",
    "I still smile when I think about that time we... (customize me!)",
    "You light up a room brighter than any spotlight.",
    "You make every scene more fun."
  ];

  let caughtCount=0;
  let spawned=0;
  let spawnInterval = null;
  const maxSpawn = 9;
  
  // Create start button
  const startBtn = document.createElement('button');
  startBtn.textContent = 'Start Catching!';
  startBtn.className = 'catch-start-btn';
  startBtn.style.display = 'block';
  startBtn.style.margin = '10px auto 20px';
  startBtn.style.padding = '10px 20px';
  startBtn.style.backgroundColor = '#ff7fbf';
  startBtn.style.color = 'white';
  startBtn.style.border = 'none';
  startBtn.style.borderRadius = '8px';
  startBtn.style.cursor = 'pointer';
  startBtn.style.fontWeight = '600';
  startBtn.style.fontSize = '1rem';
  startBtn.style.boxShadow = '0 4px 10px rgba(0,0,0,0.1)';
  
  // Insert button before the catch area
  const catchAreaParent = area.parentElement;
  if(catchAreaParent) {
    catchAreaParent.insertBefore(startBtn, area);
  } else {
    // Fallback: try to find the scene container
    const scene = area.closest('.scene');
    if(scene) {
      scene.insertBefore(startBtn, area);
    }
  }
  
  startBtn.addEventListener('click', () => {
    if(spawnInterval) return; // Already started
    startBtn.disabled = true;
    startBtn.textContent = 'Catching...';
    startBtn.style.opacity = '0.6';
    startBtn.style.cursor = 'not-allowed';
    
    console.log('Starting to spawn items...', things);
    spawnInterval = setInterval(()=>{
      if(spawned >= maxSpawn) { 
        clearInterval(spawnInterval); 
        spawnInterval = null;
        console.log('Finished spawning all items');
        startBtn.textContent = 'Finished!';
        if(opts.onComplete) setTimeout(()=>opts.onComplete(),1000); 
        return; 
      }
      const randomItem = things[Math.floor(Math.random()*things.length)];
      console.log('Spawning item:', randomItem);
      spawnThing(randomItem);
      spawned++;
    },650);
  });

  function spawnThing(item){
    console.log('spawnThing called with:', item);
    const el = document.createElement('div');
    el.className='falling';
    el.dataset.itemName = item.name || item.image;
    
    // Create img element for PNG
    const img = document.createElement('img');
    img.src = item.image;
    img.style.width = '40px';
    img.style.height = '40px';
    img.style.objectFit = 'contain';
    img.style.userSelect = 'none';
    img.style.pointerEvents = 'none';
    img.style.display = 'block';
    
    // Handle image load errors
    img.onerror = function() {
      console.warn('Failed to load image:', item.image);
      // Fallback: show text if image fails
      el.innerHTML = ''; // Clear img
      el.textContent = item.name || '?';
      el.style.fontSize = '1.6rem';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.backgroundColor = 'rgba(255,255,255,0.8)';
      el.style.borderRadius = '4px';
    };
    
    img.onload = function() {
      console.log('Image loaded successfully:', item.image);
    };
    
    el.appendChild(img);
    
    el.style.left = (10 + Math.random()*80) + '%';
    el.style.top = '-40px';
    el.style.position = 'absolute';
    el.style.zIndex = '10';
    
    console.log('Appending element to area:', area);
    area.appendChild(el);
    console.log('Element appended, starting fall animation');
    
    let top = -40;
    const fall = setInterval(()=>{
      top += 6 + Math.random()*4;
      el.style.top = top + 'px';
      const elRect = el.getBoundingClientRect();
      const basketRect = basket.getBoundingClientRect();
      const areaRect = area.getBoundingClientRect();
      if(elRect.bottom >= basketRect.top && elRect.left < basketRect.right && elRect.right > basketRect.left){
        // caught
        console.log('Item caught!');
        el.remove();
        clearInterval(fall);
        addCaught(item);
      } else if(top > areaRect.height + 60){
        console.log('Item missed and removed');
        el.remove();
        clearInterval(fall);
      }
    },60);
  }

  function addCaught(item){
    caughtCount++;
    const node = document.createElement('button');
    node.className='piece';
    node.dataset.itemName = item.name || item.image;
    
    // Set explicit dimensions so it doesn't take over the screen
    node.style.width = '80px';
    node.style.height = '80px';
    node.style.minWidth = '80px';
    node.style.minHeight = '80px';
    node.style.maxWidth = '80px';
    node.style.maxHeight = '80px';
    
    // Create img element for caught item
    const img = document.createElement('img');
    img.src = item.image;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'contain';
    img.style.pointerEvents = 'none';
    node.appendChild(img);
    
    node.addEventListener('click', ()=>showCompliment(item));
    caughtList.appendChild(node);
    if(caughtCount >= 9){
      // Stop spawning when 9 items are caught
      if(spawnInterval) {
        clearInterval(spawnInterval);
        spawnInterval = null;
        startBtn.textContent = 'Finished!';
      }
      // optional early completion
      if(opts.onComplete) setTimeout(()=>opts.onComplete(),600);
    }
  }

  function showCompliment(item){
    const idx = Math.floor(Math.random()*compliments.length);
    // show a gentle in-page modal (simple)
    const modal = document.createElement('div');
    modal.style.position='fixed'; modal.style.left='50%'; modal.style.top='20%';
    modal.style.transform='translateX(-50%)'; modal.style.background='#fff'; modal.style.padding='12px';
    modal.style.borderRadius='10px'; modal.style.boxShadow='0 8px 24px rgba(0,0,0,.12)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.gap = '8px';
    
    // Add image to modal
    const modalImg = document.createElement('img');
    modalImg.src = item.image;
    modalImg.style.width = '30px';
    modalImg.style.height = '30px';
    modalImg.style.objectFit = 'contain';
    modal.appendChild(modalImg);
    
    // Add text
    const text = document.createElement('span');
    text.textContent = (item.name || item.image) + ' — ' + compliments[idx];
    modal.appendChild(text);
    
    document.body.appendChild(modal);
    setTimeout(()=>modal.remove(),1800);
  }
}
