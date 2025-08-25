// Affiliate Link Detection Patterns
// Users can modify these patterns to customize detection

const AffiliatePatterns = {
  // Always detected domains - any URL containing these domains is flagged
  alwaysDetectedDomains: [
    'cna.st',
    'georiot.com',
    'sjv.io',
    'ojrq.net',
    'geni.us',
    'wclink.co',
    'anrdoezrs.net',
    'dpbolvw.net',
    'jdoqocy.com',
    'kqzyfj.com',
    'tkqlhce.com',
    'shrsl.com',
    'awin1.com',
    '7eer.net',
    '8nn1.net',
    'gopjn.com',
    'pjatr.com',
    'pjtra.com',
    'pntra.com',
    'pntrac.com',
    'pntrs.com',
    'raftrack.com',
    'rakuten.com',
    'hop.clickbank.net',
    'rover.ebay.com',
    'skimresources.com',
    'tp.media',
    'vereaze.com',
    'blozum.com',
    'etsy.com',
    'scaleo.io',
    'adsempire.com',
    'directaffiliate.com',
    'adplexity.com',
    '99dollarsocial.com'
  ],

  // Amazon-specific patterns
  amazon: {
    // Amazon associate tags and parameters
    tags: /[?&]tag=([a-zA-Z0-9\-_]+)/i,
    affiliateId: /[?&](ascsubtag|linkCode|linkId|camp|creative|creativeASIN|pf_rd_|pd_rd_|ie=|qid=)=/i,
    associateTag: /[?&]associateTag=([a-zA-Z0-9\-_]+)/i,
    refParam: /[?&]ref(_|=)([a-zA-Z0-9\-_]+)/i,
    specificRefPatterns: /[?&]ref(_|=)(as_li_|as_sl_|nosim|sr_|cm_sw_|dp_|pd_)/i,
    
    // Amazon shortened links and domains
    shortLinks: /^https?:\/\/(amzn\.to|a\.co|amzn\.eu|amzn\.asia|smile\.amazon\.|amazon\.[\w.]+\/dp\/|amazon\.[\w.]+\/gp\/)/i,
    domains: /amazon\.(com|co\.uk|ca|de|fr|es|it|co\.jp|com\.au|com\.br|in|com\.mx|cn|sg|ae|nl)/i
  },

  // General affiliate and tracking parameters
  general: {
    // Common affiliate parameters
    affiliateParams: /[?&](affiliate|aff|aff_id|affiliate_id|partner|partner_id|ref|referer|refdomain|utm_medium|utm_campaign|utm_content|click_id|clickid|campaign|subid|sub_id|sharedId|irclickid|pubRef|affid|afflnk|click|promo|promocode|referral|sponsor)=/i,
    
    // Tracking and analytics parameters
    trackingParams: /[?&](trk|track|tracking|tid|transaction_id|msclkid|fbclid|gclid|mc_cid|mc_eid|_ga|_gid|dclid)=/i
  },

  // Affiliate network domains
  networkDomains: [
    'shareasale.com',
    'cj.com',
    'clickbank.com',
    'linksynergy.com',
    'avantlink.com',
    'pepperjam.com',
    'commission-junction.com',
    'rakuten.com',
    'skimlinks.com',
    'viglink.com',
    'sovrn.com',
    'rewardstyle.com',
    'shopstyle.com',
    'impact-radius.com',
    'partnerize.com',
    'refersion.com',
    'tapfiliate.com',
    'postaffiliatepro.com',
    'hasoffers.com'
  ],

  // URL shortening services
  shorteners: [
    'bit.ly',
    'bitly.com',
    'j.mp',
    'tinyurl.com',
    'goo.gl',
    'ow.ly',
    'buff.ly',
    'short.link',
    't.co',
    'is.gd',
    'tiny.cc'
  ],

  // Retailer-specific affiliate parameters
  retailers: {
    ebay: {
      domains: /ebay\.(com|co\.uk|ca|de|fr|es|it|com\.au)/i,
      params: /[?&](campid|customid|mkcid|mkevt|mkrid|ssspo|sssrc|ssuid|var|widget_ver)=/i
    },
    bestbuy: {
      domains: /bestbuy\.com/i,
      params: /[?&](skuId|ref|loc|acampid|irclickid)=/i
    },
    walmart: {
      domains: /walmart\.com/i,
      params: /[?&](wmlspartner|sourceid|veh|adid)=/i
    },
    target: {
      domains: /target\.com/i,
      params: /[?&](afid|ref|lnk)=/i
    },
    aliexpress: {
      domains: /aliexpress\.com/i,
      params: /[?&](aff_trace_key|aff_platform|terminal_id)=/i
    },
    etsy: {
      domains: /etsy\.com/i,
      params: /[?&](ref|ga_ref|click_key|click_sum)=/i
    }
  },

  // Custom blacklisted domains - add any domains you want to always flag
  customBlacklistDomains: [
    // Add custom domains here, e.g.:
    // 'suspicious-affiliate-site.com',
    // 'another-referral-domain.net'
  ],

  // Custom affiliate parameters - add any parameters you want to detect
  customAffiliateParams: [
    // Add custom parameters here, e.g.:
    // 'my_affiliate_param',
    // 'custom_referral_id'
  ]
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AffiliatePatterns;
} else if (typeof window !== 'undefined') {
  window.AffiliatePatterns = AffiliatePatterns;
}
