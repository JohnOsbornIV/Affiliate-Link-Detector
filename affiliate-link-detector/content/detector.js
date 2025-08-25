const AffiliateDetector = {

  isAffiliateLink(url) {
    try {
      const urlObj = new URL(url);
      const href = url.toLowerCase();
      const search = urlObj.search.toLowerCase();
      const hostname = urlObj.hostname.toLowerCase();
      
      // Load patterns from external file if available
      const patterns = window.AffiliatePatterns || {};
      
      
      // 1. Always detected domains - simplified domain-only check
      const alwaysDetected = patterns.alwaysDetectedDomains || ['cna.st', 'georiot.com', 'geni.us'];
      for (const domain of alwaysDetected) {
        if (hostname.includes(domain.toLowerCase())) {
          return { type: 'referral', confidence: 'high' };
        }
      }
      
      // 2. Custom blacklisted domains
      const customDomains = patterns.customBlacklistDomains || [];
      for (const domain of customDomains) {
        if (hostname.includes(domain.toLowerCase())) {
          return { type: 'blacklisted', confidence: 'high' };
        }
      }
      
      // 3. Amazon detection
      const amazon = patterns.amazon || {};
      if (amazon.shortLinks && amazon.shortLinks.test && amazon.shortLinks.test(href)) {
        return { type: 'amazon', confidence: 'high' };
      }
      if (amazon.tags && amazon.tags.test && amazon.tags.test(search)) {
        return { type: 'amazon', confidence: 'high' };
      }
      if (amazon.associateTag && amazon.associateTag.test && amazon.associateTag.test(search)) {
        return { type: 'amazon', confidence: 'high' };
      }
      if (amazon.specificRefPatterns && amazon.specificRefPatterns.test && amazon.specificRefPatterns.test(search)) {
        return { type: 'amazon', confidence: 'high' };
      }
      
      const isAmazonDomain = amazon.domains && amazon.domains.test ? amazon.domains.test(hostname) : /amazon\.(com|co\.uk|ca|de|fr|es|it|co\.jp|com\.au|com\.br|in|com\.mx|cn|sg|ae|nl)/i.test(hostname);
      if (isAmazonDomain) {
        if (amazon.affiliateId && amazon.affiliateId.test && amazon.affiliateId.test(search)) {
          return { type: 'amazon', confidence: 'high' };
        }
        if (amazon.refParam && amazon.refParam.test && amazon.refParam.test(search)) {
          return { type: 'amazon', confidence: 'medium' };
        }
        if (/[?&](pd_rd_|pf_rd_|ref_|refRID|linkCode|th=1)/i.test(search)) {
          return { type: 'amazon', confidence: 'medium' };
        }
      }
      
      // 4. Network domains
      const networkDomains = patterns.networkDomains || [];
      for (const domain of networkDomains) {
        if (hostname.includes(domain.toLowerCase())) {
          return { type: 'network', confidence: 'high' };
        }
      }
      
      // 5. URL shorteners
      const shorteners = patterns.shorteners || [];
      for (const shortener of shorteners) {
        if (hostname.includes(shortener.toLowerCase())) {
          return { type: 'shortlink', confidence: 'medium' };
        }
      }
      
      // 6. Retailer-specific detection
      const retailers = patterns.retailers || {};
      for (const [retailer, config] of Object.entries(retailers)) {
        if (config.domains && config.domains.test && config.domains.test(hostname)) {
          if (config.params && config.params.test && config.params.test(search)) {
            return { type: retailer, confidence: 'high' };
          }
        }
      }
      
      // 7. General affiliate parameters (including new ones: refdomain, sharedId)
      const affiliateParams = patterns.general && patterns.general.affiliateParams ? 
        patterns.general.affiliateParams : 
        /[?&](affiliate|aff|aff_id|affiliate_id|partner|partner_id|ref|referer|referrer|refdomain|source|utm_source|utm_medium|utm_campaign|utm_content|click_id|clickid|campaign|cid|sid|subid|sub_id|sharedId|irclickid|u1|subId|pubRef|affid|afflnk|awesm|click|ck|promo|promocode|referral|sponsor)=/i;
      
      if (affiliateParams.test(search)) {
        return { type: 'general', confidence: 'medium' };
      }
      
      // 8. Custom affiliate parameters
      const customParams = patterns.customAffiliateParams || [];
      for (const param of customParams) {
        const paramRegex = new RegExp(`[?&]${param}=`, 'i');
        if (paramRegex.test(search)) {
          return { type: 'custom', confidence: 'medium' };
        }
      }
      
      // 9. Tracking parameters
      const trackingParams = patterns.general && patterns.general.trackingParams ?
        patterns.general.trackingParams :
        /[?&](trk|track|tracking|tid|transaction_id|msclkid|fbclid|gclid|mc_cid|mc_eid|_ga|_gid|dclid)=/i;
      
      if (trackingParams.test(search)) {
        return { type: 'tracking', confidence: 'medium' };
      }
      
      return null;
    } catch (e) {
      return null;
    }
  },

  scanPageLinks() {
    const links = document.querySelectorAll('a[href]');
    const affiliateLinks = [];
    
    links.forEach(link => {
      if (link.dataset.affiliateScanned) return;
      
      const result = this.isAffiliateLink(link.href);
      if (result && result.confidence !== 'low') {
        link.dataset.affiliateScanned = 'true';
        link.dataset.affiliateType = result.type;
        link.dataset.affiliateConfidence = result.confidence;
        link.classList.add('affiliate-link-detected');
        
        affiliateLinks.push({
          url: link.href,
          text: link.textContent.trim(),
          type: result.type,
          confidence: result.confidence
        });
        
        this.addHoverIndicator(link);
      }
    });
    
    // Check for affiliate disclosures in page text
    const pageText = document.body.textContent.toLowerCase();
    const affiliateDisclosures = [
      'we may earn commission',
      'we may earn commissions', 
      'affiliate commission',
      'affiliate commissions',
      'earn commission from',
      'may receive commission',
      'compensated for purchases',
      'affiliate link',
      'affiliate links',
      'affiliate disclosure',
      'paid partnership',
      'sponsored content',
      'commission from qualifying purchases'
    ];
    
    for (const disclosure of affiliateDisclosures) {
      if (pageText.includes(disclosure)) {
        // Add a virtual affiliate link for the disclosure
        affiliateLinks.push({
          url: window.location.href,
          text: 'Page contains affiliate disclosure',
          type: 'disclosure',
          confidence: 'medium'
        });
        console.log('Detected affiliate disclosure on page:', disclosure);
        break;
      }
    }
    
    return affiliateLinks;
  },

  addHoverIndicator(link) {
    if (link.querySelector('.affiliate-indicator')) return;
    
    const indicator = document.createElement('span');
    indicator.className = 'affiliate-indicator';
    indicator.innerHTML = '🔗 Affiliate';
    link.appendChild(indicator);
  },

  highlightLinks() {
    const links = document.querySelectorAll('.affiliate-link-detected');
    links.forEach(link => {
      link.classList.add('affiliate-highlighted');
    });
  },

  removeHighlights() {
    const links = document.querySelectorAll('.affiliate-highlighted');
    links.forEach(link => {
      link.classList.remove('affiliate-highlighted');
    });
  }
};

let scanResults = [];

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scanPage') {
    scanResults = AffiliateDetector.scanPageLinks();
    sendResponse({ 
      success: true, 
      count: scanResults.length,
      links: scanResults 
    });
  } else if (request.action === 'highlightLinks') {
    AffiliateDetector.highlightLinks();
    sendResponse({ success: true });
  } else if (request.action === 'removeHighlights') {
    AffiliateDetector.removeHighlights();
    sendResponse({ success: true });
  } else if (request.action === 'getPageInfo') {
    sendResponse({
      url: window.location.href,
      title: document.title,
      affiliateCount: document.querySelectorAll('.affiliate-link-detected').length
    });
  }
  return true;
});

const observer = new MutationObserver((mutations) => {
  let shouldScan = false;
  mutations.forEach(mutation => {
    if (mutation.addedNodes.length > 0) {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1 && (node.tagName === 'A' || node.querySelector('a'))) {
          shouldScan = true;
        }
      });
    }
  });
  
  if (shouldScan) {
    setTimeout(() => AffiliateDetector.scanPageLinks(), 100);
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

setTimeout(() => AffiliateDetector.scanPageLinks(), 500);