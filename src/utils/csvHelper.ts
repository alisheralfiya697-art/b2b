import { BuyerLead } from '../types';

export function exportLeadsToCSV(leads: BuyerLead[], filename = 'global-b2b-trade-leads.csv') {
  const headers = [
    '#',
    'Company Name',
    'Buyer Name',
    'Business Email',
    'Job',
    'Country',
    'Business Type',
    'Category',
    'Product',
    'Buyer Evidence',
    'Source URL',
    'Company Website',
    'Outreach Status',
    'Notes'
  ];

  const escapeCSV = (str: string) => {
    if (!str) return '""';
    const escaped = str.replace(/"/g, '""');
    return `"${escaped}"`;
  };

  const rows = leads.map((lead, idx) => [
    idx + 1,
    escapeCSV(lead.companyName),
    escapeCSV(lead.buyerName),
    escapeCSV(lead.businessEmail),
    escapeCSV(lead.job),
    escapeCSV(lead.country),
    escapeCSV(lead.businessType),
    escapeCSV(lead.category || 'Trade & Wholesale'),
    escapeCSV(lead.product),
    escapeCSV(lead.buyerEvidence),
    escapeCSV(lead.sourceUrl),
    escapeCSV(lead.companyWebsite),
    escapeCSV(lead.status),
    escapeCSV(lead.notes)
  ]);

  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function generateOutreachEmail(
  lead: BuyerLead,
  templateType: 'wholesale' | 'distributor' | 'pricing' | 'catalog' = 'wholesale',
  customProductOffer?: string
) {
  const recipientName =
    lead.buyerName && lead.buyerName !== 'Not Available'
      ? lead.buyerName
      : 'Procurement & Purchasing Team';

  const productTarget = customProductOffer || lead.product;

  if (templateType === 'distributor') {
    return {
      subject: `B2B Supply & Distribution Inquiry for ${lead.companyName} | ${productTarget}`,
      body: `Dear ${recipientName},

I hope you are well.

I came across ${lead.companyName} and your established trade network in ${lead.country}. Knowing your strong track record as an active ${lead.businessType} in ${lead.product}, I am reaching out to discuss potential supply synergy.

We specialize in high-capacity, direct-source supply of ${productTarget}, servicing regional wholesalers, distributors, and bulk institutional buyers.

Why trade partners work with us:
- Verified factory/origin-direct pricing with transparent trade tiers
- Flexible shipment terms (FOB / CIF / Express DDP freight to ${lead.country})
- Rigorous batch quality inspection, lab certifications & export compliance
- Scalable contract volume with reliable delivery schedules

Could we schedule a brief introductory call or send over our current B2B specification catalog and wholesale price list for ${lead.companyName}?

Best regards,

[Your Name / Title]
[Your Company / Organization]
[Email / WhatsApp / Website]`
    };
  }

  if (templateType === 'pricing') {
    return {
      subject: `Direct B2B Pricing & Trade Catalog for ${lead.companyName} [${productTarget}]`,
      body: `Hi ${recipientName},

I hope you're having a productive week.

I noticed that ${lead.companyName} deals extensively with ${lead.product}. Given your role in bulk procurement and wholesale fulfillment in ${lead.country}, I wanted to introduce our direct trade pricing.

We are a primary source supplier capable of fulfilling consistent, competitive commercial quantities for:
• ${productTarget}

Key advantages for your bottom line:
- Direct primary source margins (cutting out unnecessary intermediary markups)
- Low minimum order quantity (MOQ) flexibility on initial trial orders
- Rapid commercial sampling with door-to-door courier dispatch
- Full customs documentation, bills of lading, and certificate of origin

Would you be open to reviewing our 2026 wholesale rate sheet and specification deck for ${lead.companyName}?

Warm regards,

[Your Name / Title]
[Your Company]
[Phone / Direct Contact]`
    };
  }

  // Default: General Wholesale / Buyer proposal
  return {
    subject: `Wholesale Trade Partnership: ${lead.companyName} x [Your Company]`,
    body: `Hello ${recipientName},

I hope this message finds you well.

I came across ${lead.companyName} and was impressed by your distribution portfolio and market presence across ${lead.country}. We noted your specific focus in ${lead.product}.

We are expanding our B2B trade partnerships and would welcome the opportunity to supply ${lead.companyName} with premium-grade ${productTarget}.

Our trade commitment includes:
- Guaranteed grade consistency and standardized commercial packaging
- Prompt sample dispatch for quality appraisal
- Dedicated B2B account support and priority order processing
- Competitive volume discounts tailored for ${lead.businessType} partners

May I send over our latest commercial catalog and sample pricing for your evaluation?

Sincerely,

[Your Name]
[Your Company]
[Contact Information & Catalog URL]`
  };
}
