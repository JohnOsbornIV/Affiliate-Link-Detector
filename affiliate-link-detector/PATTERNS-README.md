# Affiliate Detection Patterns Configuration

The `affiliate-patterns.js` file contains all the patterns used to detect affiliate links. You can easily modify this file to customize detection behavior.

## 🔧 Easy Customization

### Always Detected Domains
These domains are **always flagged** regardless of parameters:

```javascript
alwaysDetectedDomains: [
  'cna.st',        // Any URL containing cna.st
  'georiot.com',   // Any URL containing georiot.com  
  'geni.us'        // Any URL containing geni.us
]
```

### Add Custom Blacklisted Domains
Add any domains you want to always flag:

```javascript
customBlacklistDomains: [
  'suspicious-site.com',
  'another-affiliate-network.net',
  'sketchy-redirect.org'
]
```

### Add Custom Affiliate Parameters
Add any URL parameters that should trigger detection:

```javascript
customAffiliateParams: [
  'my_affiliate_param',
  'custom_referral_id',
  'special_tracking_code'
]
```

## 📋 Current Detection Rules

### 1. **Always Detected (Domain Only)**
- `cna.st` - Any URL containing this domain
- `georiot.com` - Any URL containing this domain  
- `geni.us` - Any URL containing this domain

### 2. **Amazon Links**
- Associate tags: `?tag=affiliate-20`
- Shortened links: `amzn.to`, `a.co`
- Ref parameters: `?ref=as_li_`, `?ref=cm_sw_`
- Tracking: `?pf_rd_`, `?pd_rd_`

### 3. **General Affiliate Parameters**
Links with these parameters are flagged:
- `affiliate`, `aff`, `aff_id`, `affiliate_id`
- `partner`, `partner_id`
- `ref`, `referer`, `referrer`, `refdomain` ⭐
- `utm_source`, `utm_medium`, `utm_campaign`
- `click_id`, `clickid`, `irclickid`
- `sharedId` ⭐, `subId`, `pubRef`
- `sponsor`, `promo`, `promocode`
- And many more...

### 4. **Affiliate Network Domains**
- ShareASale, Commission Junction, ClickBank
- LinkSynergy, Rakuten, Skimlinks
- VigLink, Impact Radius, Partnerize
- And 10+ more networks

### 5. **URL Shorteners**
- bit.ly, tinyurl.com, goo.gl
- t.co, ow.ly, buff.ly
- And more...

### 6. **Retailer-Specific**
- **eBay**: `campid`, `mkcid`, `mkevt`
- **Best Buy**: `irclickid`, `acampid`
- **Walmart**: `wmlspartner`, `sourceid`
- **Target**: `afid`, `ref`, `lnk`
- **AliExpress**: `aff_trace_key`, `aff_platform`

## ⚡ Quick Modifications

### Block a New Domain
```javascript
// Add to alwaysDetectedDomains or customBlacklistDomains:
'newsite.com'
```

### Add New Parameter
```javascript
// Add to customAffiliateParams:
'my_tracking_param'
```

### Disable Detection
```javascript
// Comment out or remove from arrays:
// 'domain-to-ignore.com'
```

## 🎯 Detection Confidence Levels

- **High**: Amazon tags, always-detected domains, network domains
- **Medium**: General affiliate params, tracking params, custom params
- **All levels** are flagged and highlighted by the extension

## 💡 Tips

1. **Test changes** using the included `test-page.html`
2. **Reload extension** after modifying patterns
3. **Check browser console** for detection logs
4. **Add comments** to document your custom rules

## 🚨 Important Notes

- Domain matching is case-insensitive
- Partial domain matches work (e.g., 'cna.st' matches 'www.cna.st' and 'redirect.cna.st')
- Parameter matching requires the `=` sign (e.g., `?ref=value`)
- Changes take effect after reloading the extension

---

**New in this version**: Added `refdomain` and `sharedId` parameter detection as requested! ⭐