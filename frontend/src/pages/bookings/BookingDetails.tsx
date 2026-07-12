import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import {
  Calendar, ArrowLeft, Pencil, Trash2, Clock,
  Package, Building2, AlertCircle, CheckCircle2, XCircle
} from 'lucide-react';
import { getBookingById, updateBooking, cancelBooking } from '../../services/bookingService';
import { BookingStatusBadge } from './BookingsPage';

const InfoRow: React.FC<{ label: string; value: React.ReactNode; icon?: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="flex items-start gap-3 py-2.5 border-b border-base-300/20 last:border-0">
    {icon && <div className="text-base-content/30 mt-0.5 shrink-0">{icon}</div>}
    <div className="flex-1 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
      <span className="text-[10px] font-bold text-base-content/40 uppercase">{label}</span>
      <span className="text-xs font-semibold text-base-content/85">{value}</span>
    </div>
  </div>
);

export const BookingDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');
  const [editPurpose, setEditPurpose] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const fetchDetails = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await getBookingById(id);
      if (res.success) {
        setBooking(res.data);
      } else {
        setError(res.message || 'Booking reservation not found.');
      }
    } catch (err: any) {
      setError(err.response?.status === 404 ? 'Booking reservation not found.' : err.response?.data?.message || 'Unable to load booking details.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const openEdit = () => {
    if (!booking) return;
    // Format timestamp back to local input string (YYYY-MM-DDTHH:MM)
    const fmt = (d: string) => {
      const dateObj = new Date(d);
      const offsetMs = dateObj.getTimezoneOffset() * 60 * 1000;
      const localTime = new Date(dateObj.getTime() - offsetMs);
      return localTime.toISOString().slice(0, 16);
    };

    setEditStart(fmt(booking.start_time));
    setEditEnd(fmt(booking.end_time));
    setEditPurpose(booking.purpose);
    setEditNotes(booking.notes || '');
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const res = await updateBooking(id!, {
        startTime: new Date(editStart).toISOString(),
        endTime: new Date(editEnd).toISOString(),
        purpose: editPurpose,
        notes: editNotes || null
      });
      if (res.success) {
        toast.success('Reservation updated successfully.');
        setIsEditOpen(false);
        fetchDetails();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Update failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking? This cannot be undone.')) return;
    setIsProcessing(true);
    try {
      const res = await cancelBooking(id!);
      if (res.success) {
        toast.success('Booking cancelled.');
        fetchDetails();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Cancellation failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const fmt = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—';
  const fmtTime = (d: string | null) =>
    d ? new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '—';

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="skeleton h-14 w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="skeleton h-32 w-full rounded-2xl" />
            <div className="skeleton h-48 w-full rounded-2xl" />
          </div>
          <div className="skeleton h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
        <div className="p-4 bg-error/10 text-error rounded-2xl"><AlertCircle size={40} /></div>
        <h2 className="text-lg font-bold text-base-content">{error}</h2>
        <Link to="/bookings" className="btn btn-primary btn-sm normal-case font-semibold text-xs">
          <ArrowLeft size={14} className="mr-1" /> Back to Bookings
        </Link>
      </div>
    );
  }

  if (!booking) return null;

  const canEdit = booking.status === 'UPCOMING';
  const canCancel = booking.status === 'UPCOMING';

  const statusIcons: Record<string, React.ReactNode> = {
    UPCOMING: <Clock size={16} className="text-info" />,
    ONGOING: <Clock size={16} className="text-warning" />,
    COMPLETED: <CheckCircle2 size={16} className="text-success" />,
    CANCELLED: <XCircle size={16} className="text-error" />
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <PageHeader
        title="Booking Details"
        subtitle={`${booking.asset_name} · ${booking.asset_tag}`}
        breadcrumbs={[
          { label: 'Home', path: '/dashboard' },
          { label: 'Bookings', path: '/bookings' },
          { label: booking.asset_tag }
        ]}
        action={
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => navigate('/bookings')}>
              <ArrowLeft size={13} className="mr-1" /> Back
            </Button>
            {canEdit && (
              <Button variant="outline" size="sm" onClick={openEdit}>
                <Pencil size={13} className="mr-1" /> Edit Booking
              </Button>
            )}
            {canCancel && (
              <Button variant="error" size="sm" onClick={handleCancelBooking} disabled={isProcessing}>
                <Trash2 size={13} className="mr-1" /> Cancel Reservation
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status banner */}
          <div className="card bg-base-100/40 backdrop-blur-md border border-base-300/50 rounded-2xl p-5">
            <div className="flex flex-wrap items-center gap-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-base-200 rounded-xl">{statusIcons[booking.status]}</div>
                <div>
                  <p className="text-[10px] font-bold text-base-content/40 uppercase">Status</p>
                  <div className="mt-0.5"><BookingStatusBadge status={booking.status} /></div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-base-200 rounded-xl"><Calendar size={16} className="text-base-content/50" /></div>
                <div>
                  <p className="text-[10px] font-bold text-base-content/40 uppercase">Duration</p>
                  <p className="text-xs font-bold mt-0.5 text-base-content/80">{booking.duration_hours} Hours</p>
                </div>
              </div>
            </div>
          </div>

          {/* Purpose & Notes */}
          <Card title="Reservation Purpose">
            <p className="text-sm font-semibold text-base-content/85">{booking.purpose}</p>
            {booking.notes && (
              <div className="mt-4 p-3.5 bg-base-200/50 rounded-xl border border-base-300/20">
                <p className="text-[10px] font-bold text-base-content/40 uppercase mb-1">Additional Notes</p>
                <p className="text-xs text-base-content/70">{booking.notes}</p>
              </div>
            )}
          </Card>

          {/* Booking Schedule Details */}
          <Card title="Schedule Details">
            <InfoRow label="Start Date" value={fmt(booking.start_time)} icon={<Calendar size={13} />} />
            <InfoRow label="Start Time" value={fmtTime(booking.start_time)} icon={<Clock size={13} />} />
            <InfoRow label="End Date" value={fmt(booking.end_time)} icon={<Calendar size={13} />} />
            <InfoRow label="End Time" value={fmtTime(booking.end_time)} icon={<Clock size={13} />} />
          </Card>
        </div>

        {/* Right Side */}
        <div className="space-y-6">
          {/* Resource Details */}
          <Card title="Asset Profile">
            <p className="font-bold text-sm text-base-content/85">{booking.asset_name}</p>
            <p className="font-mono text-xs text-primary font-bold">{booking.asset_tag}</p>
            <div className="mt-3 space-y-1">
              <InfoRow label="Category" value={booking.category_name ?? '—'} icon={<Package size={12} />} />
              <InfoRow label="Location" value={booking.asset_location ?? 'N/A'} icon={<Building2 size={12} />} />
              <InfoRow label="Manufacturer" value={booking.asset_manufacturer ?? '—'} />
              <InfoRow label="Model" value={booking.asset_model ?? '—'} />
            </div>
            <Link to={`/assets/${booking.asset_id}`} className="btn btn-outline btn-xs w-full rounded-xl normal-case text-xs font-semibold mt-4">
              View Asset Specs
            </Link>
          </Card>

          {/* Reserved By */}
          <Card title="Reserved By">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                {booking.employee_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold text-base-content/85">{booking.employee_name}</p>
                <p className="text-[10px] text-base-content/40">{booking.employee_email}</p>
              </div>
            </div>
            {booking.department_name && (
              <div className="mt-3.5 pt-3 border-t border-base-300/30 flex justify-between items-center text-xs">
                <span className="text-base-content/50">Department:</span>
                <span className="font-semibold">{booking.department_name}</span>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* ── Edit Reservation Modal ── */}
      {isEditOpen && (
        <div className="modal modal-open">
          <div className="modal-box bg-base-100 border border-base-300 rounded-2xl p-6 max-w-sm">
            <h3 className="font-bold text-sm mb-4">Edit Reservation</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label text-xs font-semibold text-base-content/60">Start Schedule *</label>
                <input type="datetime-local" value={editStart} onChange={e => setEditStart(e.target.value)} required className="input input-sm input-bordered w-full text-xs font-semibold" />
              </div>
              <div className="form-control">
                <label className="label text-xs font-semibold text-base-content/60">End Schedule *</label>
                <input type="datetime-local" value={editEnd} onChange={e => setEditEnd(e.target.value)} required className="input input-sm input-bordered w-full text-xs font-semibold" />
              </div>
              <div className="form-control">
                <label className="label text-xs font-semibold text-base-content/60">Purpose *</label>
                <input type="text" value={editPurpose} onChange={e => setEditPurpose(e.target.value)} required minLength={3} className="input input-sm input-bordered w-full text-xs" />
              </div>
              <div className="form-control">
                <label className="label text-xs font-semibold text-base-content/60">Notes</label>
                <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} className="textarea textarea-sm textarea-bordered w-full text-xs h-16" />
              </div>

              <div className="modal-action gap-2 mt-4">
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary" size="sm" isLoading={isProcessing} disabled={isProcessing}>
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingDetails;
