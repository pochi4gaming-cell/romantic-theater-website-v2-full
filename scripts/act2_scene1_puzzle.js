export function initScene1(opts = {}) {
  const container = document.querySelector(opts.containerSelector || '#puzzle');
  if(!container) return;
  container.innerHTML = '';
  
  const GRID_COLS = 3;
  const GRID_ROWS = 3;
  const TOTAL_PIECES = GRID_COLS * GRID_ROWS; // 9 pieces
  const PIECE_FOLDER = 'cocopic';
  
  let pieces = [];
  let slots = [];
  let draggedPiece = null;
  let touchDraggedPiece = null; // For touch drag
  let touchStartY = null;
  let touchStartX = null;
  let touchOffsetX = null;
  let touchOffsetY = null;
  let dragGhost = null; // Visual element that follows touch
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Create puzzle board (target area)
  const puzzleBoard = document.createElement('div');
  puzzleBoard.className = 'puzzle-board';
  
  // Create slots for puzzle pieces
  for(let i = 0; i < TOTAL_PIECES; i++) {
    const slot = document.createElement('div');
    slot.className = 'puzzle-slot';
    slot.dataset.index = i;
    slot.style.aspectRatio = '1';
    slot.style.border = '2px dashed rgba(0,0,0,0.1)';
    slot.style.borderRadius = '8px';
    slot.style.backgroundColor = 'rgba(255,255,255,0.5)';
    slot.style.position = 'relative';
    slot.style.minHeight = 'clamp(80px, 15vw, 120px)';
    slot.style.cursor = 'pointer';
    
    // Allow dropping pieces (desktop drag-and-drop)
    slot.addEventListener('dragover', (e) => {
      e.preventDefault();
      if(!slot.querySelector('.puzzle-piece')) {
        slot.style.backgroundColor = 'rgba(255,127,191,0.2)';
      }
    });
    
    slot.addEventListener('dragleave', () => {
      slot.style.backgroundColor = 'rgba(255,255,255,0.5)';
    });
    
    slot.addEventListener('drop', (e) => {
      e.preventDefault();
      slot.style.backgroundColor = 'rgba(255,255,255,0.5)';
      if(draggedPiece) {
        // If slot already has a piece, move it back to bank first
        const existingPiece = slot.querySelector('.puzzle-piece');
        if(existingPiece && existingPiece !== draggedPiece) {
          returnPieceToBank(existingPiece);
        }
        placePiece(draggedPiece, slot);
      }
    });
    
    // Touch drag-and-drop handles slot interactions automatically via piece touch handlers
    
    slots.push(slot);
    puzzleBoard.appendChild(slot);
  }
  
  container.appendChild(puzzleBoard);
  
  // Create reset button
  const resetBtn = document.createElement('button');
  resetBtn.textContent = 'Reset Puzzle';
  resetBtn.className = 'puzzle-reset';
  resetBtn.style.margin = '10px auto';
  resetBtn.style.display = 'block';
  resetBtn.style.padding = '8px 16px';
  resetBtn.style.backgroundColor = '#ff7fbf';
  resetBtn.style.color = 'white';
  resetBtn.style.border = 'none';
  resetBtn.style.borderRadius = '8px';
  resetBtn.style.cursor = 'pointer';
  resetBtn.style.fontWeight = '600';
  resetBtn.addEventListener('click', resetPuzzle);
  container.appendChild(resetBtn);
  
  // Add mobile instruction hint
  let mobileHint = null;
  if(isTouchDevice) {
    mobileHint = document.createElement('div');
    mobileHint.className = 'puzzle-mobile-hint';
    mobileHint.style.cssText = `
      background: rgba(255, 127, 191, 0.15);
      border: 2px solid rgba(255, 127, 191, 0.4);
      border-radius: 8px;
      padding: 10px 12px;
      margin: 8px auto 16px;
      max-width: 500px;
      font-size: clamp(0.85rem, 2vw, 0.95rem);
      text-align: center;
      color: #555;
      line-height: 1.4;
    `;
    mobileHint.textContent = '💡 Touch and hold a piece to drag it. Drag to a slot to place it, or drag to the bank to remove it.';
    container.insertBefore(mobileHint, puzzleBoard);
  }
  
  // Create pieces bank (shuffled pieces to choose from)
  const bank = document.createElement('div');
  bank.className = 'puzzle-bank';
  
  // Allow dropping pieces back into the bank
  bank.addEventListener('dragover', (e) => {
    e.preventDefault();
    bank.style.backgroundColor = 'rgba(255,127,191,0.2)';
  });
  
  bank.addEventListener('dragleave', () => {
    bank.style.backgroundColor = 'rgba(255,255,255,0.3)';
  });
  
  bank.addEventListener('drop', (e) => {
    e.preventDefault();
    bank.style.backgroundColor = 'rgba(255,255,255,0.3)';
    if(draggedPiece && draggedPiece.parentElement && draggedPiece.parentElement.classList.contains('puzzle-slot')) {
      returnPieceToBank(draggedPiece);
    }
  });
  
  container.appendChild(bank);
  
  // Create pieces using individual image files
  // Index mapping: 0 = row 1 col 1, 1 = row 1 col 2, etc.
  const pieceIndices = Array.from({length: TOTAL_PIECES}, (_, i) => i);
  const shuffled = pieceIndices.sort(() => Math.random() - 0.5);
  
  shuffled.forEach((originalIndex) => {
    // Convert index to row/column (1-indexed for file naming)
    const row = Math.floor(originalIndex / GRID_COLS) + 1;
    const col = (originalIndex % GRID_COLS) + 1;
    const imagePath = `${PIECE_FOLDER}/piece_${row}_${col}.png`;
    
    const piece = document.createElement('div');
    piece.className = 'puzzle-piece';
    piece.dataset.originalIndex = originalIndex;
    piece.draggable = !isTouchDevice; // Disable drag on touch devices
    // Set base size - CSS will override on mobile
    piece.style.width = '100px';
    piece.style.height = '100px';
    piece.style.border = '2px solid rgba(0,0,0,0.1)';
    piece.style.borderRadius = '8px';
    piece.style.cursor = isTouchDevice ? 'pointer' : 'grab';
    piece.style.boxShadow = '0 4px 10px rgba(0,0,0,0.1)';
    piece.style.transition = 'transform 0.2s, box-shadow 0.2s';
    piece.style.overflow = 'hidden';
    piece.style.display = 'flex';
    piece.style.alignItems = 'center';
    piece.style.justifyContent = 'center';
    piece.style.touchAction = 'none'; // Full control over touch events
    piece.style.userSelect = 'none';
    piece.style.webkitUserSelect = 'none';
    piece.style.webkitTouchCallout = 'none'; // Prevent iOS callout menu
    
    // Create img element for the piece
    const img = document.createElement('img');
    img.src = imagePath;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    img.draggable = false; // Prevent image from being dragged separately
    img.style.pointerEvents = 'none'; // Prevent image from interfering with touch
    piece.appendChild(img);
    
    // Desktop drag-and-drop handlers
    piece.addEventListener('dragstart', (e) => {
      if(!isTouchDevice) {
        draggedPiece = piece;
        piece.style.opacity = '0.5';
        e.dataTransfer.effectAllowed = 'move';
      }
    });
    
    piece.addEventListener('dragend', () => {
      piece.style.opacity = '1';
      draggedPiece = null;
    });
    
    // Touch drag handlers for mobile/tablet - mimics desktop drag-and-drop
    piece.addEventListener('touchstart', (e) => {
      if(!isTouchDevice) return;
      
      e.stopPropagation();
      const touch = e.touches[0];
      touchStartY = touch.clientY;
      touchStartX = touch.clientX;
      
      // Get piece position relative to touch point
      const rect = piece.getBoundingClientRect();
      touchOffsetX = touch.clientX - rect.left;
      touchOffsetY = touch.clientY - rect.top;
      
      touchDraggedPiece = piece;
      piece.style.opacity = '0.6';
      piece.style.transition = 'none'; // Disable transition during drag
      
      // Hide mobile hint on first drag
      hideMobileHint();
      
      // Create a ghost element that follows the touch
      dragGhost = piece.cloneNode(true);
      dragGhost.style.position = 'fixed';
      dragGhost.style.left = (touch.clientX - touchOffsetX) + 'px';
      dragGhost.style.top = (touch.clientY - touchOffsetY) + 'px';
      dragGhost.style.width = rect.width + 'px';
      dragGhost.style.height = rect.height + 'px';
      dragGhost.style.pointerEvents = 'none';
      dragGhost.style.zIndex = '1000';
      dragGhost.style.opacity = '0.8';
      dragGhost.style.transform = 'scale(1.1)';
      dragGhost.style.boxShadow = '0 8px 20px rgba(0,0,0,0.3)';
      document.body.appendChild(dragGhost);
      
      e.preventDefault(); // Prevent scrolling
    }, { passive: false });
    
    piece.addEventListener('touchmove', (e) => {
      if(!isTouchDevice || !touchDraggedPiece || touchDraggedPiece !== piece) return;
      
      const touch = e.touches[0];
      
      // Update ghost position
      if(dragGhost) {
        dragGhost.style.left = (touch.clientX - touchOffsetX) + 'px';
        dragGhost.style.top = (touch.clientY - touchOffsetY) + 'px';
      }
      
      // Check which slot we're over
      const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
      const slotBelow = elementBelow?.closest('.puzzle-slot');
      
      // Highlight slot if hovering
      slots.forEach(slot => {
        if(slot === slotBelow && !slot.querySelector('.puzzle-piece')) {
          slot.style.backgroundColor = 'rgba(255,127,191,0.3)';
        } else {
          slot.style.backgroundColor = 'rgba(255,255,255,0.5)';
        }
      });
      
      // Highlight bank if hovering
      const bankBelow = elementBelow?.closest('.puzzle-bank');
      if(bankBelow === bank) {
        bank.style.backgroundColor = 'rgba(255,127,191,0.2)';
      } else {
        bank.style.backgroundColor = 'rgba(255,255,255,0.3)';
      }
      
      e.preventDefault(); // Prevent scrolling while dragging
    }, { passive: false });
    
    piece.addEventListener('touchend', (e) => {
      if(!isTouchDevice || !touchDraggedPiece || touchDraggedPiece !== piece) {
        touchDraggedPiece = null;
        return;
      }
      
      const touch = e.changedTouches[0];
      
      // Find what we're dropping on
      const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
      const slotBelow = elementBelow?.closest('.puzzle-slot');
      const bankBelow = elementBelow?.closest('.puzzle-bank');
      
      // Reset piece opacity
      piece.style.opacity = '1';
      piece.style.transition = 'transform 0.2s, box-shadow 0.2s';
      
      // Remove ghost
      if(dragGhost) {
        dragGhost.remove();
        dragGhost = null;
      }
      
      // Reset highlights
      slots.forEach(slot => {
        slot.style.backgroundColor = 'rgba(255,255,255,0.5)';
      });
      bank.style.backgroundColor = 'rgba(255,255,255,0.3)';
      
      // Handle drop
      if(slotBelow && !slotBelow.querySelector('.puzzle-piece')) {
        // Drop on empty slot
        placePiece(piece, slotBelow);
      } else if(bankBelow === bank && piece.parentElement?.classList.contains('puzzle-slot')) {
        // Drop on bank - return piece
        returnPieceToBank(piece);
      } else if(slotBelow && slotBelow.querySelector('.puzzle-piece') && piece.parentElement === bank) {
        // Drop on occupied slot - swap pieces
        const existingPiece = slotBelow.querySelector('.puzzle-piece');
        returnPieceToBank(existingPiece);
        placePiece(piece, slotBelow);
      }
      
      // Cleanup
      touchDraggedPiece = null;
      touchStartY = null;
      touchStartX = null;
      touchOffsetX = null;
      touchOffsetY = null;
      
      e.preventDefault();
    }, { passive: false });
    
    // Handle touch cancel (e.g., if user switches apps)
    piece.addEventListener('touchcancel', () => {
      if(touchDraggedPiece === piece) {
        piece.style.opacity = '1';
        piece.style.transition = 'transform 0.2s, box-shadow 0.2s';
        if(dragGhost) {
          dragGhost.remove();
          dragGhost = null;
        }
        slots.forEach(slot => {
          slot.style.backgroundColor = 'rgba(255,255,255,0.5)';
        });
        bank.style.backgroundColor = 'rgba(255,255,255,0.3)';
        touchDraggedPiece = null;
        touchStartY = null;
        touchStartX = null;
        touchOffsetX = null;
        touchOffsetY = null;
      }
    }, { passive: true });
    
    // Click handler for desktop (touch devices use drag)
    if(!isTouchDevice) {
      piece.addEventListener('click', (e) => {
        // Desktop: allow clicking pieces in slots to remove them back to bank
        if(piece.parentElement && piece.parentElement.classList.contains('puzzle-slot')) {
          e.stopPropagation();
          returnPieceToBank(piece);
        }
      });
    }
    
    // Desktop hover effects
    if(!isTouchDevice) {
      piece.addEventListener('mouseenter', () => {
        if(!piece.parentElement || piece.parentElement === bank) {
          piece.style.transform = 'scale(1.05)';
        }
      });
      
      piece.addEventListener('mouseleave', () => {
        piece.style.transform = 'scale(1)';
      });
    }
    
    pieces.push(piece);
    bank.appendChild(piece);
  });
  
  // Hide mobile hint when first drag starts
  function hideMobileHint() {
    if(mobileHint && mobileHint.parentElement) {
      mobileHint.style.transition = 'opacity 0.3s';
      mobileHint.style.opacity = '0';
      setTimeout(() => {
        if(mobileHint.parentElement) {
          mobileHint.remove();
        }
      }, 300);
    }
  }
  
  function placePiece(piece, slot) {
    // Remove piece from bank
    if(piece.parentElement === bank) {
      bank.removeChild(piece);
    } else {
      // If moving from another slot, remove from there
      const oldSlot = piece.parentElement;
      if(oldSlot && oldSlot.classList.contains('puzzle-slot')) {
        oldSlot.removeChild(piece);
      }
    }
    
    // Place in new slot
    slot.appendChild(piece);
    piece.style.width = '100%';
    piece.style.height = '100%';
    piece.style.minWidth = 'auto';
    piece.style.minHeight = 'auto';
    piece.style.cursor = isTouchDevice ? 'pointer' : 'grab'; // Keep cursor appropriate for device
    piece.style.transform = 'scale(1)';
    
    // Ensure the image inside fills the piece
    const img = piece.querySelector('img');
    if(img) {
      img.style.width = '100%';
      img.style.height = '100%';
    }
    
    // Check if correct position
    const slotIndex = parseInt(slot.dataset.index);
    const pieceIndex = parseInt(piece.dataset.originalIndex);
    
    if(slotIndex === pieceIndex) {
      piece.style.border = '2px solid #4CAF50';
      piece.style.boxShadow = '0 0 10px rgba(76,175,80,0.5)';
    } else {
      piece.style.border = '2px solid rgba(0,0,0,0.1)';
    }
    
    checkComplete();
  }
  
  function returnPieceToBank(piece) {
    const oldSlot = piece.parentElement;
    if(oldSlot && oldSlot.classList.contains('puzzle-slot')) {
      oldSlot.removeChild(piece);
    }
    
    // Reset piece styling for bank
    piece.style.width = '100px';
    piece.style.height = '100px';
    piece.style.cursor = isTouchDevice ? 'pointer' : 'grab';
    piece.style.border = '2px solid rgba(0,0,0,0.1)';
    piece.style.boxShadow = '0 4px 10px rgba(0,0,0,0.1)';
    piece.style.transform = 'scale(1)';
    
    const img = piece.querySelector('img');
    if(img) {
      img.style.width = '100%';
      img.style.height = '100%';
    }
    
    bank.appendChild(piece);
    checkComplete();
  }
  
  function resetPuzzle() {
    // Return all pieces from slots back to bank
    slots.forEach(slot => {
      const piece = slot.querySelector('.puzzle-piece');
      if(piece) {
        returnPieceToBank(piece);
      }
    });
    
  }
  
  function checkComplete() {
    const allPlaced = slots.every(slot => slot.querySelector('.puzzle-piece'));
    if(!allPlaced) return;
    
    const allCorrect = slots.every(slot => {
      const piece = slot.querySelector('.puzzle-piece');
      if(!piece) return false;
      const slotIndex = parseInt(slot.dataset.index);
      const pieceIndex = parseInt(piece.dataset.originalIndex);
      return slotIndex === pieceIndex;
    });
    
    if(allCorrect) {
      // Success animation
      slots.forEach(slot => {
        const piece = slot.querySelector('.puzzle-piece');
        if(piece) {
          piece.style.boxShadow = '0 0 20px rgba(76,175,80,0.8)';
          piece.style.animation = 'pulse 0.6s ease-in-out';
        }
      });
      
      setTimeout(() => {
        if(opts.onComplete) opts.onComplete();
      }, 600);
    }
  }
  
  // Add pulse animation style if not exists
  if(!document.getElementById('puzzle-animations')) {
    const style = document.createElement('style');
    style.id = 'puzzle-animations';
    style.textContent = `
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
    `;
    document.head.appendChild(style);
  }
}
