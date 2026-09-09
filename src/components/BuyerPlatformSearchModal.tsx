import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Globe,
  Mail,
  User,
  AtSign,
  ExternalLink,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  Send,
  Building2,
  Briefcase,
  Share2,
  Compass,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Eye,
  SlidersHorizontal,
  Edit2,
  Save,
} from 'lucide-react';
import { BuyerLead } from '../types';
import { canonicalMainUrl, isValidWebUrl, formatDisplayDomain } from '../utils/urlHelper';
import {
  deriveUsername,
  cleanHandle,
  getGoogleSearchUrls,
  getLinkedInSearchUrls,
  getFacebookSearchUrls,
  getEmailLinks,
  getOtherSocialLinks,
} from '../utils/platformSearchHelper';
import { getCountryFlag } from '../utils/countryHelper';
import { StatusBadge } from './StatusBadge';

interface BuyerPlatformSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads: BuyerLead[];
  initialLeadId?: number | null;
  onUpdateLead?: (lead: BuyerLead) => void;
}

type PlatformTab = 'all' | 'google' | 'linkedin' | 'facebook' | 'sandbox';

export const BuyerPlatformSearchModal: React.FC<BuyerPlatformSearchModalProps> = ({
  isOpen,
  onClose,
  leads,
  initialLeadId,
  onUpdateLead,
}) => {
  if (!isOpen || leads.length === 0) return null;

  // Selected lead state
  const [selectedLeadId, setSelectedLeadId] = useState<number>(() => {
    if (initialLeadId && leads.some((l) => l.id === initialLeadId)) {
      return initialLeadId;
    }
    return leads[0].id;
  });

  const [activeTab, setActiveTab] = useState<PlatformTab>('all');
  const [leadSearchFilter, setLeadSearchFilter] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Editable username state
  const currentLead = useMemo(() => {
    return leads.find((l) => l.id === selectedLeadId) || leads[0];
  }, [leads, selectedLeadId]);

  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [customUsernameInput, setCustomUsernameInput] = useState('');

  // Sandbox URL state
  const [sandboxQuery, setSandboxQuery] = useState('');

  // Handle index for next/prev
  const currentIndex = leads.findIndex((l) => l.id === currentLead.id);

  const handleNextLead = () => {
    if (currentIndex < leads.length - 1) {
      setSelectedLeadId(leads[currentIndex + 1].id);
      setIsEditingUsername(false);
    }
  };

  const handlePrevLead = () => {
    if (currentIndex > 0) {
      setSelectedLeadId(leads[currentIndex - 1].id);
      setIsEditingUsername(false);
    }
  };

  // Filtered dropdown leads list
  const filteredLeadsList = useMemo(() => {
    if (!leadSearchFilter.trim()) return leads;
    const q = leadSearchFilter.toLowerCase();
    return leads.filter(
      (l) =>
        l.companyName.toLowerCase().includes(q) ||
        l.buyerName.toLowerCase().includes(q) ||
        l.country.toLowerCase().includes(q) ||
        l.product.toLowerCase().includes(q)
    );
  }, [leads, leadSearchFilter]);

  // Copy helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2200);
  };

  // Save custom username
  const handleSaveUsername = () => {
    const cleaned = cleanHandle(customUsernameInput);
    if (!cleaned) return;
    const updatedLead: BuyerLead = {
      ...currentLead,
      username: cleaned,
    };
    if (onUpdateLead) {
      onUpdateLead(updatedLead);
    }
    setIsEditingUsername(false);
  };

  // Derived current links
  const activeUsername = currentLead.username || deriveUsername(currentLead);
  const googleUrls = getGoogleSearchUrls(currentLead);
  const linkedinUrls = getLinkedInSearchUrls(currentLead);
  const facebookUrls = getFacebookSearchUrls(currentLead);
  const emailLinks = getEmailLinks(currentLead);
  const otherSocial = getOtherSocialLinks(currentLead);
  const websiteUrl = canonicalMainUrl(currentLead.companyWebsite);

  // Multi-tab opener
  const handleOpenMulti = (urls: string[]) => {
    urls.forEach((u) => {
      if (u) window.open(u, '_blank', 'noopener,noreferrer');
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl border border-slate-200/90 flex flex-col my-auto max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-indigo-900/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/40 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shrink-0 shadow-inner">
              <Search className="w-5 h-5 text-indigo-200" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Buyer Search Platform: Google • LinkedIn • Facebook
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/40">
                  Cross-Platform Hub
                </span>
              </div>
              <p className="text-xs text-slate-300 font-sans mt-0.5">
                Instant 1-click lookup to open buyer websites, direct email/Gmail, usernames, and targeted search on Google, LinkedIn, and Facebook.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer shrink-0 ml-2"
            title="Close Search Platform"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Buyer Switcher Toolbar */}
        <div className="px-5 py-3 bg-slate-100/90 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
          {/* Buyer selector dropdown & filter */}
          <div className="flex items-center gap-2 flex-1 max-w-xl">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0 hidden sm:inline">
              Selected Buyer:
            </span>
            <div className="relative flex-1">
              <select
                id="buyer-search-select"
                value={currentLead.id}
                onChange={(e) => {
                  setSelectedLeadId(Number(e.target.value));
                  setIsEditingUsername(false);
                }}
                className="w-full bg-white text-xs font-semibold text-slate-900 border border-slate-300 rounded-lg px-3 py-2 pr-8 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden transition shadow-2xs cursor-pointer"
              >
                {filteredLeadsList.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.companyName} — {l.buyerName || 'Purchasing Desk'} ({l.country})
                  </option>
                ))}
              </select>
            </div>

            {/* Prev / Next buttons */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={handlePrevLead}
                disabled={currentIndex === 0}
                className="p-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shadow-2xs"
                title="Previous Buyer Lead"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-slate-500 font-mono px-1">
                {currentIndex + 1}/{leads.length}
              </span>
              <button
                onClick={handleNextLead}
                disabled={currentIndex === leads.length - 1}
                className="p-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shadow-2xs"
                title="Next Buyer Lead"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Lead Quick Search Filter */}
          <div className="relative shrink-0 md:w-56">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Find buyer in list..."
              value={leadSearchFilter}
              onChange={(e) => setLeadSearchFilter(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden transition placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Active Buyer Information Banner */}
        <div className="px-5 py-3.5 bg-white border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
              {currentLead.companyName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base text-slate-900 leading-tight">
                  {currentLead.companyName}
                </h3>
                <span className="text-sm">{getCountryFlag(currentLead.country)}</span>
                <span className="text-xs font-semibold text-slate-600">
                  {currentLead.country}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  {currentLead.businessType}
                </span>
                <StatusBadge status={currentLead.status} />
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-600 mt-1 flex-wrap">
                <div className="flex items-center gap-1 font-medium text-indigo-700">
                  <User className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{currentLead.buyerName || 'Purchasing Team'}</span>
                  {currentLead.job && <span className="text-slate-400 font-normal">({currentLead.job})</span>}
                </div>
                <span>•</span>
                <span className="text-slate-500 truncate max-w-xs">{currentLead.product}</span>
              </div>
            </div>
          </div>

          {/* Quick 1-Click Opener Combos */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleOpenMulti([websiteUrl, linkedinUrls.companySearch, facebookUrls.pagesSearch].filter(Boolean))}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold transition cursor-pointer shadow-2xs"
              title="Open Website + LinkedIn + Facebook together in 3 tabs"
            >
              <Compass className="w-3.5 h-3.5 text-indigo-600" />
              <span>Launch All 3 (Web • LI • FB)</span>
            </button>
            <button
              onClick={() => handleOpenMulti([emailLinks.gmail, websiteUrl].filter(Boolean))}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold transition cursor-pointer shadow-2xs"
              title="Open Gmail compose tab + Website together"
            >
              <Mail className="w-3.5 h-3.5 text-emerald-600" />
              <span>Gmail + Website</span>
            </button>
          </div>
        </div>

        {/* Scrollable Main Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 bg-slate-50/50">
          {/* PRIMARY TRIO LAUNCHPAD: WEBSITE, EMAIL & USERNAME */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Official Website Card */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-sm transition flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
                    <Globe className="w-4 h-4 text-indigo-600" />
                    <span>Official Website</span>
                  </div>
                  {isValidWebUrl(currentLead.companyWebsite) ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> Live Homepage
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 italic">No domain</span>
                  )}
                </div>

                <p className="text-xs text-slate-600 font-mono break-all line-clamp-1 bg-slate-50 p-2 rounded border border-slate-100 mb-3">
                  {currentLead.companyWebsite || 'Not available'}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                {isValidWebUrl(currentLead.companyWebsite) ? (
                  <>
                    <a
                      href={websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-2xs cursor-pointer"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Open Website</span>
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </a>
                    <button
                      onClick={() => handleCopy(websiteUrl, 'website')}
                      className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
                      title="Copy Website URL"
                    >
                      {copiedKey === 'website' ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </>
                ) : (
                  <a
                    href={googleUrls.companySite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Search Site on Google</span>
                  </a>
                )}
              </div>
            </div>

            {/* 2. Direct Business Email Card */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-sm transition flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
                    <Mail className="w-4 h-4 text-emerald-600" />
                    <span>Business Email</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                    B2B Direct
                  </span>
                </div>

                <p className="text-xs text-slate-800 font-mono font-medium break-all line-clamp-1 bg-slate-50 p-2 rounded border border-slate-100 mb-3">
                  {currentLead.businessEmail || 'Email not listed'}
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <a
                    href={emailLinks.mailto}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-2xs cursor-pointer"
                    title="Send using default email client"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Email (Mailto)</span>
                  </a>
                  <button
                    onClick={() => handleCopy(currentLead.businessEmail, 'email')}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
                    title="Copy Email Address"
                  >
                    {copiedKey === 'email' ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <a
                    href={emailLinks.gmail}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] transition"
                  >
                    <Mail className="w-3 h-3 text-red-500" />
                    <span>Open in Gmail</span>
                  </a>
                  <a
                    href={emailLinks.outlook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] transition"
                  >
                    <Mail className="w-3 h-3 text-blue-500" />
                    <span>Outlook Web</span>
                  </a>
                </div>
              </div>
            </div>

            {/* 3. Username & Social Handle Card */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-sm transition flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
                    <AtSign className="w-4 h-4 text-blue-600" />
                    <span>Username & Handle</span>
                  </div>
                  <button
                    onClick={() => {
                      setCustomUsernameInput(activeUsername);
                      setIsEditingUsername(!isEditingUsername);
                    }}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>{isEditingUsername ? 'Cancel' : 'Edit'}</span>
                  </button>
                </div>

                {isEditingUsername ? (
                  <div className="flex items-center gap-1.5 mb-3">
                    <input
                      type="text"
                      value={customUsernameInput}
                      onChange={(e) => setCustomUsernameInput(e.target.value)}
                      placeholder="e.g. theohmstore"
                      className="flex-1 px-2.5 py-1.5 text-xs border border-indigo-400 rounded focus:outline-hidden font-mono"
                    />
                    <button
                      onClick={handleSaveUsername}
                      className="px-2.5 py-1.5 bg-indigo-600 text-white rounded text-xs font-semibold hover:bg-indigo-700 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-slate-50 p-2 rounded border border-slate-100 mb-3">
                    <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-indigo-700">
                      <span>@{activeUsername}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(`@${activeUsername}`, 'username')}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                      title="Copy handle"
                    >
                      {copiedKey === 'username' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Handle Test Buttons */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  1-Click Handle Lookup:
                </span>
                <div className="grid grid-cols-3 gap-1">
                  <a
                    href={facebookUrls.directPageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1 py-1 px-2 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-semibold transition"
                    title={`Open facebook.com/${activeUsername}`}
                  >
                    <span>FB Page</span>
                  </a>
                  <a
                    href={linkedinUrls.directCompanyVanity}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1 py-1 px-2 rounded bg-sky-50 hover:bg-sky-100 text-sky-700 text-[11px] font-semibold transition"
                    title={`Open linkedin.com/company/${activeUsername}`}
                  >
                    <span>LI Vanity</span>
                  </a>
                  <a
                    href={googleUrls.usernameSearch}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1 py-1 px-2 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-semibold transition"
                    title={`Search @${activeUsername} on Google`}
                  >
                    <span>Google @</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* PLATFORM TABS NAVIGATION */}
          <div className="border-b border-slate-200 flex items-center justify-between flex-wrap gap-2 pt-2">
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3.5 py-2 rounded-t-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border-b-2 ${
                  activeTab === 'all'
                    ? 'border-indigo-600 text-indigo-700 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>All 3 Platforms (Summary)</span>
              </button>

              <button
                onClick={() => setActiveTab('google')}
                className={`px-3.5 py-2 rounded-t-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border-b-2 ${
                  activeTab === 'google'
                    ? 'border-amber-500 text-amber-800 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                <Search className="w-3.5 h-3.5 text-amber-600" />
                <span>Google Search Suite</span>
              </button>

              <button
                onClick={() => setActiveTab('linkedin')}
                className={`px-3.5 py-2 rounded-t-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border-b-2 ${
                  activeTab === 'linkedin'
                    ? 'border-blue-600 text-blue-700 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                <span>LinkedIn Search Suite</span>
              </button>

              <button
                onClick={() => setActiveTab('facebook')}
                className={`px-3.5 py-2 rounded-t-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border-b-2 ${
                  activeTab === 'facebook'
                    ? 'border-indigo-600 text-indigo-700 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Facebook Search Suite</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-400 pb-1">
              Target: <span className="font-semibold text-slate-700">{currentLead.companyName}</span>
            </div>
          </div>

          {/* TAB 1: ALL 3 PLATFORMS MATRIX */}
          {activeTab === 'all' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Google Column */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
                        <Search className="w-4 h-4 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">Google Search</h4>
                        <p className="text-[10px] text-slate-500">Official sites, portals & footprints</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <a
                        href={googleUrls.companySite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-amber-50/70 border border-slate-200/80 text-xs text-slate-800 hover:text-amber-900 transition group"
                      >
                        <span className="font-medium">1. Official Website & Portal</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600" />
                      </a>

                      <a
                        href={googleUrls.buyerProfile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-amber-50/70 border border-slate-200/80 text-xs text-slate-800 hover:text-amber-900 transition group"
                      >
                        <span className="font-medium">2. Buyer Profile ({currentLead.buyerName || 'Officer'})</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600" />
                      </a>

                      <a
                        href={googleUrls.wholesaleCatalog}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-amber-50/70 border border-slate-200/80 text-xs text-slate-800 hover:text-amber-900 transition group"
                      >
                        <span className="font-medium">3. Wholesale & Catalog Search</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600" />
                      </a>

                      <a
                        href={googleUrls.usernameSearch}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-amber-50/70 border border-slate-200/80 text-xs text-slate-800 hover:text-amber-900 transition group"
                      >
                        <span className="font-medium">4. Handle Footprint (@{activeUsername})</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600" />
                      </a>
                    </div>
                  </div>

                  <a
                    href={googleUrls.companySite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold transition"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Launch Google Search</span>
                  </a>
                </div>

                {/* LinkedIn Column */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
                        <Briefcase className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">LinkedIn Search</h4>
                        <p className="text-[10px] text-slate-500">Corporate pages & buyer profiles</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <a
                        href={linkedinUrls.companySearch}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-blue-50/70 border border-slate-200/80 text-xs text-slate-800 hover:text-blue-900 transition group"
                      >
                        <span className="font-medium">1. LinkedIn Company Page</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                      </a>

                      <a
                        href={linkedinUrls.buyerProfileSearch}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-blue-50/70 border border-slate-200/80 text-xs text-slate-800 hover:text-blue-900 transition group"
                      >
                        <span className="font-medium">2. Buyer Person Profile</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                      </a>

                      <a
                        href={linkedinUrls.sourcingTeamSearch}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-blue-50/70 border border-slate-200/80 text-xs text-slate-800 hover:text-blue-900 transition group"
                      >
                        <span className="font-medium">3. Sourcing & Purchasing Team</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                      </a>

                      <a
                        href={googleUrls.linkedinXRay}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-blue-50/70 border border-slate-200/80 text-xs text-slate-800 hover:text-blue-900 transition group"
                      >
                        <span className="font-medium">4. Google LinkedIn X-Ray</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                      </a>
                    </div>
                  </div>

                  <a
                    href={linkedinUrls.companySearch}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-xs font-semibold transition"
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Launch LinkedIn Search</span>
                  </a>
                </div>

                {/* Facebook Column */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center">
                        <Share2 className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">Facebook Search</h4>
                        <p className="text-[10px] text-slate-500">Business storefronts & groups</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <a
                        href={facebookUrls.pagesSearch}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-indigo-50/70 border border-slate-200/80 text-xs text-slate-800 hover:text-indigo-900 transition group"
                      >
                        <span className="font-medium">1. Official Business Storefront</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                      </a>

                      <a
                        href={facebookUrls.peopleSearch}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-indigo-50/70 border border-slate-200/80 text-xs text-slate-800 hover:text-indigo-900 transition group"
                      >
                        <span className="font-medium">2. Representative Search</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                      </a>

                      <a
                        href={facebookUrls.groupsSearch}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-indigo-50/70 border border-slate-200/80 text-xs text-slate-800 hover:text-indigo-900 transition group"
                      >
                        <span className="font-medium">3. B2B Wholesale Groups</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                      </a>

                      <a
                        href={googleUrls.facebookXRay}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-indigo-50/70 border border-slate-200/80 text-xs text-slate-800 hover:text-indigo-900 transition group"
                      >
                        <span className="font-medium">4. Google Facebook X-Ray</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                      </a>
                    </div>
                  </div>

                  <a
                    href={facebookUrls.pagesSearch}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs font-semibold transition"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Launch Facebook Search</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GOOGLE SUITE */}
          {activeTab === 'google' && (
            <div className="space-y-4 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
                    <Search className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Google Targeted Search Engine</h4>
                    <p className="text-xs text-slate-500">Run tailored queries against Google's global index</p>
                  </div>
                </div>

                <a
                  href={googleUrls.companySite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Open Main Google Search</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-amber-300 transition">
                  <span className="text-xs font-bold text-slate-800 block mb-1">Company Official Site & Wholesale</span>
                  <p className="text-[11px] font-mono text-slate-500 bg-white p-2 rounded border border-slate-200 mb-2 truncate">
                    "{currentLead.companyName}" official website OR wholesale portal
                  </p>
                  <a
                    href={googleUrls.companySite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-900"
                  >
                    <span>Run Query on Google</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-amber-300 transition">
                  <span className="text-xs font-bold text-slate-800 block mb-1">Buyer / Executive Profile</span>
                  <p className="text-[11px] font-mono text-slate-500 bg-white p-2 rounded border border-slate-200 mb-2 truncate">
                    "{currentLead.buyerName}" "{currentLead.companyName}"
                  </p>
                  <a
                    href={googleUrls.buyerProfile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-900"
                  >
                    <span>Run Query on Google</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-amber-300 transition">
                  <span className="text-xs font-bold text-slate-800 block mb-1">Email Footprint & Verification</span>
                  <p className="text-[11px] font-mono text-slate-500 bg-white p-2 rounded border border-slate-200 mb-2 truncate">
                    "{currentLead.businessEmail}"
                  </p>
                  <a
                    href={googleUrls.emailFootprint}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-900"
                  >
                    <span>Run Query on Google</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-amber-300 transition">
                  <span className="text-xs font-bold text-slate-800 block mb-1">Social Username & Handles</span>
                  <p className="text-[11px] font-mono text-slate-500 bg-white p-2 rounded border border-slate-200 mb-2 truncate">
                    "@{activeUsername}" OR site:facebook.com/{activeUsername}
                  </p>
                  <a
                    href={googleUrls.usernameSearch}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-900"
                  >
                    <span>Run Query on Google</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LINKEDIN SUITE */}
          {activeTab === 'linkedin' && (
            <div className="space-y-4 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">LinkedIn B2B Intelligence</h4>
                    <p className="text-xs text-slate-500">Corporate company pages, procurement officers & X-Ray</p>
                  </div>
                </div>

                <a
                  href={linkedinUrls.companySearch}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Open LinkedIn Search</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-blue-300 transition">
                  <span className="text-xs font-bold text-slate-800 block mb-1">Company Corporate Page</span>
                  <p className="text-xs text-slate-600 mb-2">
                    Search LinkedIn for registered entity: <span className="font-semibold text-slate-900">{currentLead.companyName}</span>
                  </p>
                  <a
                    href={linkedinUrls.companySearch}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900"
                  >
                    <span>Search LinkedIn Companies</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-blue-300 transition">
                  <span className="text-xs font-bold text-slate-800 block mb-1">Buyer Profile on LinkedIn</span>
                  <p className="text-xs text-slate-600 mb-2">
                    Search people: <span className="font-semibold text-slate-900">{currentLead.buyerName}</span> at {currentLead.companyName}
                  </p>
                  <a
                    href={linkedinUrls.buyerProfileSearch}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900"
                  >
                    <span>Search LinkedIn People</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-blue-300 transition">
                  <span className="text-xs font-bold text-slate-800 block mb-1">Google LinkedIn X-Ray</span>
                  <p className="text-xs text-slate-600 mb-2">
                    Bypass LinkedIn login walls using Google's public profile index:
                  </p>
                  <a
                    href={googleUrls.linkedinXRay}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900"
                  >
                    <span>Run LinkedIn X-Ray</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-blue-300 transition">
                  <span className="text-xs font-bold text-slate-800 block mb-1">Direct LinkedIn Handle Link</span>
                  <p className="text-xs text-slate-600 mb-2">
                    Direct vanity address: <span className="font-mono text-indigo-600 font-semibold">linkedin.com/company/{activeUsername}</span>
                  </p>
                  <a
                    href={linkedinUrls.directCompanyVanity}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900"
                  >
                    <span>Try Direct Vanity URL</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FACEBOOK SUITE */}
          {activeTab === 'facebook' && (
            <div className="space-y-4 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center">
                    <Share2 className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Facebook Social & Group Engine</h4>
                    <p className="text-xs text-slate-500">Business storefronts, niche buyer groups & social profiles</p>
                  </div>
                </div>

                <a
                  href={facebookUrls.pagesSearch}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Open Facebook Search</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-indigo-300 transition">
                  <span className="text-xs font-bold text-slate-800 block mb-1">Facebook Official Business Pages</span>
                  <p className="text-xs text-slate-600 mb-2">
                    Search business storefronts and verified pages for: <span className="font-semibold text-slate-900">{currentLead.companyName}</span>
                  </p>
                  <a
                    href={facebookUrls.pagesSearch}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:text-indigo-900"
                  >
                    <span>Search Facebook Pages</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-indigo-300 transition">
                  <span className="text-xs font-bold text-slate-800 block mb-1">Direct Facebook Handle URL</span>
                  <p className="text-xs text-slate-600 mb-2">
                    Try direct username: <span className="font-mono text-indigo-600 font-semibold">facebook.com/{activeUsername}</span>
                  </p>
                  <a
                    href={facebookUrls.directPageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:text-indigo-900"
                  >
                    <span>Open facebook.com/{activeUsername}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-indigo-300 transition">
                  <span className="text-xs font-bold text-slate-800 block mb-1">Facebook Wholesale & Niche Groups</span>
                  <p className="text-xs text-slate-600 mb-2">
                    Search active B2B importer groups for: <span className="font-semibold text-slate-900">{currentLead.product}</span>
                  </p>
                  <a
                    href={facebookUrls.groupsSearch}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:text-indigo-900"
                  >
                    <span>Search Facebook Groups</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-indigo-300 transition">
                  <span className="text-xs font-bold text-slate-800 block mb-1">Google Facebook X-Ray</span>
                  <p className="text-xs text-slate-600 mb-2">
                    Search all Facebook posts, public photos, and catalog items on Google:
                  </p>
                  <a
                    href={googleUrls.facebookXRay}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:text-indigo-900"
                  >
                    <span>Run Facebook X-Ray</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer Bar */}
        <div className="px-5 py-3.5 bg-slate-100/90 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>All search links are pre-configured to open target platforms in secure external tabs.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition cursor-pointer"
            >
              Done / Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
