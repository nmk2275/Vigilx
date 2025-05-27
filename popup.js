document.addEventListener('DOMContentLoaded', () => {
  const cookiesSummary = document.getElementById('cookies-summary');
  const cookiesList = document.getElementById('cookies-list');
  const viewAllBtn = document.getElementById('view-all-btn');

  // Set loading state
  cookiesSummary.innerHTML = '<li>Loading cookies...</li>';

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      const url = tabs[0].url || 'Unknown';
      document.getElementById('url').textContent = url;

      // Extract the domain from the URL
      const domain = new URL(url).hostname;

      // Fetch cookies for the current domain
      chrome.cookies.getAll({ domain }, (cookies) => {
        if (cookies.length === 0) {
          cookiesSummary.innerHTML = '<li>No cookies found.</li>';
          viewAllBtn.remove(); // Remove the "View All" button if no cookies are found
          return;
        }

        // Categorize cookies
        const categories = {
          session: 0,
          authentication: 0,
          tracking: 0,
          preference: 0,
          general: 0,
        };

        cookies.forEach((cookie) => {
          const category = categorizeCookie(cookie.name);
          categories[category]++;
        });

        // Display summary
        cookiesSummary.innerHTML = '';
        for (const [category, count] of Object.entries(categories)) {
          const listItem = document.createElement('li');
          listItem.textContent = `${capitalize(category)} Cookies: ${count}`;
          cookiesSummary.appendChild(listItem);
        }

        // Handle "View All" button click
        viewAllBtn.addEventListener('click', () => {
          if (cookiesList.style.display === 'none') {
            cookiesList.style.display = 'block';
            viewAllBtn.textContent = 'Hide All';
            cookiesList.innerHTML = ''; // Clear the list to avoid duplication
            cookies.forEach((cookie) => {
              const listItem = document.createElement('li');
              const cookieType = categorizeCookie(cookie.name);
              listItem.textContent = `${cookie.name}: ${cookie.value} (${cookieType})`;
              cookiesList.appendChild(listItem);
            });
          } else {
            cookiesList.style.display = 'none';
            viewAllBtn.textContent = 'View All';
            cookiesList.innerHTML = ''; // Clear the list
          }
        });
      });
    } else {
      document.getElementById('url').textContent = 'Unable to retrieve URL';
    }
  });
});

// Function to categorize cookies based on their name
function categorizeCookie(cookieName) {
  if (cookieName.includes('session')) {
    return 'session';
  } else if (cookieName.includes('auth') || cookieName.includes('token')) {
    return 'authentication';
  } else if (cookieName.includes('track') || cookieName.includes('analytics')) {
    return 'tracking';
  } else if (cookieName.includes('pref') || cookieName.includes('settings')) {
    return 'preference';
  } else {
    return 'general';
  }
}

// Function to capitalize the first letter of a string
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Define the MutationObserver
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

// Ensure the DOM is fully loaded before observing
if (document.readyState === "complete" || document.readyState === "interactive") {
  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    console.error("❌ MutationObserver error: document.body is not available.");
  }
} else {
  window.addEventListener("DOMContentLoaded", () => {
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    } else {
      console.error("❌ MutationObserver error: document.body is not available after DOMContentLoaded.");
    }
  });
}
