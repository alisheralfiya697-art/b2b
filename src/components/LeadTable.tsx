import React, { useState } from 'react';
import {
  ExternalLink,
  Copy,
  Check,
  Mail,
  Star,
  FileText,
  ShieldCheck,
  Sparkles,
  Send,
  User,
  Globe,
  Search,
  Briefcase,
  Share2,
  AtSign,
} from 'lucide-react';
import { BuyerLead, OutreachStatus } from '../types';
import { StatusBadge } from './StatusBadge';
import { getCountryFlag } from '../utils/countryHelper';
import { canonicalMainUrl, isValidWebUrl, formatDisplayDomain } from '../utils/urlHelper';
import {
  deriveUsername,
  getGoogleSearchUrls,
  getLinkedInSearchUrls,
  getFacebookSearchUrls,
} from '../utils/platformSearchHelper';

interface LeadTableProps {
  leads: BuyerLead[];
  selectedIds: number[];
  onToggleSelect: (id: number) => void;
  onSelectAll: () => void;
  onToggleStar: (id: number) => void;
  onStatusChange: (id: number, newStatus: OutreachStatus) => void;
  onSelectLead: (lead: BuyerLead) => void;
  onOpenPitch: (lead: BuyerLead) => void;
  onOpenSendEmail: (lead: BuyerLead) => void;
  onOpenPlatformSearch?: (lead: BuyerLead) => void;
}

