import React from 'react';
import { Building2, Globe2, UserCheck, Layers } from 'lucide-react';
import { BuyerLead } from '../types';

interface StatsBarProps {
  leads: BuyerLead[];
  selectedCountry?: string;
  onFilterCountry?: (country: string) => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({ leads }) => {
  const totalLeads = leads.length;
  const uniqueCountries = Array.from(new Set(leads.map((l) => l.country)));
  const uniqueCategories = Array.from(new Set(leads.map((l) => l.category || 'Wholesale Trade')));
  const namedBuyersCount = leads.filter((l) => l.buyerName && l.buyerName !== 'Not Available').length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      
      {/* Metric 1: Total Verified Accounts */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Verified B2B Accounts
          </span>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Building2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold text-slate-900">{totalLeads}</span>
          <span className="text-xs text-slate-500 font-medium">B2B Trade Entities</span>
        </div>
      </div>

      {/* Metric 2: Global Markets */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Key Markets
          </span>
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
            <Globe2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold text-slate-900">
            {uniqueCountries.length}
          </span>
          <span className="text-xs text-slate-500 font-medium">Countries Covered</span>
        </div>
      </div>

      {/* Metric 3: Named Decision Makers */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Executive Buyers
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UserCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold text-slate-900">
            {namedBuyersCount}
          </span>
          <span className="text-xs text-slate-500 font-medium">Named Decision Makers</span>
        </div>
      </div>

      {/* Metric 4: Trade Sectors */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Trade Sectors
          </span>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold text-slate-900">
            {uniqueCategories.length}
          </span>
          <span className="text-xs text-slate-500 font-medium">Commodity & Industry Verticals</span>
        </div>
      </div>

    </div>
  );
};
