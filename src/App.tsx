import React, { useState, useEffect, useMemo } from 'react';
import { BuyerLead, FilterState, OutreachStatus, ViewMode } from './types';
import { INITIAL_LEADS } from './data/initialLeads';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { FiltersBar } from './components/FiltersBar';
import { LeadTable } from './components/LeadTable';
import { LeadCards } from './components/LeadCards';
import { LeadDetailModal } from './components/LeadDetailModal';
import { PitchModal } from './components/PitchModal';
import { BatchOutreachModal } from './components/BatchOutreachModal';
import { AddLeadModal } from './components/AddLeadModal';
import { SendEmailModal } from './components/SendEmailModal';
import { LivePlatformSearchModal } from './components/LivePlatformSearchModal';
import { BuyerPlatformSearchModal } from './components/BuyerPlatformSearchModal';
import { Sparkles, ShieldCheck, MailCheck, RotateCcw, Search, Globe2, ArrowRight, Share2 } from 'lucide-react';

const STORAGE_KEY = 'tradenexus_b2b_leads_v3';

export default function App() {
  // Load initial leads from localStorage with smart sync to ensure newly updated buyer names and usernames appear
  const [leads, setLeads] = useState<BuyerLead[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: BuyerLead[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingMap = new Map(parsed.map((item) => [item.id, item]));
          const merged = INITIAL_LEADS.map((initLead) => {
            const savedItem = existingMap.get(initLead.id);
            if (!savedItem) return initLead;
            return {
              ...initLead,
              ...savedItem,
              username: initLead.username || savedItem.username,
              buyerName:
                initLead.buyerName && initLead.buyerName !== 'Not Available'
                  ? initLead.buyerName
                  : savedItem.buyerName,
              job:
                initLead.job && initLead.job !== 'Wholesale Sales / Purchasing'
                  ? initLead.job
                  : savedItem.job,
            };
          });

          const customLeads = parsed.filter(
            (p) => !INITIAL_LEADS.some((init) => init.id === p.id)
          );

          return [...merged, ...customLeads];
        }
      }
    } catch (e) {
      console.error('Failed to load saved leads', e);
    }
    return INITIAL_LEADS;
  });

  // Sync leads from full-stack backend API
  useEffect(() => {
    fetch('/api/leads')
      .then((res) => {
        const contentType = res.headers.get('content-type') || '';
        if (!res.ok || !contentType.includes('application/json')) throw new Error('API query failed');
        return res.json();
      })
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setLeads(data.data);
        }
      })
      .catch((err) => {
        console.warn('Backend API connection notice, using local cache:', err);
      });
  }, []);

  // Persist leads whenever updated
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
    } catch (e) {
      console.error('Failed to save leads', e);
    }
  }, [leads]);

  // View mode: table or cards
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  // Filters state
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    country: 'all',
    businessType: 'all',
    category: 'all',
    status: 'all',
    onlyNamedBuyers: false,
    onlyStarred: false,
  });

  // Selected lead IDs for bulk operations
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Modals state
  const [detailLead, setDetailLead] = useState<BuyerLead | null>(null);
  const [pitchLead, setPitchLead] = useState<BuyerLead | null>(null);
  const [sendEmailLead, setSendEmailLead] = useState<BuyerLead | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isLiveSearchModalOpen, setIsLiveSearchModalOpen] = useState(false);
  const [isBuyerPlatformSearchOpen, setIsBuyerPlatformSearchOpen] = useState(false);
  const [platformSearchLeadId, setPlatformSearchLeadId] = useState<number | null>(null);

  const handleOpenBuyerPlatformSearch = (leadId?: number) => {
    if (leadId) {
      setPlatformSearchLeadId(leadId);
    } else if (leads.length > 0) {
      setPlatformSearchLeadId(leads[0].id);
    }
    setIsBuyerPlatformSearchOpen(true);
  };

  // Extracted unique countries and business types for filters
  const allCountries = useMemo(() => {
    const set = new Set(leads.map((l) => l.country));
    return Array.from(set).sort();
  }, [leads]);

  const allBusinessTypes = useMemo(() => {
    const set = new Set(leads.map((l) => l.businessType));
    return Array.from(set).sort();
  }, [leads]);

  const allCategories = useMemo(() => {
    const set = new Set(leads.map((l) => l.category || 'General Wholesale'));
    return Array.from(set).sort();
  }, [leads]);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Search query
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase().trim();
        const matches =
          lead.companyName.toLowerCase().includes(q) ||
          lead.buyerName.toLowerCase().includes(q) ||
          lead.businessEmail.toLowerCase().includes(q) ||
          lead.country.toLowerCase().includes(q) ||
          lead.product.toLowerCase().includes(q) ||
          lead.businessType.toLowerCase().includes(q) ||
          (lead.category && lead.category.toLowerCase().includes(q)) ||
          lead.buyerEvidence.toLowerCase().includes(q) ||
          lead.notes.toLowerCase().includes(q) ||
          (lead.tags && lead.tags.some((t) => t.toLowerCase().includes(q)));
        if (!matches) return false;
      }

      // Country
      if (filters.country !== 'all' && lead.country !== filters.country) {
        return false;
      }

      // Business Type / Role Filter
      if (filters.businessType !== 'all') {
        const roleQuery = filters.businessType.toLowerCase();
        const leadType = lead.businessType.toLowerCase();
        const leadTags = (lead.tags || []).map((t) => t.toLowerCase());
        const matchesRole =
          leadType.includes(roleQuery) || leadTags.some((t) => t.includes(roleQuery));
        if (!matchesRole) return false;
      }

      // Industry / Category Filter
      if (filters.category && filters.category !== 'all') {
        if (lead.category !== filters.category) {
          return false;
        }
      }

      // Status
      if (filters.status !== 'all' && lead.status !== filters.status) {
        return false;
      }

      // Only Named Buyers
      if (filters.onlyNamedBuyers) {
        if (!lead.buyerName || lead.buyerName === 'Not Available') {
          return false;
        }
      }

      // Only Starred
      if (filters.onlyStarred && !lead.isStarred) {
        return false;
      }

      return true;
    });
  }, [leads, filters]);

  // Selection handlers
  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredLeads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredLeads.map((l) => l.id));
    }
  };

  // Toggle star
  const handleToggleStar = (id: number) => {
    const targetLead = leads.find((l) => l.id === id);
    if (!targetLead) return;
    const newStarred = !targetLead.isStarred;

    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, isStarred: newStarred } : l))
    );

    fetch(`/api/leads/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isStarred: newStarred }),
    }).catch((e) => console.warn('API update notice:', e));
  };

  // Status change handler
  const handleStatusChange = (id: number, newStatus: OutreachStatus) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
    );

    fetch(`/api/leads/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    }).catch((e) => console.warn('API update notice:', e));
  };

  // Update lead
  const handleUpdateLead = (updated: BuyerLead) => {
    setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    setDetailLead(updated);

    fetch(`/api/leads/${updated.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    }).catch((e) => console.warn('API update notice:', e));
  };

  // Add new lead
  const handleAddLead = async (newLeadData: Omit<BuyerLead, 'id'>) => {
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLeadData),
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const json = await res.json();
        if (json.success && json.data) {
          setLeads((prev) => [json.data, ...prev]);
          return;
        }
      }
    } catch (e) {
      console.warn('API lead creation notice, using local assignment:', e);
    }

    const nextId = leads.length > 0 ? Math.max(...leads.map((l) => l.id)) + 1 : 1;
    const newLead: BuyerLead = {
      ...newLeadData,
      id: nextId,
    };
    setLeads((prev) => [newLead, ...prev]);
  };

  // Add multiple leads
  const handleAddMultipleLeads = async (newLeadsData: Omit<BuyerLead, 'id'>[]) => {
    if (!newLeadsData || newLeadsData.length === 0) return;
    const startId = leads.length > 0 ? Math.max(...leads.map((l) => l.id)) + 1 : 1;
    const newLeadsWithIds: BuyerLead[] = newLeadsData.map((data, idx) => ({
      ...data,
      id: startId + idx,
    }));
    setLeads((prev) => [...newLeadsWithIds, ...prev]);

    for (const lead of newLeadsData) {
      try {
        await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lead),
        });
      } catch (e) {
        console.warn('API multiple leads creation notice:', e);
      }
    }
  };

  // Bulk status update
  const handleBulkStatusChange = (status: OutreachStatus) => {
    setLeads((prev) =>
      prev.map((l) => (selectedIds.includes(l.id) ? { ...l, status } : l))
    );

    // Sync each selected lead to backend
    selectedIds.forEach((id) => {
      fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      }).catch((e) => console.warn('API bulk update notice:', e));
    });
  };

  // Reset to original data
  const handleResetData = async () => {
    if (window.confirm('Reset directory back to default verified buyers?')) {
      try {
        await fetch('/api/leads/reset', { method: 'POST' });
      } catch (e) {
        console.warn('API reset notice:', e);
      }
      setLeads(INITIAL_LEADS);
      setSelectedIds([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // Clear filters
  const handleClearFilters = () => {
    setFilters({
      searchQuery: '',
      country: 'all',
      businessType: 'all',
      category: 'all',
      status: 'all',
      onlyNamedBuyers: false,
      onlyStarred: false,
    });
  };

  const selectedLeads = leads.filter((l) => selectedIds.includes(l.id));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Sticky Top Navigation */}
      <Header
        leads={leads}
        selectedCount={selectedIds.length}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenBatchModal={() => setIsBatchModalOpen(false || true)}
        onOpenLiveSearchModal={() => setIsLiveSearchModalOpen(true)}
        onOpenBuyerPlatformSearch={() => handleOpenBuyerPlatformSearch()}
        onResetData={handleResetData}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1">
        {/* Banner with Overview Context */}
        <div className="mb-4 bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-800 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 mb-2.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Multi-Sector Commercial Directory • Verified Trade Proof</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Global B2B Importers, Wholesalers & Distributors
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed font-sans">
              Connecting verified international importers, bulk wholesalers, retail chains, and distributors across agricultural produce, cosmetics, textiles, home lifestyle, and specialized artisanal trade.
            </p>
          </div>
        </div>

        {/* Buyer Cross-Platform Search Hub (Google • LinkedIn • Facebook) */}
        <div className="mb-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-indigo-500/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
              <Search className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm sm:text-base text-white">
                  Buyer Search Platform: Google • LinkedIn • Facebook Hub
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  {leads.length} Verified Buyers
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 max-w-3xl leading-relaxed">
                Directly open official websites, corporate emails, social usernames (@handles), LinkedIn company & buyer profiles, and Facebook business pages for all buyers in this list.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              id="open-buyer-platform-search-btn"
              onClick={() => handleOpenBuyerPlatformSearch()}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Open Search Platform</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </button>
            <button
              id="open-live-search-banner-btn"
              onClick={() => setIsLiveSearchModalOpen(true)}
              className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
              title="Search external web for new leads"
            >
              <Globe2 className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">Discover New</span>
            </button>
          </div>
        </div>

        {/* High-Level Stats Bar */}
        <StatsBar
          leads={leads}
          selectedCountry={filters.country}
          onFilterCountry={(c) => setFilters((prev) => ({ ...prev, country: c }))}
        />

        {/* Filter Toolbar */}
        <FiltersBar
          filters={filters}
          setFilters={setFilters}
          viewMode={viewMode}
          setViewMode={setViewMode}
          countries={allCountries}
          businessTypes={allBusinessTypes}
          categories={allCategories}
          totalResults={filteredLeads.length}
          onClearFilters={handleClearFilters}
        />

        {/* Lead Content Area */}
        {filteredLeads.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">No B2B trade leads found</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
              No matching records found for your current search criteria or active filters.
            </p>
            <button
              onClick={handleClearFilters}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : viewMode === 'table' ? (
          <LeadTable
            leads={filteredLeads}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onSelectAll={handleSelectAll}
            onToggleStar={handleToggleStar}
            onStatusChange={handleStatusChange}
            onSelectLead={(l) => setDetailLead(l)}
            onOpenPitch={(l) => setPitchLead(l)}
            onOpenSendEmail={(l) => setSendEmailLead(l)}
            onOpenPlatformSearch={(l) => handleOpenBuyerPlatformSearch(l.id)}
          />
        ) : (
          <LeadCards
            leads={filteredLeads}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onToggleStar={handleToggleStar}
            onStatusChange={handleStatusChange}
            onSelectLead={(l) => setDetailLead(l)}
            onOpenPitch={(l) => setPitchLead(l)}
            onOpenSendEmail={(l) => setSendEmailLead(l)}
            onOpenPlatformSearch={(l) => handleOpenBuyerPlatformSearch(l.id)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 text-sm">TradeNexus B2B</span>
            <span>•</span>
            <span>Verified Importer, Wholesaler, Retailer & Distributor Directory</span>
          </div>
          <p className="text-slate-400">
            Source references verified from official company trade registries, wholesale portals, and supply directories.
          </p>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <LeadDetailModal
        lead={detailLead}
        onClose={() => setDetailLead(null)}
        onUpdateLead={handleUpdateLead}
        onOpenSendEmail={(l) => setSendEmailLead(l)}
        onOpenPlatformSearch={(l) => handleOpenBuyerPlatformSearch(l.id)}
      />

      <PitchModal
        lead={pitchLead}
        onClose={() => setPitchLead(null)}
        onOpenSendEmail={(l) => setSendEmailLead(l)}
      />

      <SendEmailModal
        isOpen={!!sendEmailLead}
        lead={sendEmailLead}
        onClose={() => setSendEmailLead(null)}
        onStatusChange={handleStatusChange}
        onUpdateLead={handleUpdateLead}
      />

      <BatchOutreachModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        selectedLeads={selectedLeads}
        onBulkStatusChange={handleBulkStatusChange}
      />

      <AddLeadModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddLead={handleAddLead}
      />

      <LivePlatformSearchModal
        isOpen={isLiveSearchModalOpen}
        onClose={() => setIsLiveSearchModalOpen(false)}
        onAddLeadToDirectory={handleAddLead}
        onAddMultipleLeadsToDirectory={handleAddMultipleLeads}
      />

      <BuyerPlatformSearchModal
        isOpen={isBuyerPlatformSearchOpen}
        onClose={() => setIsBuyerPlatformSearchOpen(false)}
        leads={leads}
        initialLeadId={platformSearchLeadId}
        onUpdateLead={handleUpdateLead}
      />
    </div>
  );
}
