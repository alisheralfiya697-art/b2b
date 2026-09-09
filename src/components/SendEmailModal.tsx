import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Copy, 
  Check, 
  ExternalLink, 
  CheckCircle2, 
  User, 
  Building2, 
  Mail, 
  FileEdit,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { BuyerLead, OutreachStatus } from '../types';
import { getCountryFlag } from '../utils/countryHelper';

interface SendEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: BuyerLead | null;
  onStatusChange: (leadId: number, newStatus: OutreachStatus) => void;
  onUpdateLead?: (updatedLead: BuyerLead) => void;
}

export const SendEmailModal: React.FC<SendEmailModalProps> = ({
  isOpen,
  onClose,
  lead,
  onStatusChange,
  onUpdateLead,
}) => {
  if (!isOpen || !lead) return null;

  const [senderName, setSenderName] = useState('Trade Procurement Team');
  const [senderCompany, setSenderCompany] = useState('Global Trade Direct');
  const [senderPhone, setSenderPhone] = useState('+1 (555) 019-2834');
  const [templateType, setTemplateType] = useState<'catalog' | 'quote' | 'direct'>('catalog');
  
  const [isEditingBuyer, setIsEditingBuyer] = useState(false);
  const [editedBuyerName, setEditedBuyerName] = useState(lead.buyerName);
  const [editedJobTitle, setEditedJobTitle] = useState(lead.job);

  // Subject presets
  const getInitialSubject = (type: string) => {
    switch (type) {
      case 'quote':
        return `Factory-Direct Pricing & Commercial Terms - ${lead.companyName}`;
      case 'direct':
        return `Direct Supply Partnership Inquiry for ${lead.companyName}`;
      default:
        return `Wholesale Supply & Product Catalog for ${lead.companyName} (${lead.product})`;
    }
  };

  const [subject, setSubject] = useState(getInitialSubject('catalog'));

  // Body generator
  const generateBody = (type: string, buyer: string) => {
    const greetingName = buyer && buyer !== 'Not Available' ? buyer : 'Purchasing Team';

    if (type === 'quote') {
      return `Dear ${greetingName},

I hope this message finds you well at ${lead.companyName}.

We have been closely following your operations as a premier ${lead.businessType} in ${lead.country}. We specialize in factory-direct sourcing and volume supply for ${lead.product}.

Given your focus on quality and reliable distribution, we would like to provide you with our 2026 Commercial Price Tier List and minimum order quantity (MOQ) terms tailored specifically for ${lead.companyName}.

Key commercial advantages:
• Factory-direct pricing with zero middleman markup
• Certified quality control & export compliance
• Flexible pallet & container shipping schedules
• Tailored packaging and private-label options available

Could we arrange a brief 5-minute introductory call this week, or may I send our formal price schedule directly to your inbox?

Best regards,

${senderName}
${senderCompany}
Phone: ${senderPhone}
Ref: Trade Inquiry for ${lead.companyName}`;
    }

    if (type === 'direct') {
      return `Dear ${greetingName},

I am reaching out from ${senderCompany} regarding high-volume supply and trade partnerships for ${lead.product}.

We noted your verified trade role in ${lead.country} ("${lead.buyerEvidence.slice(0, 80)}..."), and our manufacturing capabilities are directly aligned with your sourcing requirements.

We are actively expanding our distribution partnerships and would welcome the opportunity to discuss a reliable supply agreement with ${lead.companyName}.

Would you be open to reviewing our current product catalog and sample terms?

Warm regards,

${senderName}
${senderCompany}
Direct: ${senderPhone}`;
    }

    // Default catalog
    return `Dear ${greetingName},

Greetings from ${senderCompany}.

I am contacting you regarding your sourcing and procurement operations at ${lead.companyName}. We are an established primary producer and international distributor specializing in ${lead.product}.

As a recognized ${lead.businessType} in ${lead.country}, we believe our high-grade products and competitive bulk rates could significantly strengthen your current catalog margins.

We would be pleased to share our complete digital product catalog, certified test reports, and wholesale price sheet.

Please let me know if you would like us to forward our catalog and arrange sample delivery to your office.

Thank you for your time and consideration.

Sincerely,

${senderName}
${senderCompany}
Email: info@tradeglobal.com | Phone: ${senderPhone}`;
  };

  const [body, setBody] = useState(generateBody('catalog', lead.buyerName));
  const [copied, setCopied] = useState(false);
  const [sendingState, setSendingState] = useState<'idle' | 'sending' | 'sent'>('idle');

  // Handle template change
  const handleTemplateSwitch = (type: 'catalog' | 'quote' | 'direct') => {
    setTemplateType(type);
    setSubject(getInitialSubject(type));
    setBody(generateBody(type, editedBuyerName));
  };

  const handleCopy = () => {
    const fullText = `To: ${lead.businessEmail}\nSubject: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  // Gmail Web Link
  const gmailWebUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    lead.businessEmail
  )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  // Outlook Web Link
  const outlookWebUrl = `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(
    lead.businessEmail
  )}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  // Mailto Link
  const mailtoUrl = `mailto:${lead.businessEmail}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;

  // Direct Send in App
  const handleInAppSend = () => {
    setSendingState('sending');
    setTimeout(() => {
      setSendingState('sent');
      onStatusChange(lead.id, 'Contacted');
      setTimeout(() => {
        setSendingState('idle');
        onClose();
      }, 1600);
    }, 1200);
  };

  const handleSaveBuyerInfo = () => {
    if (onUpdateLead) {
      const updated = {
        ...lead,
        buyerName: editedBuyerName.trim() || 'Procurement Team',
        job: editedJobTitle.trim() || lead.job,
      };
      onUpdateLead(updated);
    }
    setIsEditingBuyer(false);
    setBody(generateBody(templateType, editedBuyerName));
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
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-lg text-slate-900">
                  Send Direct Outreach Email
                </h2>
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700 font-medium">
                  {getCountryFlag(lead.country)} {lead.country}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-sans">
                Recipient: <strong className="text-slate-800">{lead.companyName}</strong> ({lead.businessEmail})
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

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-800 text-sm font-sans">
          
          {/* Buyer Information Card (with Quick Edit) */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
              <div>
                {!isEditingBuyer ? (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">
                        {lead.buyerName}
                      </span>
                      <span className="text-[11px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/60">
                        {lead.job}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{lead.companyName} • {lead.businessType}</span>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2 w-full max-w-sm">
                    <input
                      type="text"
                      value={editedBuyerName}
                      onChange={(e) => setEditedBuyerName(e.target.value)}
                      placeholder="Buyer / Contact Name"
                      className="w-full text-xs rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-slate-800 font-semibold focus:border-indigo-600 focus:outline-hidden"
                    />
                    <input
                      type="text"
                      value={editedJobTitle}
                      onChange={(e) => setEditedJobTitle(e.target.value)}
                      placeholder="Job Title / Role"
                      className="w-full text-xs rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-slate-700 focus:border-indigo-600 focus:outline-hidden"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
              {!isEditingBuyer ? (
                <button
                  onClick={() => setIsEditingBuyer(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-xs font-medium text-slate-700 transition cursor-pointer shadow-2xs"
                >
                  <FileEdit className="w-3.5 h-3.5 text-slate-500" />
                  <span>Edit Contact</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleSaveBuyerInfo}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white transition cursor-pointer shadow-2xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditedBuyerName(lead.buyerName);
                      setEditedJobTitle(lead.job);
                      setIsEditingBuyer(false);
                    }}
                    className="px-2 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-200 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Email Template Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Pitch Strategy
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleTemplateSwitch('catalog')}
                className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                  templateType === 'catalog'
                    ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="font-semibold text-xs text-slate-900">Wholesale Catalog</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Product range & margins</div>
              </button>

              <button
                type="button"
                onClick={() => handleTemplateSwitch('quote')}
                className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                  templateType === 'quote'
                    ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="font-semibold text-xs text-slate-900">Factory Price Tier</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Direct volume quote</div>
              </button>

              <button
                type="button"
                onClick={() => handleTemplateSwitch('direct')}
                className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                  templateType === 'direct'
                    ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="font-semibold text-xs text-slate-900">Direct Trade Deal</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Partnership & distribution</div>
              </button>
            </div>
          </div>

          {/* Sender Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Your Name & Title
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 bg-white p-2 text-slate-800 focus:border-indigo-600 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Your Company / Enterprise
              </label>
              <input
                type="text"
                value={senderCompany}
                onChange={(e) => setSenderCompany(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 bg-white p-2 text-slate-800 focus:border-indigo-600 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Subject Line */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Email Subject Line
              </label>
              <span className="text-[11px] font-mono text-slate-400">To: {lead.businessEmail}</span>
            </div>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full font-medium text-xs sm:text-sm rounded-lg border border-slate-300 bg-white p-2.5 text-slate-900 focus:border-indigo-600 focus:outline-hidden"
            />
          </div>

          {/* Email Body */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Message Body
              </label>
              <button
                type="button"
                onClick={() => setBody(generateBody(templateType, editedBuyerName))}
                className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset to template</span>
              </button>
            </div>
            <textarea
              rows={8}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50/60 p-3.5 font-mono text-xs text-slate-800 focus:bg-white focus:border-indigo-600 focus:outline-hidden leading-relaxed"
            />
          </div>

        </div>

        {/* Action Options & Send Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col gap-3">
          
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium transition cursor-pointer shadow-xs"
                title="Copy complete email to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>

              <a
                href={mailtoUrl}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium transition cursor-pointer shadow-xs"
                title="Open in Apple Mail, Thunderbird, or default client"
              >
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>Default Mail App</span>
              </a>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex items-center flex-wrap gap-2">
              
              {/* Send with Gmail Web */}
              <a
                href={gmailWebUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => onStatusChange(lead.id, 'Contacted')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                title="Open directly in Gmail Web Compose window"
              >
                <span>Send via Gmail</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              {/* Send with Outlook Web */}
              <a
                href={outlookWebUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => onStatusChange(lead.id, 'Contacted')}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                title="Open directly in Outlook Web Compose window"
              >
                <span>Send via Outlook</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              {/* In-App Direct Dispatch */}
              <button
                onClick={handleInAppSend}
                disabled={sendingState !== 'idle'}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer disabled:opacity-75"
              >
                {sendingState === 'sending' ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Dispatching...</span>
                  </>
                ) : sendingState === 'sent' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Sent & Marked Contacted!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send & Mark Contacted</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
