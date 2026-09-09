export type OutreachStatus =
  | 'Not Contacted'
  | 'Contacted'
  | 'In Discussion'
  | 'Sample Requested'
  | 'Partnership Closed'
  | 'Not a Fit';

export interface BuyerLead {
  id: number;
  companyName: string;
  buyerName: string;
  businessEmail: string;
  job: string;
  country: string;
  countryCode: string;
  address?: string;
  phone?: string;
  businessType: string;
  category: string;
  product: string;
  buyerEvidence: string;
  sourceUrl: string;
  companyWebsite: string;
  username?: string;
  verifiedB2BAccount?: boolean;
  status: OutreachStatus;
  notes: string;
  tags: string[];
  lastContactDate?: string;
  isStarred?: boolean;
}

export type ViewMode = 'table' | 'cards';

export interface FilterState {
  searchQuery: string;
  country: string;
  businessType: string;
  category: string;
  status: string;
  onlyNamedBuyers: boolean;
  onlyStarred: boolean;
}
