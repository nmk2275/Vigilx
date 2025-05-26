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
          🚨 <strong>Vigilix Alert:</strong> This page looks suspicious.Proceed with caution!
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
        closeBtn.innerText = '';
        Object.assign(closeBtn.style, {
          marginLeft: '15px',
          cursor: 'pointer'
        });
        closeBtn.onclick = () => warning.remove();

        warning.appendChild(closeBtn);
        document.body.appendChild(warning);
      }

      // 🟡 Status badge (corner)
      const testDiv = document.createElement('div');
      testDiv.innerText = "🛡️ Vigilix is active";
      Object.assign(testDiv.style, {
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
      document.body.appendChild(testDiv);

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
  });

})();
