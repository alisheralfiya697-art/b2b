import React, { useState } from 'react';
import { X, Plus, Building2 } from 'lucide-react';
import { BuyerLead, OutreachStatus } from '../types';
import { canonicalMainUrl, isValidWebUrl } from '../utils/urlHelper';

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLead: (lead: Omit<BuyerLead, 'id'>) => void;
}

const CATEGORY_OPTIONS = [
  'Fresh Produce & Agriculture',
  'Herbal & Personal Care',
  'Textiles & Fabrics',
  'Home Decor & Lifestyle',
  'Wellness & Holistic Instruments',
  'Industrial & Hardware Supplies',
  'Food & Beverage Commodities',
  'Consumer Electronics & Goods',
  'Other Wholesale Sector',
];

const ROLE_OPTIONS = [
  'Importer',
  'Wholesaler',
  'Retailer',
  'Buyer',
  'Distributor',
  'Importer & Wholesaler',
  'Distributor & Supplier',
];

export const AddLeadModal: React.FC<AddLeadModalProps> = ({
  isOpen,
  onClose,
  onAddLead,
}) => {
  if (!isOpen) return null;

  const [companyName, setCompanyName] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [job, setJob] = useState('Procurement & Purchasing');
  const [country, setCountry] = useState('USA');
  const [businessType, setBusinessType] = useState('Importer & Wholesaler');
  const [category, setCategory] = useState('Fresh Produce & Agriculture');
  const [product, setProduct] = useState('');
  const [buyerEvidence, setBuyerEvidence] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !businessEmail.trim()) return;

    let countryCode = 'US';
    const cLower = country.toLowerCase();
    if (cLower === 'canada') countryCode = 'CA';
    else if (cLower === 'australia') countryCode = 'AU';
    else if (cLower === 'netherlands') countryCode = 'NL';
    else if (cLower === 'germany') countryCode = 'DE';
    else if (cLower === 'uk' || cLower === 'united kingdom') countryCode = 'GB';
    else if (cLower === 'india') countryCode = 'IN';

    onAddLead({
      companyName: companyName.trim(),
      buyerName: buyerName.trim() || 'Not Available',
      businessEmail: businessEmail.trim(),
      address: address.trim() || undefined,
      phone: phone.trim() || undefined,
      job: job.trim() || 'Purchasing Department',
      country: country.trim(),
      countryCode,
      businessType: businessType.trim() || 'Wholesaler',
      category: category.trim() || 'General Trade',
      product: product.trim() || 'Commodities / Products',
      buyerEvidence: buyerEvidence.trim() || 'Verified active commercial buyer/importer.',
      sourceUrl: sourceUrl.trim() && isValidWebUrl(sourceUrl.trim()) ? canonicalMainUrl(sourceUrl.trim()) : '',
      companyWebsite: companyWebsite.trim() && isValidWebUrl(companyWebsite.trim()) ? canonicalMainUrl(companyWebsite.trim()) : '',
      status: 'Not Contacted' as OutreachStatus,
      notes: notes.trim(),
      tags: [businessType.split(' ')[0] || 'Trade Lead'],
      isStarred: false,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-slate-900">
                Add B2B Trade Entity
              </h2>
              <p className="text-xs text-slate-500 font-sans">
                Record a verified importer, wholesaler, retailer, buyer, or distributor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 font-sans text-xs sm:text-sm">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Company Name *
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. FreshAgro Traders, Apex Distributors"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/30 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Person / Executive
              </label>
              <input
                type="text"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder="e.g. Sarah Jenkins or 'Not Available'"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/30 outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Business Email *
              </label>
              <input
                type="email"
                required
                value={businessEmail}
                onChange={(e) => setBusinessEmail(e.target.value)}
                placeholder="procurement@company.com"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/30 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Role / Job Title
              </label>
              <input
                type="text"
                value={job}
                onChange={(e) => setJob(e.target.value)}
                placeholder="Purchasing Director / Import Head"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/30 outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Trade Role *
              </label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="w-full px-2.5 py-2 rounded-lg border border-slate-300 focus:border-indigo-600 focus:outline-hidden bg-white text-xs"
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Industry Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-2.5 py-2 rounded-lg border border-slate-300 focus:border-indigo-600 focus:outline-hidden bg-white text-xs"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Country *
              </label>
              <input
                type="text"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="USA, India, Germany, etc."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/30 outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Product Focus
            </label>
            <input
              type="text"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder="e.g. Fresh tomatoes & produce, cotton sarees, herbal cosmetic wash, sound healing tools"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/30 outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Buyer Evidence / Trade Proof
            </label>
            <textarea
              rows={2}
              value={buyerEvidence}
              onChange={(e) => setBuyerEvidence(e.target.value)}
              placeholder="e.g. Registered import-export agency with dedicated bulk procurement department..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/30 outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Verified Physical Address / HQ
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 120 E Main St, Moreland, GA 30259, USA"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/30 outline-hidden text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Direct Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +1 (888) 646-7867"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/30 outline-hidden text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Verification Proof URL
              </label>
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/30 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Company Website
              </label>
              <input
                type="text"
                value={companyWebsite}
                onChange={(e) => setCompanyWebsite(e.target.value)}
                placeholder="e.g. www.singingbowlolsen.com or https://..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/30 outline-hidden text-xs"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Save B2B Lead</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
