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
  let selectedPiece = null; // For touch interactions
  let touchStartY = null;
  let touchStartX = null;
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
    
    // Touch support: tap to place selected piece
    slot.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if(selectedPiece) {
        const existingPiece = slot.querySelector('.puzzle-piece');
        if(existingPiece && existingPiece !== selectedPiece) {
          returnPieceToBank(existingPiece);
        }
        placePiece(selectedPiece, slot);
        selectedPiece = null;
        updateSelectedState();
      } else {
        // Highlight slot on touch
        slot.style.backgroundColor = 'rgba(255,127,191,0.2)';
      }
    }, { passive: false });
    
    slot.addEventListener('touchend', () => {
      if(!selectedPiece) {
        slot.style.backgroundColor = 'rgba(255,255,255,0.5)';
      }
    });
    
    // Click support for tablets/desktop touch
    slot.addEventListener('click', (e) => {
      if(selectedPiece && isTouchDevice) {
        e.preventDefault();
        const existingPiece = slot.querySelector('.puzzle-piece');
        if(existingPiece && existingPiece !== selectedPiece) {
          returnPieceToBank(existingPiece);
        }
        placePiece(selectedPiece, slot);
        selectedPiece = null;
        updateSelectedState();
      }
    });
    
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
    mobileHint.textContent = '💡 Tap a piece to select it, then tap a slot to place it. Tap a placed piece to remove it.';
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
    piece.style.width = 'clamp(80px, 12vw, 100px)';
    piece.style.height = 'clamp(80px, 12vw, 100px)';
    piece.style.minWidth = 'clamp(80px, 12vw, 100px)';
    piece.style.minHeight = 'clamp(80px, 12vw, 100px)';
    piece.style.border = '2px solid rgba(0,0,0,0.1)';
    piece.style.borderRadius = '8px';
    piece.style.cursor = isTouchDevice ? 'pointer' : 'grab';
    piece.style.boxShadow = '0 4px 10px rgba(0,0,0,0.1)';
    piece.style.transition = 'transform 0.2s, box-shadow 0.2s';
    piece.style.overflow = 'hidden';
    piece.style.display = 'flex';
    piece.style.alignItems = 'center';
    piece.style.justifyContent = 'center';
    piece.style.touchAction = 'manipulation'; // Prevent double-tap zoom
    piece.style.userSelect = 'none';
    
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
    
    // Touch handlers for mobile/tablet
    piece.addEventListener('touchstart', (e) => {
      e.stopPropagation();
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
      
      // If piece is in bank, select it for placement
      if(piece.parentElement === bank) {
        selectedPiece = piece;
        updateSelectedState();
        piece.style.transform = 'scale(1.1)';
        piece.style.boxShadow = '0 6px 15px rgba(255,127,191,0.5)';
      }
    }, { passive: true });
    
    piece.addEventListener('touchmove', (e) => {
      // If moved significantly, cancel selection (user is scrolling)
      if(touchStartY !== null && touchStartX !== null) {
        const deltaY = Math.abs(e.touches[0].clientY - touchStartY);
        const deltaX = Math.abs(e.touches[0].clientX - touchStartX);
        if(deltaY > 10 || deltaX > 10) {
          if(selectedPiece === piece) {
            selectedPiece = null;
            updateSelectedState();
            piece.style.transform = 'scale(1)';
            piece.style.boxShadow = '0 4px 10px rgba(0,0,0,0.1)';
          }
        }
      }
    }, { passive: true });
    
    piece.addEventListener('touchend', (e) => {
      touchStartY = null;
      touchStartX = null;
    }, { passive: true });
    
    // Click handler for touch devices (when piece is in bank)
    piece.addEventListener('click', (e) => {
      if(isTouchDevice) {
        e.stopPropagation();
        if(piece.parentElement === bank) {
          // Toggle selection
          if(selectedPiece === piece) {
            selectedPiece = null;
            updateSelectedState();
            piece.style.transform = 'scale(1)';
            piece.style.boxShadow = '0 4px 10px rgba(0,0,0,0.1)';
          } else {
            // Clear previous selection
            if(selectedPiece) {
              selectedPiece.style.transform = 'scale(1)';
              selectedPiece.style.boxShadow = '0 4px 10px rgba(0,0,0,0.1)';
            }
            selectedPiece = piece;
            updateSelectedState();
            piece.style.transform = 'scale(1.1)';
            piece.style.boxShadow = '0 6px 15px rgba(255,127,191,0.5)';
          }
        } else if(piece.parentElement && piece.parentElement.classList.contains('puzzle-slot')) {
          // Remove piece from slot back to bank
          returnPieceToBank(piece);
          if(selectedPiece === piece) {
            selectedPiece = null;
            updateSelectedState();
          }
        }
      } else {
        // Desktop: allow clicking pieces in slots to remove them back to bank
        if(piece.parentElement && piece.parentElement.classList.contains('puzzle-slot')) {
          e.stopPropagation();
          returnPieceToBank(piece);
        }
      }
    });
    
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
  
  // Function to update visual state of selected piece
  function updateSelectedState() {
    pieces.forEach(p => {
      if(p !== selectedPiece && p.parentElement === bank) {
        p.style.transform = 'scale(1)';
        p.style.boxShadow = '0 4px 10px rgba(0,0,0,0.1)';
      }
    });
    
    // Hide mobile hint when first piece is selected
    if(mobileHint && selectedPiece && mobileHint.parentElement) {
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
    
    // Clear selection if this piece was selected
    if(selectedPiece === piece) {
      selectedPiece = null;
      updateSelectedState();
    }
    
    checkComplete();
  }
  
  function returnPieceToBank(piece) {
    const oldSlot = piece.parentElement;
    if(oldSlot && oldSlot.classList.contains('puzzle-slot')) {
      oldSlot.removeChild(piece);
    }
    
    // Reset piece styling for bank
    piece.style.width = 'clamp(80px, 12vw, 100px)';
    piece.style.height = 'clamp(80px, 12vw, 100px)';
    piece.style.minWidth = 'clamp(80px, 12vw, 100px)';
    piece.style.minHeight = 'clamp(80px, 12vw, 100px)';
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
    
    // Clear selection on mobile
    if(isTouchDevice && selectedPiece) {
      selectedPiece = null;
      updateSelectedState();
    }
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
