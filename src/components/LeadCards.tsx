import React, { useState } from 'react';
import {
  ExternalLink,
  Copy,
  Check,
  Mail,
  Star,
  ShieldCheck,
  Sparkles,
  Building,
  Send,
  User,
  Globe,
  Search,
  MapPin,
  Phone,
} from 'lucide-react';
import { BuyerLead, OutreachStatus } from '../types';
import { StatusBadge } from './StatusBadge';
import { getCountryFlag } from '../utils/countryHelper';
import { canonicalMainUrl, isValidWebUrl, formatDisplayDomain } from '../utils/urlHelper';
import {
  getGoogleSearchUrls,
  getLinkedInSearchUrls,
  getFacebookSearchUrls,
} from '../utils/platformSearchHelper';

interface LeadCardsProps {
  leads: BuyerLead[];
  selectedIds: number[];
  onToggleSelect: (id: number) => void;
  onToggleStar: (id: number) => void;
  onStatusChange: (id: number, newStatus: OutreachStatus) => void;
  onSelectLead: (lead: BuyerLead) => void;
  onOpenPitch: (lead: BuyerLead) => void;
  onOpenSendEmail: (lead: BuyerLead) => void;
  onOpenPlatformSearch?: (lead: BuyerLead) => void;
}

export const LeadCards: React.FC<LeadCardsProps> = ({
  leads,
  selectedIds,
  onToggleSelect,
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {leads.map((lead) => {
        const isSelected = selectedIds.includes(lead.id);
        const hasNamedBuyer = lead.buyerName && lead.buyerName !== 'Not Available';

        return (
          <div
            key={lead.id}
            onClick={() => onSelectLead(lead)}
            className={`bg-white rounded-xl border p-4 sm:p-5 flex flex-col justify-between transition-all hover:shadow-md cursor-pointer relative group ${
              isSelected
                ? 'border-indigo-600 ring-2 ring-indigo-600/20 bg-indigo-50/20'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            {/* Card Header */}
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect(lead.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer w-4 h-4 shrink-0 mt-0.5"
                  />
                  <div className="min-w-0">
                    <h3 className="font-bold text-base text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                      {lead.companyName}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span>{getCountryFlag(lead.country)} {lead.country}</span>
                      <span>•</span>
                      <span className="font-medium text-indigo-600 truncate">{lead.businessType}</span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-1.5 flex-wrap" onClick={(e) => e.stopPropagation()}>
                      {isValidWebUrl(lead.companyWebsite) && (
                        <a
                          href={canonicalMainUrl(lead.companyWebsite)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-50/90 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-900 border border-indigo-200/80 text-[11px] font-semibold transition cursor-pointer group/site shadow-2xs"
                          title={`Open ${formatDisplayDomain(lead.companyWebsite)} official website in a new tab`}
                        >
                          <Globe className="w-3 h-3 text-indigo-600 shrink-0" />
                          <span className="font-mono underline-offset-2 group-hover/site:underline truncate max-w-[150px]">
                            {formatDisplayDomain(lead.companyWebsite)}
                          </span>
                          <ExternalLink className="w-2.5 h-2.5 text-indigo-500 shrink-0" />
                        </a>
                      )}
                      {/* Platform quick search links */}
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
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStar(lead.id);
                  }}
                  className="p-1 text-slate-300 hover:text-amber-500 transition cursor-pointer shrink-0"
                >
                  <Star
                    className={`w-4 h-4 ${
                      lead.isStarred ? 'fill-amber-400 text-amber-500' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Contact Information Box */}
              <div className="bg-slate-50 rounded-xl p-3 my-3 border border-slate-200 text-xs space-y-2">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100/80 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {hasNamedBuyer ? lead.buyerName.charAt(0) : 'B'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span className="font-bold text-slate-900 truncate block">
                        {hasNamedBuyer ? lead.buyerName : 'Procurement Department'}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 truncate block mt-0.5">{lead.job}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/70" onClick={(e) => e.stopPropagation()}>
                  <span className="text-slate-400 font-medium text-[11px]">Email:</span>
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-800">
                    <span className="truncate max-w-[150px]">{lead.businessEmail}</span>
                    <button
                      onClick={(e) => handleCopyEmail(e, lead.id, lead.businessEmail)}
                      className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                      title="Copy email"
                    >
                      {copiedId === lead.id ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>

                {lead.address && (
                  <div className="pt-1.5 border-t border-slate-200/70" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-start gap-1.5 text-[11px] text-slate-700">
                      <MapPin className="w-3 h-3 text-rose-500 shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <span className="truncate block font-medium select-all" title={lead.address}>
                          {lead.address}
                        </span>
                        {lead.phone && (
                          <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                            {lead.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Product & Category Focus */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">
                  <span>Target Product</span>
                  {lead.category && (
                    <span className="text-[10px] text-indigo-600 font-semibold normal-case bg-indigo-50 px-1.5 py-0.5 rounded">
                      {lead.category}
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5">
                  {lead.product}
                </p>
              </div>

              {/* Evidence Quote */}
              <div className="mb-4">
                <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>B2B Evidence</span>
                </div>
                <p className="text-xs text-slate-600 bg-slate-50/70 p-2 rounded border border-slate-100 line-clamp-3 leading-relaxed">
                  &ldquo;{lead.buyerEvidence}&rdquo;
                </p>
              </div>
            </div>

            {/* Card Footer: Status & Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
              <StatusBadge
                status={lead.status}
                interactive={true}
                onChange={(newSt) => onStatusChange(lead.id, newSt)}
              />

              <div className="flex items-center gap-1.5">
                {onOpenPlatformSearch && (
                  <button
                    onClick={() => onOpenPlatformSearch(lead)}
                    className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs transition cursor-pointer flex items-center gap-1"
                    title="Open Google, LinkedIn & Facebook search platform for this buyer"
                  >
                    <Search className="w-3.5 h-3.5 text-amber-700" />
                    <span className="text-[11px] font-semibold hidden sm:inline">Search</span>
                  </button>
                )}
                <button
                  onClick={() => onOpenSendEmail(lead)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                  title={`Send email directly to ${lead.buyerName}`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Email</span>
                </button>
                <button
                  onClick={() => onOpenPitch(lead)}
                  className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-medium transition cursor-pointer flex items-center gap-1"
                  title="Generate Outreach Pitch"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-[11px]">Pitch</span>
                </button>
                {isValidWebUrl(lead.companyWebsite) && (
                  <a
                    href={canonicalMainUrl(lead.companyWebsite)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs transition cursor-pointer"
                    title={`Visit Official Website (${formatDisplayDomain(lead.companyWebsite)})`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

          </div>
        );
      })}
    </div>
  );
};
