import React from 'react';
import { Filter, X } from 'lucide-react';

interface FilterState {
  q: string;
  status: string;
  department_id: string;
  category_id: string;
  condition: string;
  minCost: string;
  maxCost: string;
}

interface AssetFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onReset: () => void;
}

export const AssetFilters: React.FC<AssetFiltersProps> = ({ filters, onFilterChange, onReset }) => {
  // Seeded list of categories for filter select options
  const mockCategories = [
    { id: 'c1000000-0000-0000-0000-000000000001', name: 'Computing Hardware' },
    { id: 'c1000000-0000-0000-0000-000000000002', name: 'Mobile Devices' },
    { id: 'c1000000-0000-0000-0000-000000000003', name: 'AV Equipment' },
    { id: 'c1000000-0000-0000-0000-000000000004', name: 'Office Furniture' },
    { id: 'c1000000-0000-0000-0000-000000000005', name: 'Company Vehicles' }
  ];

  // Seeded list of departments for filter options
  const mockDepartments = [
    { id: 'd1000000-0000-0000-0000-000000000001', name: 'Information Technology' },
    { id: 'd1000000-0000-0000-0000-000000000002', name: 'Human Resources' },
    { id: 'd1000000-0000-0000-0000-000000000003', name: 'Finance' }
  ];

  return (
    <div className="card bg-base-100/40 backdrop-blur-md border border-base-300/50 shadow-sm rounded-2xl p-5 space-y-4 animate-fade-in">
      <div className="flex justify-between items-center pb-2 border-b border-base-300/30">
        <h3 className="text-xs font-bold text-base-content/80 flex items-center gap-1.5">
          <Filter size={14} className="text-primary" />
          Advanced Filters
        </h3>
        <button
          onClick={onReset}
          className="btn btn-ghost btn-xs text-xs font-bold text-base-content/50 hover:text-error flex items-center gap-1 normal-case px-2"
        >
          <X size={12} />
          Reset All
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="form-control">
          <label className="label text-[10px] font-semibold text-base-content/50 p-1">Search Keywords</label>
          <input
            type="text"
            placeholder="Name, Serial, Tag..."
            value={filters.q}
            onChange={(e) => onFilterChange({ q: e.target.value })}
            className="input input-xs input-bordered text-xs rounded-lg w-full"
          />
        </div>

        <div className="form-control">
          <label className="label text-[10px] font-semibold text-base-content/50 p-1">Status</label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ status: e.target.value })}
            className="select select-xs select-bordered text-xs rounded-lg w-full font-medium"
          >
            <option value="">All Statuses</option>
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="ALLOCATED">ALLOCATED</option>
            <option value="RESERVED">RESERVED</option>
            <option value="UNDER_MAINTENANCE">UNDER MAINTENANCE</option>
            <option value="RETIRED">RETIRED</option>
            <option value="DISPOSED">DISPOSED</option>
          </select>
        </div>

        <div className="form-control">
          <label className="label text-[10px] font-semibold text-base-content/50 p-1">Department</label>
          <select
            value={filters.department_id}
            onChange={(e) => onFilterChange({ department_id: e.target.value })}
            className="select select-xs select-bordered text-xs rounded-lg w-full font-medium"
          >
            <option value="">All Departments</option>
            {mockDepartments.map((dept) => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
        </div>

        <div className="form-control">
          <label className="label text-[10px] font-semibold text-base-content/50 p-1">Category</label>
          <select
            value={filters.category_id}
            onChange={(e) => onFilterChange({ category_id: e.target.value })}
            className="select select-xs select-bordered text-xs rounded-lg w-full font-medium"
          >
            <option value="">All Categories</option>
            {mockCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="form-control">
          <label className="label text-[10px] font-semibold text-base-content/50 p-1">Condition</label>
          <select
            value={filters.condition}
            onChange={(e) => onFilterChange({ condition: e.target.value })}
            className="select select-xs select-bordered text-xs rounded-lg w-full font-medium"
          >
            <option value="">All Conditions</option>
            <option value="EXCELLENT">EXCELLENT</option>
            <option value="GOOD">GOOD</option>
            <option value="FAIR">FAIR</option>
            <option value="POOR">POOR</option>
            <option value="DAMAGED">DAMAGED</option>
          </select>
        </div>

        <div className="form-control">
          <label className="label text-[10px] font-semibold text-base-content/50 p-1">Min Cost ($)</label>
          <input
            type="number"
            placeholder="0"
            value={filters.minCost}
            onChange={(e) => onFilterChange({ minCost: e.target.value })}
            className="input input-xs input-bordered text-xs rounded-lg w-full"
          />
        </div>

        <div className="form-control">
          <label className="label text-[10px] font-semibold text-base-content/50 p-1">Max Cost ($)</label>
          <input
            type="number"
            placeholder="10000"
            value={filters.maxCost}
            onChange={(e) => onFilterChange({ maxCost: e.target.value })}
            className="input input-xs input-bordered text-xs rounded-lg w-full"
          />
        </div>
      </div>
    </div>
  );
};
export default AssetFilters;
