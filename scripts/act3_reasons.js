export function initScriptViewer(opts={}) {
  const viewer = document.getElementById('script-viewer');
  if(!viewer) return;
  
  const CORRECT_PIN = '26201';
  let enteredPin = '';
  
  // Create lock overlay with pin pad
  const lockOverlay = document.createElement('div');
  lockOverlay.className = 'lock-overlay';
  lockOverlay.style.cssText = `
    position: relative;
    width: 100%;
    min-height: 300px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: linear-gradient(180deg, #fffdf6, #fff1f4);
    border-radius: 8px;
    padding: 2rem 1rem;
    user-select: none;
  `;
  
  const lockIcon = document.createElement('div');
  lockIcon.innerHTML = '🔒';
  lockIcon.style.cssText = `
    font-size: 3rem;
    margin-bottom: 1rem;
    animation: pulse-lock 2s ease-in-out infinite;
  `;
  
  const lockText = document.createElement('div');
  lockText.textContent = 'Enter PIN to unlock';
  lockText.style.cssText = `
    font-size: clamp(0.9rem, 2vw, 1.1rem);
    color: var(--muted, #6b6b6b);
    font-weight: 500;
    margin-bottom: 1.5rem;
  `;
  
  // PIN display
  const pinDisplay = document.createElement('div');
  pinDisplay.className = 'pin-display';
  pinDisplay.style.cssText = `
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    justify-content: center;
  `;
  
  function updatePinDisplay() {
    pinDisplay.innerHTML = '';
    for(let i = 0; i < 5; i++) {
      const dot = document.createElement('div');
      dot.style.cssText = `
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 2px solid var(--muted, #6b6b6b);
        background: ${i < enteredPin.length ? 'var(--muted, #6b6b6b)' : 'transparent'};
        transition: all 0.2s;
      `;
      pinDisplay.appendChild(dot);
    }
  }
  
  // Error message
  const errorMsg = document.createElement('div');
  errorMsg.className = 'pin-error';
  errorMsg.style.cssText = `
    color: #d32f2f;
    font-size: 0.9rem;
    min-height: 1.2rem;
    margin-bottom: 0.5rem;
    visibility: hidden;
  `;
  
  // Keypad container
  const keypad = document.createElement('div');
  keypad.className = 'pin-keypad';
  keypad.style.cssText = `
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
    max-width: 240px;
    width: 100%;
  `;
  
  // Create number buttons (1-9)
  for(let i = 1; i <= 9; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.style.cssText = `
      padding: 0.75rem;
      font-size: 1.2rem;
      font-weight: 600;
      border: 2px solid var(--muted, #6b6b6b);
      border-radius: 8px;
      background: white;
      color: #222;
      cursor: pointer;
      transition: all 0.2s;
    `;
    btn.addEventListener('mouseenter', () => {
      btn.style.background = '#f5f5f5';
      btn.style.transform = 'scale(1.05)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.background = 'white';
      btn.style.transform = 'scale(1)';
    });
    btn.addEventListener('click', () => {
      if(enteredPin.length < 5) {
        enteredPin += i;
        updatePinDisplay();
        errorMsg.style.visibility = 'hidden';
      }
    });
    keypad.appendChild(btn);
  }
  
  // Row with 0, Clear, and Enter
  const row = document.createElement('div');
  row.style.cssText = `
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 0.5rem;
  `;
  
  // 0 button
  const zeroBtn = document.createElement('button');
  zeroBtn.textContent = '0';
  zeroBtn.style.cssText = `
    padding: 0.75rem;
    font-size: 1.2rem;
    font-weight: 600;
    border: 2px solid var(--muted, #6b6b6b);
    border-radius: 8px;
    background: white;
    color: #222;
    cursor: pointer;
    transition: all 0.2s;
  `;
  zeroBtn.addEventListener('mouseenter', () => {
    zeroBtn.style.background = '#f5f5f5';
    zeroBtn.style.transform = 'scale(1.05)';
  });
  zeroBtn.addEventListener('mouseleave', () => {
    zeroBtn.style.background = 'white';
    zeroBtn.style.transform = 'scale(1)';
  });
  zeroBtn.addEventListener('click', () => {
    if(enteredPin.length < 5) {
      enteredPin += '0';
      updatePinDisplay();
      errorMsg.style.visibility = 'hidden';
    }
  });
  
  // Clear button
  const clearBtn = document.createElement('button');
  clearBtn.textContent = '⌫';
  clearBtn.style.cssText = `
    padding: 0.75rem;
    font-size: 1.2rem;
    border: 2px solid var(--muted, #6b6b6b);
    border-radius: 8px;
    background: white;
    color: #222;
    cursor: pointer;
    transition: all 0.2s;
  `;
  clearBtn.addEventListener('mouseenter', () => {
    clearBtn.style.background = '#f5f5f5';
    clearBtn.style.transform = 'scale(1.05)';
  });
  clearBtn.addEventListener('mouseleave', () => {
    clearBtn.style.background = 'white';
    clearBtn.style.transform = 'scale(1)';
  });
  clearBtn.addEventListener('click', () => {
    enteredPin = '';
    updatePinDisplay();
    errorMsg.style.visibility = 'hidden';
  });
  
  // Enter button
  const enterBtn = document.createElement('button');
  enterBtn.textContent = '✓';
  enterBtn.style.cssText = `
    padding: 0.75rem;
    font-size: 1.2rem;
    border: 2px solid var(--accent, #ff7fbf);
    border-radius: 8px;
    background: var(--accent, #ff7fbf);
    color: white;
    cursor: pointer;
    transition: all 0.2s;
    font-weight: 600;
  `;
  enterBtn.addEventListener('mouseenter', () => {
    enterBtn.style.background = '#ff6bb3';
    enterBtn.style.transform = 'scale(1.05)';
  });
  enterBtn.addEventListener('mouseleave', () => {
    enterBtn.style.background = 'var(--accent, #ff7fbf)';
    enterBtn.style.transform = 'scale(1)';
  });
  enterBtn.addEventListener('click', () => {
    if(enteredPin === CORRECT_PIN) {
      lockOverlay.classList.add('unlocking');
      setTimeout(() => {
        loadContent();
      }, 500);
    } else if(enteredPin.length === 5) {
      errorMsg.textContent = 'Incorrect PIN. Try again.';
      errorMsg.style.visibility = 'visible';
      enteredPin = '';
      updatePinDisplay();
    } else {
      errorMsg.textContent = 'Please enter 5 digits';
      errorMsg.style.visibility = 'visible';
    }
  });
  
  row.appendChild(zeroBtn);
  row.appendChild(clearBtn);
  row.appendChild(enterBtn);
  keypad.appendChild(row);
  
  // Skip button
  const skipBtn = document.createElement('button');
  skipBtn.textContent = 'Skip';
  skipBtn.style.cssText = `
    margin-top: 1.5rem;
    padding: 0.6rem 1.5rem;
    font-size: 0.95rem;
    border: 2px solid var(--muted, #6b6b6b);
    border-radius: 8px;
    background: transparent;
    color: var(--muted, #6b6b6b);
    cursor: pointer;
    transition: all 0.2s;
    font-weight: 500;
  `;
  skipBtn.addEventListener('mouseenter', () => {
    skipBtn.style.background = '#f5f5f5';
    skipBtn.style.borderColor = '#999';
    skipBtn.style.color = '#555';
  });
  skipBtn.addEventListener('mouseleave', () => {
    skipBtn.style.background = 'transparent';
    skipBtn.style.borderColor = 'var(--muted, #6b6b6b)';
    skipBtn.style.color = 'var(--muted, #6b6b6b)';
  });
  skipBtn.addEventListener('click', () => {
    if(opts.onFinish) {
      opts.onFinish();
    }
  });
  
  // Assemble overlay
  lockOverlay.appendChild(lockIcon);
  lockOverlay.appendChild(lockText);
  lockOverlay.appendChild(errorMsg);
  lockOverlay.appendChild(pinDisplay);
  lockOverlay.appendChild(keypad);
  lockOverlay.appendChild(skipBtn);
  
  // Add pulse animation style
  if(!document.getElementById('lock-animation-style')) {
    const style = document.createElement('style');
    style.id = 'lock-animation-style';
    style.textContent = `
      @keyframes pulse-lock {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.1); opacity: 0.8; }
      }
      .lock-overlay.unlocking {
        animation: fade-out 0.5s ease-out forwards;
      }
      @keyframes fade-out {
        to { opacity: 0; transform: scale(0.95); }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Initially show lock overlay
  viewer.innerHTML = '';
  viewer.appendChild(lockOverlay);
  updatePinDisplay();
  
  function loadContent() {
    // Load the full script from ynLetter.txt
    fetch('./ynLetter.txt')
      .then(resp => {
        if(!resp.ok) throw new Error('Failed to load script');
        return resp.text();
      })
      .catch(() => {
        // Fallback to embedded content if file not found
        return `test`;
      })
      .then(scriptText => {
        viewer.textContent = scriptText;
        
        // Add continue button functionality
        const continueBtn = document.getElementById('act3-continue');
        if(continueBtn && opts.onFinish) {
          continueBtn.addEventListener('click', () => {
            opts.onFinish();
          });
        }
      });
  }
}