export const LeadTable: React.FC<LeadTableProps> = ({
  leads,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onToggleStar,
  onStatusChange,
  onSelectLead,
  onOpenPitch,
  onOpenSendEmail,
  onOpenPlatformSearch,
}) => {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopyEmail = (e: React.MouseEvent, id: number, email: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isAllSelected = leads.length > 0 && selectedIds.length === leads.length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
              <th className="py-3.5 pl-4 pr-2 w-10">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={onSelectAll}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer w-4 h-4"
                />
              </th>
              <th className="py-3.5 px-2 w-10">★</th>
              <th className="py-3.5 px-3">Company & Website</th>
              <th className="py-3.5 px-3">Buyer Contact</th>
              <th className="py-3.5 px-3">Business Email</th>
              <th className="py-3.5 px-3">Country</th>
              <th className="py-3.5 px-3">Role & Industry</th>
              <th className="py-3.5 px-3">Target Product</th>
              <th className="py-3.5 px-3 min-w-[200px]">Buyer Evidence</th>
              <th className="py-3.5 px-3">Status</th>
              <th className="py-3.5 pr-4 pl-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads.map((lead) => {
              const isSelected = selectedIds.includes(lead.id);
              const hasNamedBuyer = lead.buyerName && lead.buyerName !== 'Not Available';

              return (
                <tr
                  key={lead.id}
                  className={`hover:bg-slate-50 transition-colors group cursor-pointer ${
                    isSelected ? 'bg-indigo-50/40' : ''
                  }`}
                  onClick={() => onSelectLead(lead)}
                >
                  {/* Select Checkbox */}
                  <td className="py-3.5 pl-4 pr-2" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(lead.id)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer w-4 h-4"
                    />
                  </td>

                  {/* Star Toggle */}
                  <td className="py-3.5 px-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onToggleStar(lead.id)}
                      className="text-slate-300 hover:text-amber-500 transition cursor-pointer"
                      title={lead.isStarred ? 'Unstar buyer' : 'Star buyer'}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          lead.isStarred ? 'fill-amber-400 text-amber-500' : ''
                        }`}
                      />
                    </button>
                  </td>

                  {/* Company & Website */}
                  <td className="py-3.5 px-3">
                    <div className="flex flex-col items-start">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        <span>{lead.companyName}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1 flex-wrap" onClick={(e) => e.stopPropagation()}>
                        {isValidWebUrl(lead.companyWebsite) && (
                          <a
                            href={canonicalMainUrl(lead.companyWebsite)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-indigo-700 bg-indigo-50/90 hover:bg-indigo-100 hover:text-indigo-900 px-1.5 py-0.5 rounded border border-indigo-200/80 transition shadow-2xs group/link"
                            title={`Open ${formatDisplayDomain(lead.companyWebsite)} in a new tab`}
                          >
                            <Globe className="w-2.5 h-2.5 text-indigo-600 shrink-0" />
                            <span className="truncate max-w-[110px] group-hover/link:underline">
                              {formatDisplayDomain(lead.companyWebsite)}
                            </span>
                            <ExternalLink className="w-2 h-2 text-indigo-500 shrink-0" />
                          </a>
                        )}
                        {/* Quick Platform 1-Click Search Badges */}
                        <a
                          href={getGoogleSearchUrls(lead).companySite}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-1.5 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/60 text-[10px] font-bold transition"
                          title="Search on Google"
                        >
                          Google
                        </a>
                        <a
                          href={getLinkedInSearchUrls(lead).companySearch}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-1.5 py-0.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200/60 text-[10px] font-bold transition"
                          title="Search on LinkedIn"
                        >
                          LI
                        </a>
                        <a
                          href={getFacebookSearchUrls(lead).pagesSearch}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-1.5 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200/60 text-[10px] font-bold transition"
                          title="Search on Facebook"
                        >
                          FB
                        </a>
                      </div>
                    </div>
                  </td>

                  {/* Buyer Contact */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-start gap-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {lead.buyerName && lead.buyerName !== 'Not Available' ? lead.buyerName.charAt(0) : 'B'}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          <span className="font-semibold text-slate-900 text-xs sm:text-sm">
                            {lead.buyerName && lead.buyerName !== 'Not Available' ? lead.buyerName : 'Procurement Directorate'}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 font-sans mt-0.5">{lead.job}</span>
                      </div>
                    </div>
                  </td>

                  {/* Business Email */}
                  <td className="py-3.5 px-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`mailto:${lead.businessEmail}`}
                        className="text-xs font-mono text-slate-700 hover:text-indigo-600 transition truncate max-w-[160px]"
                        title={lead.businessEmail}
                      >
                        {lead.businessEmail}
                      </a>
                      <button
                        onClick={(e) => handleCopyEmail(e, lead.id, lead.businessEmail)}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                        title="Copy email to clipboard"
                      >
                        {copiedId === lead.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Country & Address */}
                  <td className="py-3.5 px-3">
                    <div className="flex flex-col">
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-700 font-medium whitespace-nowrap">
                        <span className="text-base">{getCountryFlag(lead.country)}</span>
                        <span>{lead.country}</span>
                      </span>
                      {lead.address && (
                        <span className="text-[10px] text-slate-500 truncate max-w-[160px] mt-0.5" title={lead.address}>
                          {lead.address}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Role & Industry */}
                  <td className="py-3.5 px-3">
                    <div className="flex flex-col gap-1 max-w-[180px]">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 w-fit">
                        {lead.businessType}
                      </span>
                      {lead.category && (
                        <span className="text-[11px] text-slate-500 truncate font-sans" title={lead.category}>
                          {lead.category}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Target Product */}
                  <td className="py-3.5 px-3 max-w-[180px]">
                    <span className="text-xs font-medium text-slate-800 line-clamp-2" title={lead.product}>
                      {lead.product}
                    </span>
                  </td>

                  {/* Buyer Evidence */}
                  <td className="py-3.5 px-3 max-w-[260px]">
                    <div className="flex flex-col">
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        &ldquo;{lead.buyerEvidence}&rdquo;
                      </p>
                      {lead.sourceUrl && (
                        <a
                          href={lead.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-medium mt-1 w-fit"
                        >
                          <ShieldCheck className="w-3 h-3 text-indigo-600" />
                          <span>Proof Source</span>
                        </a>
                      )}
                    </div>
                  </td>

                  {/* Outreach Status */}
                  <td className="py-3.5 px-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <StatusBadge
                      status={lead.status}
                      interactive={true}
                      onChange={(newSt) => onStatusChange(lead.id, newSt)}
                    />
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 pr-4 pl-2 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      {onOpenPlatformSearch && (
                        <button
                          onClick={() => onOpenPlatformSearch(lead)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold transition cursor-pointer shadow-2xs"
                          title="Open Google, LinkedIn & Facebook search platform for this buyer"
                        >
                          <Search className="w-3.5 h-3.5 text-amber-700" />
                          <span>Search Hub</span>
                        </button>
                      )}
                      <button
                        onClick={() => onOpenSendEmail(lead)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                        title={`Send outreach email directly to ${lead.buyerName}`}
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Email</span>
                      </button>
                      <button
                        onClick={() => onOpenPitch(lead)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-medium transition cursor-pointer"
                        title="Draft Personalized Pitch"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Pitch</span>
                      </button>
                      <button
                        onClick={() => onSelectLead(lead)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium transition cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                        <span>Profile</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
