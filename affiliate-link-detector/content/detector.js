const AffiliateDetector = {
  patterns: {
    amazon: {
      tags: /[?&]tag=([a-zA-Z0-9\-_]+)/i,
      affiliateId: /[?&](ascsubtag|linkCode|linkId|camp|creative|creativeASIN|pf_rd_|pd_rd_|ie=|qid=)=/i,
      shortLinks: /^https?:\/\/(amzn\.to|a\.co|amzn\.eu|amzn\.asia|smile\.amazon\.|amazon\.[\w.]+\/dp\/|amazon\.[\w.]+\/gp\/)/i,
      associateTag: /[?&]associateTag=([a-zA-Z0-9\-_]+)/i,
      refParam: /[?&]ref(_|=)([a-zA-Z0-9\-_]+)/i,
      specificRefPatterns: /[?&]ref(_|=)(as_li_|as_sl_|nosim|sr_|cm_sw_|dp_|pd_)/i,
      amazonDomains: /amazon\.(com|co\.uk|ca|de|fr|es|it|co\.jp|com\.au|com\.br|in|com\.mx|cn|sg|ae|nl)/i
    },
    georiot: {
      domain: /^https?:\/\/([a-z]+\.)?georiot\.com\//i,
      shortDomain: /^https?:\/\/geni\.us\//i,
      targetParam: /[?&]target=/i
    },
    cnaet: {
      domain: /^https?:\/\/cna\.st\//i,
      redirectDomain: /^https?:\/\/redirect\.cna\.st\//i
    },
    general: {
      affiliateParams: /[?&](affiliate|aff|aff_id|affiliate_id|partner|partner_id|ref|referer|referrer|source|utm_source|utm_medium|utm_campaign|click_id|clickid|campaign|cid|sid|subid|sub_id|irclickid|u1|subId|pubRef)=/i,
      trackingParams: /[?&](trk|track|tracking|tid|transaction_id|msclkid|fbclid|gclid|mc_cid|mc_eid)=/i,
      commonNetworks: /^https?:\/\/([a-z0-9\-]+\.)?(shareasale|cj|clickbank|linksynergy|avantlink|pepperjam|pjtra|pntra|dpbolvw|kqzyfj|jdoqocy|tkqlhce|anrdoezrs|commission-junction|qksrv|evyy|7eer|refersion|tapfiliate|postaffiliatepro|hasoffers|impact-radius|partnerize|rakuten|skimlinks|viglink|sovrn|rewardstyle|shopstyle|rstyle|goto|redirect|track|aff|affiliates)\.(com|net|co|io|org)/i,
      bitly: /^https?:\/\/(bit\.ly|bitly\.com|j\.mp|tinyurl\.com|goo\.gl|ow\.ly|buff\.ly|short\.link|t\.co|is\.gd|tiny\.cc)\//i,
      moreShorteners: /^https?:\/\/([a-z0-9\-]+\.)?(tinyurl|bit\.ly|t\.co|goo\.gl|ow\.ly|short|tiny|link|redirect|track|goto|jump|click|ref)\./i
    },
    retailSpecific: {
      ebay: /[?&](campid|customid|mkcid|mkevt|mkrid|ssspo|sssrc|ssuid|var|widget_ver)=/i,
      bestbuy: /[?&](skuId|ref|loc|acampid|irclickid)=/i,
      walmart: /[?&](wmlspartner|sourceid|veh|adid)=/i,
      target: /[?&](afid|ref|lnk)=/i,
      aliexpress: /[?&](aff_trace_key|aff_platform|terminal_id)=/i,
      etsy: /[?&](ref|ga_ref|click_key|click_sum)=/i
    }
  },

  isAffiliateLink(url) {
    try {
      const urlObj = new URL(url);
      const href = url.toLowerCase();
      const search = urlObj.search.toLowerCase();
      const hostname = urlObj.hostname.toLowerCase();
      
      // Amazon detection with improved patterns
      if (this.patterns.amazon.shortLinks.test(href)) return { type: 'amazon', confidence: 'high' };
      if (this.patterns.amazon.tags.test(search)) return { type: 'amazon', confidence: 'high' };
      if (this.patterns.amazon.associateTag.test(search)) return { type: 'amazon', confidence: 'high' };
      if (this.patterns.amazon.specificRefPatterns.test(search)) return { type: 'amazon', confidence: 'high' };
      
      const isAmazonDomain = this.patterns.amazon.amazonDomains.test(hostname);
      if (isAmazonDomain) {
        if (this.patterns.amazon.affiliateId.test(search)) return { type: 'amazon', confidence: 'high' };
        if (this.patterns.amazon.refParam.test(search)) return { type: 'amazon', confidence: 'medium' };
        // Check for Amazon tracking parameters
        if (/[?&](pd_rd_|pf_rd_|ref_|refRID|linkCode|th=1)/i.test(search)) return { type: 'amazon', confidence: 'medium' };
      }
      
      if (this.patterns.georiot.domain.test(href)) return { type: 'georiot', confidence: 'high' };
      if (this.patterns.georiot.shortDomain.test(href)) return { type: 'georiot', confidence: 'high' };
      if (this.patterns.georiot.targetParam.test(search)) return { type: 'georiot', confidence: 'medium' };
      
      if (this.patterns.cnaet.domain.test(href)) return { type: 'cna.st', confidence: 'high' };
      if (this.patterns.cnaet.redirectDomain.test(href)) return { type: 'cna.st', confidence: 'high' };
      
      if (this.patterns.general.commonNetworks.test(href)) return { type: 'network', confidence: 'high' };
      if (this.patterns.general.bitly.test(href)) return { type: 'shortlink', confidence: 'medium' };
      if (this.patterns.general.moreShorteners.test(href)) return { type: 'shortlink', confidence: 'medium' };
      
      // Check for common tracking parameters across all domains
      if (this.patterns.general.trackingParams.test(search)) return { type: 'tracking', confidence: 'medium' };
      
      if (/ebay\.(com|co\.uk|ca|de|fr|es|it|com\.au)/i.test(hostname) && 
          this.patterns.retailSpecific.ebay.test(search)) {
        return { type: 'ebay', confidence: 'high' };
      }
      
      if (/bestbuy\.com/i.test(urlObj.hostname) && 
          this.patterns.retailSpecific.bestbuy.test(search)) {
        return { type: 'bestbuy', confidence: 'high' };
      }
      
      if (/walmart\.com/i.test(urlObj.hostname) && 
          this.patterns.retailSpecific.walmart.test(search)) {
        return { type: 'walmart', confidence: 'high' };
      }
      
      if (/target\.com/i.test(urlObj.hostname) && 
          this.patterns.retailSpecific.target.test(search)) {
        return { type: 'target', confidence: 'high' };
      }
      
      if (/aliexpress\.com/i.test(urlObj.hostname) && 
          this.patterns.retailSpecific.aliexpress.test(search)) {
        return { type: 'aliexpress', confidence: 'high' };
      }
      
      if (/etsy\.com/i.test(urlObj.hostname) && 
          this.patterns.retailSpecific.etsy.test(search)) {
        return { type: 'etsy', confidence: 'medium' };
      }
      
      let paramCount = 0;
      if (this.patterns.general.affiliateParams.test(search)) paramCount++;
      if (this.patterns.general.trackingParams.test(search)) paramCount++;
      
      if (paramCount >= 2) return { type: 'general', confidence: 'medium' };
      if (paramCount === 1) return { type: 'general', confidence: 'low' };
      
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