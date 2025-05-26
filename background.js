chrome.downloads.onCreated.addListener(downloadItem => {
    const url = downloadItem.url.toLowerCase();
    const suspiciousExtensions = ['.exe', '.zip', '.pdf', '.rar', '.msi', '.dmg'];
  
    if (suspiciousExtensions.some(ext => url.endsWith(ext))) {
      // Send a message to the active tab to show a warning
      chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        if (tabs.length === 0) return;
        chrome.tabs.sendMessage(tabs[0].id, {type: 'downloadWarning', url: downloadItem.url});
      });
    }
  });
  