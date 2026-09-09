import React from 'react';
import { Download, Plus, MailCheck, RefreshCw, Globe2, Search } from 'lucide-react';
import { BuyerLead } from '../types';
import { exportLeadsToCSV } from '../utils/csvHelper';

interface HeaderProps {
  leads: BuyerLead[];
  selectedCount: number;
  onOpenAddModal: () => void;
  onOpenBatchModal: () => void;
  onOpenLiveSearchModal: () => void;
  onOpenBuyerPlatformSearch: () => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  leads,
  selectedCount,
  onOpenAddModal,
  onOpenBatchModal,
  onOpenLiveSearchModal,
  onOpenBuyerPlatformSearch,
  onResetData,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Identity */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              <Globe2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-bold text-xl sm:text-2xl text-slate-900 tracking-tight">
                  TradeNexus B2B
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Global Trade Network
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Verified Directory
                </span>
              </div>
              <p className="text-xs text-slate-500 font-sans mt-0.5">
                Importers, Wholesalers, Retailers, Buyers & Distributors Directory
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-2.5">
            {selectedCount > 0 && (
              <button
                id="batch-outreach-btn"
                onClick={onOpenBatchModal}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-semibold transition shadow-xs cursor-pointer"
              >
                <MailCheck className="w-4 h-4 text-white" />
                <span>Outreach Selected ({selectedCount})</span>
              </button>
            )}

            {/* Buyer Multi-Platform Search Platform Button */}
            <button
              id="buyer-platform-search-btn"
              onClick={onOpenBuyerPlatformSearch}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              title="Open Google, LinkedIn & Facebook search platform for all directory buyers"
            >
              <Search className="w-4 h-4 text-indigo-200" />
              <span>Buyer Search Platform (Google • LI • FB)</span>
            </button>

            {/* Live Platform Search Button */}
            <button
              id="live-platform-search-btn"
              onClick={onOpenLiveSearchModal}
              className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
              title="Search external APIs to discover new B2B trade leads"
            >
              <Globe2 className="w-3.5 h-3.5 text-slate-600" />
              <span>Discover New Leads</span>
            </button>

            <button
              id="export-csv-btn"
              onClick={() => exportLeadsToCSV(leads)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 text-xs font-medium transition cursor-pointer"
              title="Download directory as CSV"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export CSV</span>
            </button>

            <button
              id="add-lead-btn"
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add B2B Lead</span>
            </button>

            <button
              id="reset-data-btn"
              onClick={onResetData}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              title="Reset to default verified leads"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
