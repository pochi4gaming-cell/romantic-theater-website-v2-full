export function initScriptViewer(opts={}) {
  const viewer = document.getElementById('script-viewer');
  if(!viewer) return;
  
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
