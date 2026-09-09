import React from 'react';
import { Search, X, LayoutGrid, Table, Star, User, Filter, Building, Tag } from 'lucide-react';
import { FilterState, ViewMode } from '../types';

interface FiltersBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  countries: string[];
  businessTypes: string[];
  categories: string[];
  totalResults: number;
  onClearFilters: () => void;
}

const PRIMARY_ROLES = [
  { id: 'all', label: 'All Roles' },
  { id: 'importer', label: 'Importers' },
  { id: 'wholesaler', label: 'Wholesalers' },
  { id: 'retailer', label: 'Retailers' },
  { id: 'buyer', label: 'Buyers' },
  { id: 'distributor', label: 'Distributors' },
];

export const FiltersBar: React.FC<FiltersBarProps> = ({
  filters,
  setFilters,
  viewMode,
  setViewMode,
  countries,
  businessTypes,
  categories,
  totalResults,
  onClearFilters,
}) => {
  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.country !== 'all' ||
    filters.businessType !== 'all' ||
    filters.category !== 'all' ||
    filters.status !== 'all' ||
    filters.onlyNamedBuyers ||
    filters.onlyStarred;

  const currentRole = filters.businessType.toLowerCase();

  const handleSelectRole = (roleId: string) => {
    if (roleId === 'all') {
      setFilters((prev) => ({ ...prev, businessType: 'all' }));
    } else {
      setFilters((prev) => ({ ...prev, businessType: roleId }));
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-xs space-y-3.5">
      
      {/* Top row: Role Navigation Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1.5 shrink-0 flex items-center gap-1">
          <Building className="w-3.5 h-3.5 text-slate-400" />
          Trade Role:
        </span>
        {PRIMARY_ROLES.map((role) => {
          const isActive =
            (role.id === 'all' && (filters.businessType === 'all' || !filters.businessType)) ||
            (role.id !== 'all' && currentRole.includes(role.id));

          return (
            <button
              key={role.id}
              onClick={() => handleSelectRole(role.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer border ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {role.label}
            </button>
          );
        })}
      </div>

      {/* Middle row: Search & View Mode */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
        
        {/* Search Field */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="lead-search-input"
            type="text"
            value={filters.searchQuery}
            onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
            placeholder="Search company, buyer name, product (tomatoes, singing bowls, fabrics, etc.), email or country..."
            className="w-full pl-10 pr-9 py-2 rounded-lg border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 text-sm text-slate-900 placeholder:text-slate-400 outline-hidden transition bg-slate-50/60"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* View Mode Toggle & Result Count */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-900">{totalResults}</strong> records
          </span>

          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100">
            <button
              id="view-table-btn"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table View"
            >
              <Table className="w-4 h-4" />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              id="view-cards-btn"
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Cards</span>
            </button>
          </div>
        </div>

      </div>

      {/* Bottom row: Filter selectors */}
      <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100">
        
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mr-1">
          <Filter className="w-3.5 h-3.5" />
          <span>Filters:</span>
        </div>

        {/* Industry / Category Filter */}
        <select
          id="category-filter"
          value={filters.category}
          onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
          className="text-xs rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-700 focus:border-indigo-600 focus:outline-hidden cursor-pointer"
        >
          <option value="all">All Industries & Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Country Filter */}
        <select
          id="country-filter"
          value={filters.country}
          onChange={(e) => setFilters((prev) => ({ ...prev, country: e.target.value }))}
          className="text-xs rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-700 focus:border-indigo-600 focus:outline-hidden cursor-pointer"
        >
          <option value="all">All Countries</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          id="status-filter"
          value={filters.status}
          onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
          className="text-xs rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-700 focus:border-indigo-600 focus:outline-hidden cursor-pointer"
        >
          <option value="all">All Outreach Statuses</option>
          <option value="Not Contacted">Not Contacted</option>
          <option value="Contacted">Contacted</option>
          <option value="In Discussion">In Discussion</option>
          <option value="Sample Requested">Sample Requested</option>
          <option value="Partnership Closed">Partnership Closed</option>
          <option value="Not a Fit">Not a Fit</option>
        </select>

        {/* Named Buyer toggle */}
        <button
          onClick={() => setFilters((prev) => ({ ...prev, onlyNamedBuyers: !prev.onlyNamedBuyers }))}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer border ${
            filters.onlyNamedBuyers
              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Named Buyers</span>
        </button>

        {/* Starred toggle */}
        <button
          onClick={() => setFilters((prev) => ({ ...prev, onlyStarred: !prev.onlyStarred }))}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer border ${
            filters.onlyStarred
              ? 'bg-amber-50 text-amber-900 border-amber-300'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Star className={`w-3.5 h-3.5 ${filters.onlyStarred ? 'fill-amber-400 text-amber-500' : ''}`} />
          <span>Starred</span>
        </button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium underline underline-offset-2 ml-auto cursor-pointer"
          >
            Reset Filters
          </button>
        )}

      </div>

    </div>
  );
};
