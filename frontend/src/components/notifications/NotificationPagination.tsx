import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface NotificationPaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
}

export const NotificationPagination: React.FC<NotificationPaginationProps> = ({
  page,
  limit,
  total,
  onPageChange
}) => {
  const totalPages = Math.ceil(total / limit);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between pt-4 border-t border-base-300/35 select-none">
      <span className="text-[10px] font-bold text-base-content/40 uppercase">
        Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} items
      </span>
      <div className="join">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="join-item btn btn-xs btn-bordered gap-1 text-[10px] font-extrabold uppercase"
        >
          <ChevronLeft size={10} /> Prev
        </button>
        <button className="join-item btn btn-xs btn-active bg-primary/10 text-primary border-none pointer-events-none text-[10px] font-extrabold">
          Page {page} of {totalPages}
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="join-item btn btn-xs btn-bordered gap-1 text-[10px] font-extrabold uppercase"
        >
          Next <ChevronRight size={10} />
        </button>
      </div>
    </div>
  );
};
export default NotificationPagination;
