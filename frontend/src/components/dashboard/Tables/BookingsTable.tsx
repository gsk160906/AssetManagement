import React from 'react';
import { CalendarRange, ChevronLeft, ChevronRight } from 'lucide-react';

interface Booking {
  id: string;
  assetName: string;
  employeeName: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: string;
}

interface BookingsTableProps {
  bookings: Booking[];
  page: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export const BookingsTable: React.FC<BookingsTableProps> = ({ bookings, page, onPageChange, isLoading = false }) => {
  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'UPCOMING': return 'badge-info text-info-content';
      case 'ONGOING': return 'badge-success text-success-content';
      case 'COMPLETED': return 'badge-primary text-primary-content';
      case 'CANCELLED': return 'badge-error text-error-content';
      default: return 'badge-ghost';
    }
  };

  const formatRange = (start: string, end: string) => {
    const sDate = new Date(start);
    const eDate = new Date(end);
    const day = sDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const sTime = sDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    const eTime = eDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${day} ${sTime}-${eTime}`;
  };

  return (
    <div className="card bg-base-100/40 backdrop-blur-md border border-base-300/50 shadow-sm rounded-2xl p-5 flex flex-col h-[400px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-base-content/80 flex items-center gap-2">
          <CalendarRange size={16} className="text-primary" />
          Upcoming Bookings
        </h3>
        <div className="flex items-center gap-1">
          <button
            disabled={page === 1 || isLoading}
            onClick={() => onPageChange(page - 1)}
            className="btn btn-xs btn-outline border-base-300"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-[10px] font-bold px-2">{page}</span>
          <button
            disabled={bookings.length < 5 || isLoading}
            onClick={() => onPageChange(page + 1)}
            className="btn btn-xs btn-outline border-base-300"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {bookings.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-base-content/40">
            No upcoming shared bookings found
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="table table-sm w-full">
              <thead>
                <tr className="border-b border-base-300/40 text-base-content/40 text-[10px] uppercase">
                  <th>Asset</th>
                  <th>Employee</th>
                  <th>Time Range</th>
                  <th>Purpose</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((book) => (
                  <tr key={book.id} className="hover:bg-base-200/30 border-b border-base-300/30 text-xs">
                    <td className="font-semibold text-base-content/80 whitespace-nowrap">{book.assetName}</td>
                    <td className="text-base-content/65 whitespace-nowrap">{book.employeeName}</td>
                    <td className="text-base-content/50 font-medium whitespace-nowrap">{formatRange(book.startTime, book.endTime)}</td>
                    <td className="text-base-content/60 truncate max-w-[120px]" title={book.purpose}>{book.purpose}</td>
                    <td>
                      <span className={`badge badge-sm font-bold text-[9px] uppercase px-2 ${getStatusBadge(book.status)}`}>
                        {book.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default BookingsTable;
