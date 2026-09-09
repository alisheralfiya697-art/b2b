import React from 'react';
import { OutreachStatus } from '../types';

interface StatusBadgeProps {
  status: OutreachStatus;
  onChange?: (newStatus: OutreachStatus) => void;
  interactive?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  onChange,
  interactive = false,
}) => {
  const getBadgeStyle = (st: OutreachStatus) => {
    switch (st) {
      case 'Not Contacted':
        return 'bg-stone-100 text-stone-700 border-stone-300';
      case 'Contacted':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'In Discussion':
        return 'bg-sky-100 text-sky-900 border-sky-300';
      case 'Sample Requested':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'Partnership Closed':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'Not a Fit':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-300';
    }
  };

  if (interactive && onChange) {
    return (
      <select
        value={status}
        onChange={(e) => onChange(e.target.value as OutreachStatus)}
        className={`text-xs font-medium px-2 py-1 rounded-full border cursor-pointer focus:outline-hidden ${getBadgeStyle(
          status
        )}`}
      >
        <option value="Not Contacted">Not Contacted</option>
        <option value="Contacted">Contacted</option>
        <option value="In Discussion">In Discussion</option>
        <option value="Sample Requested">Sample Requested</option>
        <option value="Partnership Closed">Partnership Closed</option>
        <option value="Not a Fit">Not a Fit</option>
      </select>
    );
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBadgeStyle(
        status
      )}`}
    >
      {status}
    </span>
  );
};
