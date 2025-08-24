document.addEventListener('DOMContentLoaded', async () => {
  const scanBtn = document.getElementById('scan-btn');
  const highlightBtn = document.getElementById('highlight-btn');
  const scanSearchBtn = document.getElementById('scan-search-btn');
  const filterSearchBtn = document.getElementById('filter-search-btn');
  const autoHighlightToggle = document.getElementById('auto-highlight');
  const loading = document.getElementById('loading');
  const pageStatus = document.getElementById('page-status');
  const linkCount = document.getElementById('link-count');
  const searchSection = document.getElementById('search-section');
  
  let isHighlighted = false;
  let isFiltered = false;
  let currentTab = null;
  
  const getActiveTab = async () => {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    return tabs[0];
  };
  
  const updatePageInfo = async () => {
    currentTab = await getActiveTab();
    
    if (!currentTab.url || currentTab.url.startsWith('chrome://')) {
      pageStatus.textContent = 'Not available';
      pageStatus.className = 'status-value';
      scanBtn.disabled = true;
      return;
    }
    
    const isSearchPage = currentTab.url.includes('google.com/search') || 
                        currentTab.url.includes('duckduckgo.com');
    
    if (isSearchPage) {
      searchSection.style.display = 'block';
    }
    
    chrome.tabs.sendMessage(currentTab.id, { action: 'getPageInfo' }, (response) => {
      if (chrome.runtime.lastError) {
        pageStatus.textContent = 'Page not loaded';
        pageStatus.className = 'status-value';
        linkCount.textContent = '0';
        return;
      }
      
      if (response) {
        const domain = new URL(response.url).hostname;
        pageStatus.textContent = domain;
        pageStatus.className = 'status-value';
        
        if (response.affiliateCount > 0) {
          linkCount.textContent = response.affiliateCount;
          linkCount.className = 'status-value warning';
          highlightBtn.disabled = false;
        } else {
          linkCount.textContent = '0';
          linkCount.className = 'status-value safe';
        }
      }
    });
  };
  
  const loadSettings = async () => {
    const settings = await chrome.storage.local.get(['autoHighlight']);
    autoHighlightToggle.checked = settings.autoHighlight || false;
  };
  
  scanBtn.addEventListener('click', async () => {
    loading.classList.add('active');
    scanBtn.disabled = true;
    
    chrome.tabs.sendMessage(currentTab.id, { action: 'scanPage' }, (response) => {
      loading.classList.remove('active');
      scanBtn.disabled = false;
      
      if (response && response.success) {
        linkCount.textContent = response.count;
        linkCount.className = response.count > 0 ? 'status-value warning' : 'status-value safe';
        
        if (response.count > 0) {
          highlightBtn.disabled = false;
          
          if (autoHighlightToggle.checked) {
            chrome.tabs.sendMessage(currentTab.id, { action: 'highlightLinks' });
            isHighlighted = true;
            highlightBtn.textContent = 'Remove Highlights';
            highlightBtn.classList.remove('btn-secondary');
            highlightBtn.classList.add('btn-success');
          }
        }
        
        scanBtn.innerHTML = `
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Scan Complete!
        `;
        
        setTimeout(() => {
          scanBtn.innerHTML = `
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Rescan Page
          `;
        }, 2000);
      }
    });
  });
  
  highlightBtn.addEventListener('click', () => {
    if (isHighlighted) {
      chrome.tabs.sendMessage(currentTab.id, { action: 'removeHighlights' });
      highlightBtn.innerHTML = `
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path>
        </svg>
        Highlight Links
      `;
      highlightBtn.classList.remove('btn-success');
      highlightBtn.classList.add('btn-secondary');
    } else {
      chrome.tabs.sendMessage(currentTab.id, { action: 'highlightLinks' });
      highlightBtn.innerHTML = `
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        Remove Highlights
      `;
      highlightBtn.classList.remove('btn-secondary');
      highlightBtn.classList.add('btn-success');
    }
    isHighlighted = !isHighlighted;
  });
  
  scanSearchBtn.addEventListener('click', async () => {
    scanSearchBtn.disabled = true;
    scanSearchBtn.textContent = 'Scanning...';
    
    chrome.tabs.sendMessage(currentTab.id, { action: 'scanSearchResults' }, (response) => {
      scanSearchBtn.disabled = false;
      
      if (response) {
        scanSearchBtn.innerHTML = `
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Found ${response.withAffiliateLinks} results
        `;
        
        if (response.withAffiliateLinks > 0) {
          filterSearchBtn.style.display = 'flex';
        }
        
        setTimeout(() => {
          scanSearchBtn.innerHTML = `
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            Rescan Results
          `;
        }, 3000);
      }
    });
  });
  
  filterSearchBtn.addEventListener('click', () => {
    if (isFiltered) {
      chrome.tabs.sendMessage(currentTab.id, { action: 'showAllSearchResults' });
      filterSearchBtn.innerHTML = `
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
        </svg>
        Hide Affiliate Results
      `;
    } else {
      chrome.tabs.sendMessage(currentTab.id, { 
        action: 'filterSearchResults', 
        hideAffiliates: true 
      }, (response) => {
        if (response && response.hidden > 0) {
          filterSearchBtn.innerHTML = `
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
            </svg>
            Show All (${response.hidden} hidden)
          `;
        }
      });
    }
    isFiltered = !isFiltered;
  });
  
  autoHighlightToggle.addEventListener('change', async () => {
    await chrome.storage.local.set({ autoHighlight: autoHighlightToggle.checked });
  });
  
  await loadSettings();
  await updatePageInfo();
});