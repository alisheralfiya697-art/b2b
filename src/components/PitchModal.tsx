import React, { useState } from 'react';
import { X, Copy, Check, Send, Sparkles, RefreshCw, Wand2, ShieldCheck } from 'lucide-react';
import { BuyerLead } from '../types';
import { generateOutreachEmail } from '../utils/csvHelper';

interface PitchModalProps {
  lead: BuyerLead | null;
  onClose: () => void;
  onOpenSendEmail?: (lead: BuyerLead) => void;
}

export const PitchModal: React.FC<PitchModalProps> = ({ lead, onClose, onOpenSendEmail }) => {
  if (!lead) return null;

  const [mode, setMode] = useState<'ai' | 'template'>('ai');
  const [template, setTemplate] = useState<'wholesale' | 'distributor' | 'pricing'>('wholesale');
  const [tone, setTone] = useState<'direct' | 'formal' | 'exclusive' | 'concise'>('direct');
  const [senderName, setSenderName] = useState('Global Trade Manager');
  const [senderCompany, setSenderCompany] = useState('Premier Global Suppliers');
  const [customProduct, setCustomProduct] = useState(lead.product);
  const [valueProposition, setValueProposition] = useState('Certified acoustic frequency verification & direct international freight');
  const [copied, setCopied] = useState(false);

  // AI-generated pitch state
  const [aiPitch, setAiPitch] = useState<{
    subject: string;
    body: string;
    keySellingPoints?: string[];
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Generate base template pitch
  const basePitch = generateOutreachEmail(lead, template, customProduct);
  const templateSubject = basePitch.subject;
  const templateBody = basePitch.body
    .replace('[Your Name / Title]', senderName)
    .replace('[Your Name]', senderName)
    .replace('[Your Company / Organization]', senderCompany)
    .replace('[Your Company]', senderCompany);

  const activeSubject = mode === 'ai' && aiPitch ? aiPitch.subject : templateSubject;
  const activeBody = mode === 'ai' && aiPitch ? aiPitch.body : templateBody;

  const handleGenerateAiPitch = async () => {
    setIsGenerating(true);
    setAiError(null);
    try {
      const res = await fetch('/api/ai/pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead,
          tone,
          customProduct,
          senderName,
          senderCompany,
          valueProposition,
        }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || !contentType.includes('application/json')) {
        throw new Error('AI pitch service temporarily unavailable. You can use our high-converting template above.');
      }
      const data = await res.json();
      if (data.success && data.pitch) {
        setAiPitch(data.pitch);
        setMode('ai');
      } else {
        setAiError(data.error || 'Failed to generate AI pitch');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error connecting to /api/ai/pitch';
      setAiError(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${activeSubject}\n\n${activeBody}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-lg text-slate-900">
                  B2B Trade Pitch Composer
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Gemini API Powered
                </span>
              </div>
              <p className="text-xs text-slate-500 font-sans">
                Targeting {lead.companyName} • {lead.businessType} ({lead.country})
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

        {/* Mode Selector */}
        <div className="flex border-b border-slate-200 bg-slate-100/70 p-1.5 gap-1 text-xs">
          <button
            onClick={() => {
              setMode('ai');
              if (!aiPitch) handleGenerateAiPitch();
            }}
            className={`flex-1 py-1.5 px-3 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              mode === 'ai'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>AI Cold Outreach Generator (Gemini)</span>
          </button>
          <button
            onClick={() => setMode('template')}
            className={`flex-1 py-1.5 px-3 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              mode === 'template'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Standard Verified Templates</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 font-sans text-xs sm:text-sm">
          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            {mode === 'ai' ? (
              <div>
                <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">
                  AI Pitch Persona / Tone
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as 'direct' | 'formal' | 'exclusive' | 'concise')}
                  className="w-full text-xs rounded-lg border border-slate-300 bg-white p-2 text-slate-800 focus:border-indigo-600 focus:outline-hidden"
                >
                  <option value="direct">Direct Wholesaler (Focus on Unit Economics & Margins)</option>
                  <option value="formal">Distinguished Executive (Corporate Procurement Focus)</option>
                  <option value="exclusive">Exclusive Importer (Regional Distributorship & Volume)</option>
                  <option value="concise">Concise High-Impact (Quick Mobile Read)</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">
                  Outreach Strategy
                </label>
                <select
                  value={template}
                  onChange={(e) => setTemplate(e.target.value as 'wholesale' | 'distributor' | 'pricing')}
                  className="w-full text-xs rounded-lg border border-slate-300 bg-white p-2 text-slate-800 focus:border-indigo-600 focus:outline-hidden"
                >
                  <option value="wholesale">Wholesale & Supply Partnership</option>
                  <option value="distributor">Importer & Distributor Supply Terms</option>
                  <option value="pricing">Direct Source B2B Price Sheet & MOQ</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">
                Target Product / Line
              </label>
              <input
                type="text"
                value={customProduct}
                onChange={(e) => setCustomProduct(e.target.value)}
                placeholder="Product or supply line..."
                className="w-full text-xs rounded-lg border border-slate-300 bg-white p-2 text-slate-800 focus:border-indigo-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">
                Sender Name / Title
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 bg-white p-2 text-slate-800 focus:border-indigo-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">
                Sender Company / Entity
              </label>
              <input
                type="text"
                value={senderCompany}
                onChange={(e) => setSenderCompany(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 bg-white p-2 text-slate-800 focus:border-indigo-600 focus:outline-hidden"
              />
            </div>

            {mode === 'ai' && (
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">
                  Custom Value Proposition / Margin Pitch
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={valueProposition}
                    onChange={(e) => setValueProposition(e.target.value)}
                    placeholder="e.g. 45% retailer margins, guaranteed 14-day international lead times..."
                    className="flex-1 text-xs rounded-lg border border-slate-300 bg-white p-2 text-slate-800 focus:border-indigo-600 focus:outline-hidden"
                  />
                  <button
                    onClick={handleGenerateAiPitch}
                    disabled={isGenerating}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition disabled:opacity-50 cursor-pointer whitespace-nowrap"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>Regenerate AI</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {aiError && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <span className="font-semibold">Notice:</span> {aiError}
            </div>
          )}

          {/* Key Selling Points Badges (If AI mode) */}
          {mode === 'ai' && aiPitch?.keySellingPoints && aiPitch.keySellingPoints.length > 0 && (
            <div>
              <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">
                AI Value Highlights for {lead.companyName}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {aiPitch.keySellingPoints.map((pt, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-indigo-50 text-indigo-800 border border-indigo-200"
                  >
                    <ShieldCheck className="w-3 h-3 text-indigo-600" />
                    <span>{pt}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Subject Line */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Subject Line
            </label>
            <div className="p-2.5 bg-white border border-slate-300 rounded-lg font-medium text-slate-900 text-xs sm:text-sm">
              {activeSubject}
            </div>
          </div>

          {/* Email Body */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Personalized Email Body (Recipient: {lead.businessEmail || 'Purchasing Team'})
            </label>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs text-slate-800 whitespace-pre-line leading-relaxed max-h-60 overflow-y-auto">
              {activeBody}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium transition cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-500" />
                <span>Copy Pitch</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            {onOpenSendEmail && (
              <button
                onClick={() => {
                  onClose();
                  onOpenSendEmail(lead);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Open Send Center (Gmail/Web)</span>
              </button>
            )}

            <a
              href={`mailto:${lead.businessEmail}?subject=${encodeURIComponent(
                activeSubject
              )}&body=${encodeURIComponent(activeBody)}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Mail App</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
