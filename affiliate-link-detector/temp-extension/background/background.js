const affiliatePatterns = {
  amazon: {
    tags: /[?&]tag=([a-zA-Z0-9\-_]+)/i,
    affiliateId: /[?&](ascsubtag|linkCode|linkId|camp|creative|creativeASIN)=/i,
    shortLinks: /^https?:\/\/(amzn\.to|a\.co|amzn\.eu|amzn\.asia)\//i,
    associateTag: /[?&]associateTag=([a-zA-Z0-9\-_]+)/i,
    refParam: /[?&]ref_?=([a-zA-Z0-9\-_]+)/i,
    specificRefPatterns: /[?&]ref_?=(as_li_|as_sl_|nosim|sr_)/i
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
    affiliateParams: /[?&](affiliate|aff|aff_id|affiliate_id|partner|partner_id|ref|referer|referrer|source|utm_source|utm_medium|utm_campaign|click_id|clickid|campaign|cid|sid|subid|sub_id)=/i,
    trackingParams: /[?&](trk|track|tracking|tid|transaction_id)=/i,
    commonNetworks: /^https?:\/\/([a-z]+\.)?(shareasale|cj|clickbank|linksynergy|avantlink|pepperjam|pjtra|pntra|dpbolvw|kqzyfj|jdoqocy|tkqlhce|anrdoezrs|commission-junction|qksrv|evyy|7eer|refersion|tapfiliate|postaffiliatepro|hasoffers|impact-radius|partnerize|rakuten|skimlinks|viglink|sovrn|rewardstyle|shopstyle|rstyle)\.(com|net|co|io)/i,
    bitly: /^https?:\/\/(bit\.ly|bitly\.com|j\.mp|tinyurl\.com|goo\.gl|ow\.ly|buff\.ly|short\.link)\//i
  }
};

async function checkUrlForAffiliateLinks(url) {
  try {
    const urlObj = new URL(url);
    const href = url.toLowerCase();
    const search = urlObj.search.toLowerCase();
    const hostname = urlObj.hostname.toLowerCase();
    
    // Simplified detection using domain-only checks for cna.st and georiot.com
    if (hostname.includes('cna.st') || hostname.includes('georiot.com') || hostname.includes('geni.us')) {
      return {
        hasAffiliateLinks: true,
        count: 1,
        types: ['referral']
      };
    }
    
    // Amazon detection
    if (/[?&]tag=([a-zA-Z0-9\-_]+)/i.test(search) ||
        /^https?:\/\/(amzn\.to|a\.co|amzn\.eu|amzn\.asia)/i.test(href) ||
        /[?&](ascsubtag|linkCode|linkId|camp|creative|creativeASIN|pf_rd_|pd_rd_)/i.test(search)) {
      return {
        hasAffiliateLinks: true,
        count: 1,
        types: ['amazon']
      };
    }
    
    // General affiliate parameters (including new ones: refdomain, sharedId)
    if (/[?&](affiliate|aff|aff_id|affiliate_id|partner|partner_id|ref|referer|referrer|refdomain|source|utm_source|utm_medium|utm_campaign|utm_content|click_id|clickid|campaign|cid|sid|subid|sub_id|sharedId|irclickid|u1|subId|pubRef|affid|afflnk|awesm|click|ck|promo|promocode|referral|sponsor)=/i.test(search)) {
      return {
        hasAffiliateLinks: true,
        count: 1,
        types: ['general']
      };
    }
    
    // Tracking parameters
    if (/[?&](trk|track|tracking|tid|transaction_id|msclkid|fbclid|gclid|mc_cid|mc_eid|_ga|_gid|dclid)=/i.test(search)) {
      return {
        hasAffiliateLinks: true,
        count: 1,
        types: ['tracking']
      };
    }
    
    // Network domains
    const networkDomains = ['shareasale.com', 'cj.com', 'clickbank.com', 'linksynergy.com', 'avantlink.com', 'pepperjam.com', 'commission-junction.com', 'rakuten.com', 'skimlinks.com', 'viglink.com', 'sovrn.com'];
    for (const domain of networkDomains) {
      if (hostname.includes(domain)) {
        return {
          hasAffiliateLinks: true,
          count: 1,
          types: ['network']
        };
      }
    }
    
    return {
      hasAffiliateLinks: false,
      count: 0,
      types: []
    };
  } catch (e) {
    return {
      hasAffiliateLinks: false,
      count: 0,
      types: []
    };
  }
}

async function scanWebPage(url) {
  console.log('Background: Scanning webpage:', url);
  
  try {
    // First check if the URL itself is affiliate
    const urlCheck = checkUrlForAffiliateLinks(url);
    if (urlCheck.hasAffiliateLinks) {
      console.log('Background: URL itself is affiliate');
      return urlCheck;
    }
    
    // Try to fetch the page
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      mode: 'cors'
    });
    
    if (!response.ok) {
      console.log('Background: Fetch failed, using URL-only check');
      return urlCheck;
    }
    
    const html = await response.text();
    console.log('Background: Fetched HTML, length:', html.length);
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const links = doc.querySelectorAll('a[href]');
    
    let affiliateCount = 0;
    const types = new Set();
    
    console.log('Background: Found', links.length, 'links to check');
    
    links.forEach(link => {
      const result = checkUrlForAffiliateLinks(link.href);
      if (result.hasAffiliateLinks) {
        affiliateCount++;
        result.types.forEach(type => types.add(type));
        console.log('Background: Found affiliate link:', link.href, result);
      }
    });
    
    // Check page text for affiliate disclosures
    const pageText = doc.body ? doc.body.textContent.toLowerCase() : html.toLowerCase();
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
    
    let hasAffiliateDisclosure = false;
    for (const disclosure of affiliateDisclosures) {
      if (pageText.includes(disclosure)) {
        hasAffiliateDisclosure = true;
        types.add('disclosure');
        console.log('Background: Found affiliate disclosure:', disclosure);
        break;
      }
    }
    
    if (hasAffiliateDisclosure && affiliateCount === 0) {
      affiliateCount = 1; // Count disclosure as one affiliate indicator
    }
    
    console.log('Background: Total affiliate links found:', affiliateCount, hasAffiliateDisclosure ? '(includes disclosure)' : '');
    
    return {
      hasAffiliateLinks: affiliateCount > 0,
      count: affiliateCount,
      types: Array.from(types)
    };
    
  } catch (error) {
    console.error('Background: Error scanning webpage:', error);
    // Return URL-only check as fallback
    return checkUrlForAffiliateLinks(url);
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scanUrl') {
    scanWebPage(request.url).then(result => {
      sendResponse(result);
    });
    return true;
  } else if (request.action === 'scanUrlContent') {
    scanWebPage(request.url).then(result => {
      sendResponse(result);
    });
    return true;
  } else if (request.action === 'checkUrl') {
    const result = checkUrlForAffiliateLinks(request.url);
    sendResponse(result);
    return true;
  }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    autoHighlight: false,
    totalScans: 0,
    affiliateLinksFound: 0
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    chrome.storage.local.get(['autoHighlight'], (settings) => {
      if (settings.autoHighlight) {
        chrome.tabs.sendMessage(tabId, { action: 'scanPage' }, (response) => {
          if (response && response.count > 0) {
            chrome.tabs.sendMessage(tabId, { action: 'highlightLinks' });
          }
        });
      }
    });
  }
});