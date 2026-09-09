import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  Copy,
  Check,
  Mail,
  ShieldCheck,
  Send,
  Building2,
  User,
  MapPin,
  Calendar,
  Sparkles,
  Save,
  BrainCircuit,
  Wand2,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Globe,
  Search,
  AtSign,
  Share2,
  Phone,
} from 'lucide-react';
import { BuyerLead, OutreachStatus } from '../types';
import { StatusBadge } from './StatusBadge';
import { getCountryFlag } from '../utils/countryHelper';
import { canonicalMainUrl, isValidWebUrl, formatDisplayDomain } from '../utils/urlHelper';
import { generateOutreachEmail } from '../utils/csvHelper';
import {
  deriveUsername,
  getGoogleSearchUrls,
  getLinkedInSearchUrls,
  getFacebookSearchUrls,
} from '../utils/platformSearchHelper';

interface LeadDetailModalProps {
  lead: BuyerLead | null;
  onClose: () => void;
  onUpdateLead: (updated: BuyerLead) => void;
  onOpenSendEmail?: (lead: BuyerLead) => void;
  onOpenPlatformSearch?: (lead: BuyerLead) => void;
}

interface IntelligenceData {
  procurementProfile: string;
  recommendedMOQ: string;
  targetMarginBenefit: string;
  negotiationTips: string[];
  idealPitchAngle: string;
  redFlagsToAvoid?: string;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  lead,
  onClose,
  onUpdateLead,
  onOpenSendEmail,
  onOpenPlatformSearch,
}) => {
  if (!lead) return null;

  const [activeTab, setActiveTab] = useState<'profile' | 'outreach' | 'intelligence'>('profile');
  const [templateType, setTemplateType] = useState<'catalog' | 'pricing'>('catalog');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPitch, setCopiedPitch] = useState(false);
  const [copiedIntel, setCopiedIntel] = useState(false);
  const [notes, setNotes] = useState(lead.notes || '');
  const [isSavedNotes, setIsSavedNotes] = useState(false);

  // Intelligence State
  const [intelData, setIntelData] = useState<IntelligenceData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [intelError, setIntelError] = useState<string | null>(null);

  const pitchData = generateOutreachEmail(lead, templateType);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(lead.businessEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyPitch = () => {
    const fullText = `Subject: ${pitchData.subject}\n\n${pitchData.body}`;
    navigator.clipboard.writeText(fullText);
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2000);
  };

  const handleSaveNotes = () => {
    onUpdateLead({ ...lead, notes });
    setIsSavedNotes(true);
    setTimeout(() => setIsSavedNotes(false), 2000);
  };

  const handleFetchIntelligence = async () => {
    setIsAnalyzing(true);
    setIntelError(null);
    try {
      const res = await fetch('/api/ai/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || !contentType.includes('application/json')) {
        throw new Error('Procurement intelligence temporarily unavailable. Please retry in a moment.');
      }
      const data = await res.json();
      if (data.success && data.analysis) {
        setIntelData(data.analysis);
      } else {
        setIntelError(data.error || 'Failed to generate procurement intelligence');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error connecting to intelligence endpoint';
      setIntelError(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyIntelligence = () => {
    if (!intelData) return;
    const text = `Trade Intelligence for ${lead.companyName} (${lead.country}):\n\n• Procurement Profile:\n${intelData.procurementProfile}\n\n• Recommended Trial MOQ: ${intelData.recommendedMOQ}\n• Target Margin Benefit: ${intelData.targetMarginBenefit}\n• Ideal Pitch Hook: ${intelData.idealPitchAngle}\n• Key Negotiation Tips:\n${intelData.negotiationTips.map((t) => `  - ${t}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopiedIntel(true);
    setTimeout(() => setCopiedIntel(false), 2000);
  };

  const hasNamedBuyer = lead.buyerName && lead.buyerName !== 'Not Available';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-xs">
              {lead.companyName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {lead.companyName}
                </h2>
                <StatusBadge
                  status={lead.status}
                  interactive={true}
                  onChange={(newSt) => onUpdateLead({ ...lead, status: newSt })}
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1.5 flex-wrap font-sans">
                <span className="flex items-center gap-1 font-medium text-slate-700">
                  <span>{getCountryFlag(lead.country)}</span>
                  <span>{lead.country}</span>
                </span>
                <span>•</span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
                  {lead.businessType}
                </span>
                {lead.category && (
                  <>
                    <span>•</span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium border border-slate-200">
                      {lead.category}
                    </span>
                  </>
                )}
                {isValidWebUrl(lead.companyWebsite) && (
                  <>
                    <span>•</span>
                    <a
                      href={canonicalMainUrl(lead.companyWebsite)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-900 border border-indigo-200 font-mono text-xs font-semibold transition group/web shadow-2xs"
                      title={`Open ${formatDisplayDomain(lead.companyWebsite)} official website in a new tab`}
                    >
                      <Globe className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="group-hover/web:underline">{formatDisplayDomain(lead.companyWebsite)}</span>
                      <ExternalLink className="w-3 h-3 text-indigo-500" />
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-white px-6 gap-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 transition cursor-pointer mr-3 ${
              activeTab === 'profile'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Trade Profile & Verification
          </button>
          <button
            onClick={() => setActiveTab('outreach')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 transition cursor-pointer mr-3 flex items-center gap-1.5 ${
              activeTab === 'outreach'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Outreach Email Pitch</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('intelligence');
              if (!intelData) handleFetchIntelligence();
            }}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'intelligence'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BrainCircuit className="w-4 h-4 text-indigo-600" />
            <span>AI Strategy (Gemini)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-800 flex-1 font-sans">
          {activeTab === 'profile' && (
            <>
              {/* Contact Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Direct Contact / Officer
                  </span>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className={`text-sm font-medium ${hasNamedBuyer ? 'text-slate-900' : 'text-slate-500 italic'}`}>
                      {lead.buyerName}
                    </span>
                  </div>
                  {lead.job && (
                    <span className="text-xs text-slate-500 block mt-0.5 ml-6">
                      {lead.job}
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Direct Business Email
                  </span>
                  <div className="flex items-center justify-between gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="text-xs sm:text-sm font-mono text-slate-800 truncate">
                        {lead.businessEmail}
                      </span>
                    </div>
                    <button
                      onClick={handleCopyEmail}
                      className="text-slate-400 hover:text-slate-600 p-1 rounded-sm transition cursor-pointer"
                      title="Copy Email"
                    >
                      {copiedEmail ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {lead.address && (
                  <div className="sm:col-span-2 pt-3 border-t border-slate-200/80">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Verified Physical Address & HQ
                    </span>
                    <div className="flex items-start gap-2 bg-white border border-slate-200 px-3 py-2 rounded-lg text-xs text-slate-800">
                      <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium select-all leading-relaxed">{lead.address}</p>
                        {lead.phone && (
                          <div className="flex items-center gap-1.5 text-slate-600 font-mono mt-1 text-[11px]">
                            <Phone className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            <span>{lead.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {isValidWebUrl(lead.companyWebsite) && (
                  <div className="sm:col-span-2 pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div>
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                        Company Official Website
                      </span>
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span className="font-mono text-sm font-bold text-slate-900">
                          {formatDisplayDomain(lead.companyWebsite)}
                        </span>
                      </div>
                    </div>
                    <a
                      href={canonicalMainUrl(lead.companyWebsite)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-xs cursor-pointer shrink-0"
                    >
                      <span>Open Company Website</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>

              {/* Cross-Platform Search & Discovery Hub (Google, LinkedIn, Facebook, Website, Email) */}
              <div className="bg-gradient-to-br from-indigo-50/70 via-slate-50 to-blue-50/50 p-4 rounded-xl border border-indigo-100/90 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 uppercase tracking-wider">
                      <Search className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Google, LinkedIn & Facebook Search Platform</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Direct deep searches for official websites, emails, social usernames, and procurement profiles.
                    </p>
                  </div>
                  {onOpenPlatformSearch && (
                    <button
                      onClick={() => onOpenPlatformSearch(lead)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer self-start sm:self-auto shrink-0"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Open Search Platform Hub</span>
                    </button>
                  )}
                </div>

                {/* Derived / Stored Username */}
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 mb-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <AtSign className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="text-xs text-slate-500 font-medium">Username / Handle:</span>
                    <span className="text-xs font-mono font-bold text-slate-900 truncate">
                      @{lead.username || deriveUsername(lead)}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded font-mono">
                    For LI / FB URL handles
                  </span>
                </div>

                {/* 1-Click Search Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {/* Google */}
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span>Google Search</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <a
                        href={getGoogleSearchUrls(lead).companySite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-between gap-1 text-[11px] font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded border border-amber-200/80 transition"
                      >
                        <span>Official Website</span>
                        <ExternalLink className="w-3 h-3 text-amber-700 shrink-0" />
                      </a>
                      <a
                        href={getGoogleSearchUrls(lead).emailFootprint}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-between gap-1 text-[11px] font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded border border-amber-200/80 transition"
                      >
                        <span>Email & Contacts</span>
                        <ExternalLink className="w-3 h-3 text-amber-700 shrink-0" />
                      </a>
                    </div>
                  </div>

                  {/* LinkedIn */}
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <span>LinkedIn Search</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <a
                        href={getLinkedInSearchUrls(lead).companySearch}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-between gap-1 text-[11px] font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded border border-blue-200/80 transition"
                      >
                        <span>Company Page</span>
                        <ExternalLink className="w-3 h-3 text-blue-700 shrink-0" />
                      </a>
                      <a
                        href={getLinkedInSearchUrls(lead).buyerProfileSearch}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-between gap-1 text-[11px] font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded border border-blue-200/80 transition"
                      >
                        <span>Buyer Contact</span>
                        <ExternalLink className="w-3 h-3 text-blue-700 shrink-0" />
                      </a>
                    </div>
                  </div>

                  {/* Facebook */}
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-500" />
                      <span>Facebook Search</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <a
                        href={getFacebookSearchUrls(lead).pagesSearch}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-between gap-1 text-[11px] font-semibold text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded border border-indigo-200/80 transition"
                      >
                        <span>Business Page</span>
                        <ExternalLink className="w-3 h-3 text-indigo-700 shrink-0" />
                      </a>
                      <a
                        href={getFacebookSearchUrls(lead).directPageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-between gap-1 text-[11px] font-semibold text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded border border-indigo-200/80 transition"
                      >
                        <span>Profile Handle</span>
                        <ExternalLink className="w-3 h-3 text-indigo-700 shrink-0" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product & Evidence */}
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Import Product Demands & Search Query
                  </span>
                  <div className="p-3 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium text-sm">
                    {lead.product}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Verification Source & Importer Evidence
                  </span>
                  <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold mb-0.5">Verified Commercial Importer</p>
                      <p className="text-amber-800 leading-relaxed">{lead.buyerEvidence}</p>
                      {lead.sourceUrl && (
                        <a
                          href={lead.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-amber-900 hover:underline mt-2 font-medium"
                        >
                          <span>Review Public Trade Record</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {lead.tags && lead.tags.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Lead Categorization Tags
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {lead.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Internal Deal Notes & History
                  </span>
                  <button
                    onClick={handleSaveNotes}
                    className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                  >
                    {isSavedNotes ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{isSavedNotes ? 'Saved!' : 'Save Note'}</span>
                  </button>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record quotes, custom pricing sent, samples dispatched, or meeting schedules..."
                  rows={3}
                  className="w-full text-xs rounded-xl border border-slate-300 p-3 text-slate-800 focus:border-indigo-600 focus:outline-hidden"
                />
              </div>
            </>
          )}

          {activeTab === 'outreach' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Outreach Template Format
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTemplateType('catalog')}
                    className={`px-3 py-1 rounded-md text-xs font-medium border transition cursor-pointer ${
                      templateType === 'catalog'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    Wholesale Catalog Intro
                  </button>
                  <button
                    onClick={() => setTemplateType('pricing')}
                    className={`px-3 py-1 rounded-md text-xs font-medium border transition cursor-pointer ${
                      templateType === 'pricing'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    Price Sheet & MOQ
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subject Line
                </label>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900">
                  {pitchData.subject}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pre-Formatted Email Body
                </label>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs text-slate-800 whitespace-pre-line leading-relaxed max-h-64 overflow-y-auto">
                  {pitchData.body}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 flex-wrap">
                <button
                  onClick={handleCopyPitch}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium transition cursor-pointer"
                >
                  {copiedPitch ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Copied Pitch!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-500" />
                      <span>Copy Full Pitch</span>
                    </>
                  )}
                </button>

                {onOpenSendEmail && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenSendEmail(lead);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition cursor-pointer shadow-xs"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Email Directly</span>
                  </button>
                )}

                <a
                  href={`mailto:${lead.businessEmail}?subject=${encodeURIComponent(
                    pitchData.subject
                  )}&body=${encodeURIComponent(pitchData.body)}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-semibold transition cursor-pointer"
                >
                  <span>Open in Default Mailer</span>
                </a>
              </div>
            </div>
          )}

          {activeTab === 'intelligence' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Gemini Strategic Procurement Intelligence</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    AI-powered procurement profile, margin analysis, and negotiation playbook for {lead.companyName}
                  </p>
                </div>
                <button
                  onClick={handleFetchIntelligence}
                  disabled={isAnalyzing}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition disabled:opacity-50 cursor-pointer"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>{intelData ? 'Re-Analyze' : 'Analyze Buyer'}</span>
                    </>
                  )}
                </button>
              </div>

              {intelError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {intelError}
                </div>
              )}

              {intelData ? (
                <div className="space-y-3.5">
                  {/* Procurement Profile */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Procurement Profile & Operating Model
                    </span>
                    <p className="text-xs text-slate-800 leading-relaxed">
                      {intelData.procurementProfile}
                    </p>
                  </div>

                  {/* 2-Col: MOQ & Margins */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                      <div className="flex items-center gap-1.5 mb-1 text-emerald-800 font-bold text-xs">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Recommended Trial MOQ</span>
                      </div>
                      <p className="text-xs text-emerald-900 font-medium">
                        {intelData.recommendedMOQ}
                      </p>
                    </div>

                    <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl">
                      <div className="flex items-center gap-1.5 mb-1 text-blue-800 font-bold text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Target Margin Advantage</span>
                      </div>
                      <p className="text-xs text-blue-900 font-medium">
                        {intelData.targetMarginBenefit}
                      </p>
                    </div>
                  </div>

                  {/* Ideal Pitch Angle */}
                  <div className="p-3.5 bg-indigo-50/60 border border-indigo-200 rounded-xl">
                    <div className="flex items-center gap-1.5 mb-1 text-indigo-900 font-bold text-xs">
                      <Lightbulb className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Optimal Outreach Hook & Angle</span>
                    </div>
                    <p className="text-xs text-indigo-950 font-medium leading-relaxed">
                      "{intelData.idealPitchAngle}"
                    </p>
                  </div>

                  {/* Negotiation Tips */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Negotiation Playbook for {lead.country} Market
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {intelData.negotiationTips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Red Flags / Avoid */}
                  {intelData.redFlagsToAvoid && (
                    <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start gap-2 text-xs text-amber-900">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-semibold block mb-0.5">Common Pitfall to Avoid:</strong>
                        <span>{intelData.redFlagsToAvoid}</span>
                      </div>
                    </div>
                  )}

                  <div className="pt-1 flex justify-end">
                    <button
                      onClick={handleCopyIntelligence}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium transition cursor-pointer"
                    >
                      {copiedIntel ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copied Strategy!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Copy Strategy Report</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded-xl space-y-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                    <BrainCircuit className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">
                      Generate Strategic Intelligence for {lead.companyName}
                    </h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                      Our Gemini trade engine evaluates buyer history, geography, and product category to craft negotiation tips and recommended trial MOQ.
                    </p>
                  </div>
                  <button
                    onClick={handleFetchIntelligence}
                    disabled={isAnalyzing}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Run AI Analysis</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-400">ID #{lead.id} • Verified B2B Trade Record</span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
