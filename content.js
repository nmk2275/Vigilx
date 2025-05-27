(function () {
  console.log("✅ Vigilix content script loaded");

  function runDetection() {
    try {
      const url = window.location.href;
      const hostname = window.location.hostname;

      const isIpUrl = /https?:\/\/\d{1,3}(\.\d{1,3}){3}/.test(url);

      const trustedTLDs = [
        ".com", ".org", ".net", ".in", ".edu", ".gov", ".co", ".io", ".ai", ".uk", ".us", ".ca"
      ];

      const getTLD = (host) => {
        const parts = host.split('.');
        return parts.length > 1 ? `.${parts[parts.length - 1]}` : '';
      };

      const tld = getTLD(hostname);
      const isSuspiciousTLD = !trustedTLDs.includes(tld);
      const isNotSecure = window.location.protocol !== 'https:';
      const isSuspicious = isIpUrl || isSuspiciousTLD || isNotSecure;

      // 🔴 Show warning bar if suspicious
      if (isSuspicious) {
        const warning = document.createElement('div');
        warning.innerHTML = `
          🚨 <strong>Vigilix Alert:</strong> This page looks suspicious. Proceed with caution!
        `;

        Object.assign(warning.style, {
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          backgroundColor: '#ff4d4d',
          color: 'white',
          padding: '15px',
          fontSize: '16px',
          textAlign: 'center',
          fontFamily: 'Arial, sans-serif',
          fontWeight: 'bold',
          zIndex: '999999',
          boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
        });

        const closeBtn = document.createElement('span');
        closeBtn.innerText = ' ✖';
        Object.assign(closeBtn.style, {
          marginLeft: '15px',
          cursor: 'pointer'
        });
        closeBtn.onclick = () => warning.remove();

        warning.appendChild(closeBtn);
        document.body.appendChild(warning);
      }

      // 🟡 Status badge (corner)
      const statusBadge = document.createElement('div');
      statusBadge.innerText = "🛡️ Vigilix is active";
      Object.assign(statusBadge.style, {
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        backgroundColor: '#fff8b5',
        color: '#333',
        padding: '10px 15px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        fontFamily: 'Arial, sans-serif',
        zIndex: 999999
      });
      document.body.appendChild(statusBadge);

    } catch (err) {
      console.error("❌ Vigilix error:", err);
    }
  }

  // 📦 DOM Ready Check
  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(runDetection, 500);
  } else {
    window.addEventListener("DOMContentLoaded", () => {
      setTimeout(runDetection, 500);
    });
  }

  // 🔽 Download warning message listener
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'downloadWarning') {
      const bar = document.createElement('div');
      bar.innerHTML = `
        🚨 <strong>Vigilix:</strong> This site attempted to download:<br>${message.url}
      `;
      Object.assign(bar.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        backgroundColor: '#fff3cd',
        color: '#856404',
        padding: '10px',
        fontSize: '16px',
        textAlign: 'center',
        zIndex: 999999,
        fontFamily: 'Arial, sans-serif',
        border: '1px solid #ffeeba',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
        borderRadius: '6px'
      });

      const closeBtn = document.createElement('span');
      closeBtn.innerText = ' ✖';
      closeBtn.style.cursor = 'pointer';
      closeBtn.style.marginLeft = '15px';
      closeBtn.onclick = () => bar.remove();

      bar.appendChild(closeBtn);
      document.body.appendChild(bar);
    }

    if (message.type === 'blockDownload') {
      // Create a warning banner
      const banner = document.createElement('div');
      banner.style.position = 'fixed';
      banner.style.top = '0';
      banner.style.left = '0';
      banner.style.width = '100%';
      banner.style.backgroundColor = '#ff4d4d';
      banner.style.color = '#fff';
      banner.style.textAlign = 'center';
      banner.style.padding = '10px';
      banner.style.zIndex = '10000';
      banner.textContent = `Auto-download blocked: ${message.url}. Please leave this page if you don't trust it.`;

      // Append the banner to the page
      document.body.appendChild(banner);

      // Remove the banner after 10 seconds
      setTimeout(() => {
        banner.remove();
      }, 10000);
    }
  });

  // Block auto-downloads triggered by JavaScript
  document.addEventListener('click', (event) => {
    const target = event.target;

    // Check if the clicked element is a download link
    if (target.tagName === 'A' && target.hasAttribute('download')) {
      const href = target.getAttribute('href');

      // Block `data:` URLs
      if (href.startsWith('data:')) {
        console.warn('Blocked auto-download of data URL:', href);
        event.preventDefault();
        alert('Auto-download blocked: This page attempted to download a file automatically.');
      }
    }
  });

  // Optionally, block the creation of download links dynamically
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.tagName === 'A' && node.hasAttribute('download')) {
          const href = node.getAttribute('href');
          if (href && href.startsWith('data:')) {
            console.warn('Blocked creation of download link:', href);
            node.remove();
          }
        }
      });
    });
  });

  // Observe the entire document for changes
  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    window.addEventListener("DOMContentLoaded", () => {
      if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
      }
    });
  }
})();
