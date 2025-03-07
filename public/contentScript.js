// Content script for SnapShot extension
console.log('SnapShot content script loaded');

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getPageInfo") {
    sendResponse({
      title: document.title,
      url: window.location.href
    });
  }
  
  if (request.action === "selectArea") {
    startAreaSelection()
      .then(area => {
        sendResponse({ success: true, area });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // Required for async response
  }
});

// Function to handle area selection
function startAreaSelection() {
  return new Promise((resolve, reject) => {
    try {
      // Create overlay for selection
      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
      overlay.style.zIndex = '9999999';
      overlay.style.cursor = 'crosshair';
      
      // Create selection box
      const selection = document.createElement('div');
      selection.style.position = 'absolute';
      selection.style.border = '2px dashed #fff';
      selection.style.backgroundColor = 'rgba(0, 123, 255, 0.2)';
      selection.style.display = 'none';
      
      overlay.appendChild(selection);
      document.body.appendChild(overlay);
      
      let startX, startY, isSelecting = false;
      
      overlay.addEventListener('mousedown', (e) => {
        isSelecting = true;
        startX = e.clientX;
        startY = e.clientY;
        selection.style.left = `${startX}px`;
        selection.style.top = `${startY}px`;
        selection.style.width = '0';
        selection.style.height = '0';
        selection.style.display = 'block';
      });
      
      overlay.addEventListener('mousemove', (e) => {
        if (!isSelecting) return;
        
        const currentX = e.clientX;
        const currentY = e.clientY;
        
        const width = currentX - startX;
        const height = currentY - startY;
        
        selection.style.width = `${Math.abs(width)}px`;
        selection.style.height = `${Math.abs(height)}px`;
        selection.style.left = `${width < 0 ? currentX : startX}px`;
        selection.style.top = `${height < 0 ? currentY : startY}px`;
      });
      
      overlay.addEventListener('mouseup', (e) => {
        isSelecting = false;
        
        const width = Math.abs(e.clientX - startX);
        const height = Math.abs(e.clientY - startY);
        const left = Math.min(e.clientX, startX);
        const top = Math.min(e.clientY, startY);
        
        document.body.removeChild(overlay);
        
        resolve({
          left,
          top,
          width,
          height
        });
      });
      
      // Allow canceling with Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          document.body.removeChild(overlay);
          reject(new Error('Selection canceled'));
        }
      }, { once: true });
      
    } catch (error) {
      reject(error);
    }
  });
}