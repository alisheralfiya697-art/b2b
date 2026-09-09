import React, { useState } from 'react';
import { X, Copy, Check, Download, Mail, CheckCircle2 } from 'lucide-react';
import { BuyerLead, OutreachStatus } from '../types';
import { exportLeadsToCSV } from '../utils/csvHelper';
import { getCountryFlag } from '../utils/countryHelper';

interface BatchOutreachModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLeads: BuyerLead[];
  onBulkStatusChange: (status: OutreachStatus) => void;
}

export const BatchOutreachModal: React.FC<BatchOutreachModalProps> = ({
  isOpen,
  onClose,
  selectedLeads,
  onBulkStatusChange,
}) => {
  if (!isOpen) return null;

  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<OutreachStatus>('Contacted');
  const [statusUpdated, setStatusUpdated] = useState(false);

  const commaSeparatedEmails = selectedLeads.map((l) => l.businessEmail).join(', ');
  const leadRoster = selectedLeads
    .map((l) => `${l.companyName} [${l.businessType}] (${l.buyerName !== 'Not Available' ? l.buyerName : 'Procurement'}): ${l.businessEmail}`)
    .join('\n');

  const handleCopy = (text: string, formatName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(formatName);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const handleApplyStatus = () => {
    onBulkStatusChange(selectedStatus);
    setStatusUpdated(true);
    setTimeout(() => setStatusUpdated(false), 2000);
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
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-slate-900">
                Batch Outreach Hub
              </h2>
              <p className="text-xs text-slate-500 font-sans">
                {selectedLeads.length} verified trade leads selected for outreach
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
          
          {/* Selected Leads Chips */}
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Selected Recipients ({selectedLeads.length})
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              {selectedLeads.map((lead) => (
                <span
                  key={lead.id}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-white text-slate-700 border border-slate-200 shadow-xs"
                >
                  <span>{getCountryFlag(lead.country)}</span>
                  <span>{lead.companyName}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Quick Copy Formats */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Copy Email Address Formats
            </span>

            {/* Comma-separated (BCC) */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="font-semibold text-xs text-slate-900 block">Comma-separated (For BCC in Gmail/Outlook)</span>
                <p className="text-xs text-slate-500 truncate font-mono mt-0.5">{commaSeparatedEmails}</p>
              </div>
              <button
                onClick={() => handleCopy(commaSeparatedEmails, 'comma')}
                className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-xs font-medium text-slate-700 transition cursor-pointer shadow-xs"
              >
                {copiedFormat === 'comma' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy BCC</span>
                  </>
                )}
              </button>
            </div>

            {/* Roster with Names */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="font-semibold text-xs text-slate-900 block">Lead Roster (Company + Role + Email)</span>
                <p className="text-xs text-slate-500 truncate font-mono mt-0.5">
                  {selectedLeads[0]?.companyName} [{selectedLeads[0]?.businessType}] ({selectedLeads[0]?.businessEmail})...
                </p>
              </div>
              <button
                onClick={() => handleCopy(leadRoster, 'roster')}
                className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-xs font-medium text-slate-700 transition cursor-pointer shadow-xs"
              >
                {copiedFormat === 'roster' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy Roster</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Bulk Update Status */}
          <div className="pt-2 border-t border-slate-200">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Bulk Status Update
            </span>
            <div className="flex items-center gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as OutreachStatus)}
                className="text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-700 focus:outline-hidden cursor-pointer flex-1"
              >
                <option value="Not Contacted">Not Contacted</option>
                <option value="Contacted">Contacted</option>
                <option value="In Discussion">In Discussion</option>
                <option value="Sample Requested">Sample Requested</option>
                <option value="Partnership Closed">Partnership Closed</option>
                <option value="Not a Fit">Not a Fit</option>
              </select>
              <button
                onClick={handleApplyStatus}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition cursor-pointer"
              >
                {statusUpdated ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Updated!</span>
                  </>
                ) : (
                  <span>Update All {selectedLeads.length}</span>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => exportLeadsToCSV(selectedLeads, 'selected-b2b-trade-leads.csv')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-medium transition cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Selected ({selectedLeads.length})</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
