import { BuyerLead } from '../types';
import { canonicalMainUrl, formatDisplayDomain } from './urlHelper';

/**
 * Normalizes or extracts a clean username / social handle for a company or buyer
 */
export function deriveUsername(lead: Partial<BuyerLead>): string {
  if (lead.username && lead.username.trim()) {
    return lead.username.trim().replace(/^@+/, '');
  }

  // Derive from website domain if present
  if (lead.companyWebsite) {
    const domain = formatDisplayDomain(lead.companyWebsite).toLowerCase();
    const cleanDomain = domain
      .replace(/^www\./, '')
      .replace(/\.(com|co|org|net|biz|ca|uk|in|de|io|store)$/i, '')
      .replace(/[^a-z0-9_]/g, '');
    if (cleanDomain.length >= 3) {
      return cleanDomain;
    }
  }

  // Derive from company name
  if (lead.companyName) {
    const cleanName = lead.companyName
      .toLowerCase()
      .replace(/['’]/g, '')
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 24);
    if (cleanName.length >= 3) {
      return cleanName;
    }
  }

  return 'tradepartner';
}

export function cleanHandle(handle: string): string {
  return handle.trim().replace(/^@+/, '').replace(/\s+/g, '');
}

/**
 * Generate Google Search URLs
 */
export function getGoogleSearchUrls(lead: BuyerLead) {
  const company = lead.companyName || '';
  const buyer = lead.buyerName && lead.buyerName !== 'Not Available' ? lead.buyerName : '';
  const handle = deriveUsername(lead);
  const email = lead.businessEmail || '';
  const product = lead.product || '';

  return {
    // Search company official site & B2B portal
    companySite: `https://www.google.com/search?q=${encodeURIComponent(`"${company}" official website OR wholesale portal`)}`,
    
    // Search decision maker / buyer profile
    buyerProfile: buyer
      ? `https://www.google.com/search?q=${encodeURIComponent(`"${buyer}" "${company}"`)}`
      : `https://www.google.com/search?q=${encodeURIComponent(`"${company}" purchasing director OR buyer OR procurement`)}`,
    
    // Search email footprint & contact directory
    emailFootprint: email
      ? `https://www.google.com/search?q=${encodeURIComponent(`"${email}"`)}`
      : `https://www.google.com/search?q=${encodeURIComponent(`"${company}" contact email OR wholesale inquiry`)}`,
    
    // Search social username / handle
    usernameSearch: `https://www.google.com/search?q=${encodeURIComponent(`"@${handle}" OR site:facebook.com/${handle} OR site:linkedin.com/company/${handle} OR site:instagram.com/${handle}`)}`,
    
    // Search wholesale catalog & import records
    wholesaleCatalog: `https://www.google.com/search?q=${encodeURIComponent(`"${company}" ("wholesale" OR "importer" OR "distributor" OR "catalog") ${product ? `"${product}"` : ''}`.trim())}`,

    // LinkedIn X-Ray on Google
    linkedinXRay: buyer
      ? `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/in/ "${buyer}" "${company}"`)}`
      : `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/company/ "${company}"`)}`,

    // Facebook X-Ray on Google
    facebookXRay: `https://www.google.com/search?q=${encodeURIComponent(`site:facebook.com "${company}"`)}`,
  };
}

/**
 * Generate LinkedIn Search URLs
 */
export function getLinkedInSearchUrls(lead: BuyerLead) {
  const company = lead.companyName || '';
  const buyer = lead.buyerName && lead.buyerName !== 'Not Available' ? lead.buyerName : '';
  const job = lead.job && lead.job !== 'Wholesale Sales / Purchasing' ? lead.job : 'Buyer';
  const handle = deriveUsername(lead);

  return {
    // Official LinkedIn Company page search
    companySearch: `https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(company)}`,
    
    // Specific buyer / decision maker profile on LinkedIn
    buyerProfileSearch: buyer
      ? `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(`${buyer} ${company}`)}`
      : `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(`${company} procurement buyer`)}`,
    
    // Sourcing / Procurement team at company
    sourcingTeamSearch: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(`${company} ${job}`)}`,

    // Direct company vanity URL attempt
    directCompanyVanity: `https://www.linkedin.com/company/${handle}`,

    // LinkedIn general all search
    allResultsSearch: `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(`${company} ${buyer}`.trim())}`,
  };
}

/**
 * Generate Facebook Search URLs
 */
export function getFacebookSearchUrls(lead: BuyerLead) {
  const company = lead.companyName || '';
  const buyer = lead.buyerName && lead.buyerName !== 'Not Available' ? lead.buyerName : '';
  const product = lead.product || '';
  const handle = deriveUsername(lead);

  return {
    // Facebook Top Search for company
    topSearch: `https://www.facebook.com/search/top?q=${encodeURIComponent(company)}`,
    
    // Facebook Official Business Pages & Storefronts
    pagesSearch: `https://www.facebook.com/search/pages?q=${encodeURIComponent(company)}`,
    
    // Facebook Buyer / Person Profile Search
    peopleSearch: buyer
      ? `https://www.facebook.com/search/people?q=${encodeURIComponent(`${buyer} ${company}`)}`
      : `https://www.facebook.com/search/people?q=${encodeURIComponent(company)}`,
    
    // Facebook Groups for the category/niche
    groupsSearch: `https://www.facebook.com/search/groups?q=${encodeURIComponent(`${product || company} wholesale B2B`)}`,

    // Direct Facebook Page URL attempt
    directPageUrl: `https://www.facebook.com/${handle}`,
  };
}

/**
 * Generate Direct Email & Webmail URLs
 */
export function getEmailLinks(lead: BuyerLead) {
  const email = lead.businessEmail || '';
  const company = lead.companyName || '';
  const buyer = lead.buyerName && lead.buyerName !== 'Not Available' ? lead.buyerName : 'Purchasing Team';
  const product = lead.product || 'Wholesale Goods';

  const subject = `B2B Wholesale & Supply Inquiry – ${company}`;
  const body = `Dear ${buyer},\n\nI hope this email finds you well.\n\nI am reaching out to explore potential wholesale supply and commercial distribution opportunities for ${product} with ${company}.\n\nCould we share our verified catalog, export specifications, and B2B pricing with your procurement desk?\n\nBest regards,\nTrade Development Team`;

  return {
    mailto: `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    gmail: `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    outlook: `https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(email)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
  };
}

/**
 * Generate Other Social Links
 */
export function getOtherSocialLinks(lead: BuyerLead) {
  const handle = deriveUsername(lead);
  return {
    instagram: `https://www.instagram.com/${handle}`,
    twitterX: `https://x.com/${handle}`,
    youtubeSearch: `https://www.youtube.com/results?search_query=${encodeURIComponent(lead.companyName)}`,
  };
}
