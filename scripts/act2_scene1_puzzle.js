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
    slot.style.minHeight = '120px';
    
    // Allow dropping pieces
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
    piece.draggable = true;
    piece.style.width = '100px';
    piece.style.height = '100px';
    piece.style.border = '2px solid rgba(0,0,0,0.1)';
    piece.style.borderRadius = '8px';
    piece.style.cursor = 'grab';
    piece.style.boxShadow = '0 4px 10px rgba(0,0,0,0.1)';
    piece.style.transition = 'transform 0.2s';
    piece.style.overflow = 'hidden';
    piece.style.display = 'flex';
    piece.style.alignItems = 'center';
    piece.style.justifyContent = 'center';
    
    // Create img element for the piece
    const img = document.createElement('img');
    img.src = imagePath;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    img.draggable = false; // Prevent image from being dragged separately
    piece.appendChild(img);
    
    piece.addEventListener('dragstart', (e) => {
      draggedPiece = piece;
      piece.style.opacity = '0.5';
      e.dataTransfer.effectAllowed = 'move';
    });
    
    piece.addEventListener('dragend', () => {
      piece.style.opacity = '1';
      draggedPiece = null;
    });
    
    piece.addEventListener('mouseenter', () => {
      if(!piece.parentElement || piece.parentElement === bank) {
        piece.style.transform = 'scale(1.05)';
      }
    });
    
    piece.addEventListener('mouseleave', () => {
      piece.style.transform = 'scale(1)';
    });
    
    // Allow clicking pieces in slots to remove them back to bank
    piece.addEventListener('click', (e) => {
      if(piece.parentElement && piece.parentElement.classList.contains('puzzle-slot')) {
        e.stopPropagation();
        returnPieceToBank(piece);
      }
    });
    
    pieces.push(piece);
    bank.appendChild(piece);
  });
  
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
    piece.style.cursor = 'grab'; // Keep cursor as grab so users know they can move it
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
    piece.style.cursor = 'grab';
    piece.style.border = '2px solid rgba(0,0,0,0.1)';
    piece.style.boxShadow = '0 4px 10px rgba(0,0,0,0.1)';
    
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
