// Background script for SnapShot extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "captureScreenshot") {
    captureScreenshot(request.options)
      .then(dataUrl => {
        sendResponse({ success: true, dataUrl });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // Required for async response
  }
  
  if (request.action === "getDisplayMedia") {
    chrome.desktopCapture.chooseDesktopMedia(
      ['screen', 'window', 'tab'],
      sender.tab,
      streamId => {
        sendResponse({ streamId });
      }
    );
    return true; // Required for async response
  }
});

async function captureScreenshot(options = {}) {
  const { format = 'png', quality = 0.95 } = options;
  
  return new Promise((resolve, reject) => {
    chrome.tabs.captureVisibleTab(
      null,
      { format, quality },
      dataUrl => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(dataUrl);
        }
      }
    );
  });
}