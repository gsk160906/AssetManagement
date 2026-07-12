import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import {
  CalendarDays, Plus, Eye, Trash2, Filter, X, RefreshCw,
  Clock, CheckCircle2, AlertTriangle, Calendar, Users, Info, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useBookings } from '../../hooks/useBookings';
import { createBooking, cancelBooking, getAvailableResources } from '../../services/bookingService';
import { api } from '../../services/api';

// ─── Status Badge ─────────────────────────────────────────────────────────────
export const BookingStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, string> = {
    UPCOMING: 'badge-info text-info-content',
    ONGOING: 'badge-warning text-warning-content',
    COMPLETED: 'badge-success text-success-content',
    CANCELLED: 'badge-error text-error-content'
  };
  return (
    <span className={`badge badge-sm font-bold uppercase ${map[status] ?? 'badge-ghost'}`}>
      {status}
    </span>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode; color: string }> = ({
  label, value, icon, color
}) => (
  <div className="card bg-base-100/40 backdrop-blur-md border border-base-300/50 rounded-2xl p-4 flex items-center gap-4">
    <div className={`p-2.5 rounded-xl ${color}`}>{icon}</div>
    <div>
      <p className="text-[10px] font-bold text-base-content/40 uppercase">{label}</p>
      <p className="text-xl font-extrabold text-base-content">{value}</p>
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export const BookingsPage: React.FC = () => {
  const {
    bookings, stats, calendarEvents, total, page, totalPages, isLoading,
    filters, setPage, setFilters, resetFilters, refetch, removeBookingFromList
  } = useBookings();

  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Calendar month state
  const [currentDate, setCurrentDate] = useState(new Date());

  // Dropdown options
  const [departments, setDepartments] = useState<any[]>([]);

  // Create form state
  const [formStart, setFormStart] = useState('');
  const [formEnd, setFormEnd] = useState('');
  const [formPurpose, setFormPurpose] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [availableResources, setAvailableResources] = useState<any[]>([]);
  const [selectedResourceId, setSelectedResourceId] = useState('');
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Load departments list for filters
  useEffect(() => {
    const loadMeta = async () => {
      try {
        const res = await api.get('/organization/departments');
        if (res.data.success) setDepartments(res.data.data.departments ?? res.data.data ?? []);
      } catch { /* silent */ }
    };
    loadMeta();
  }, []);

  // Fetch available resources when start/end times change
  useEffect(() => {
    if (!formStart || !formEnd) {
      setAvailableResources([]);
      setSelectedResourceId('');
      return;
    }
    const checkAvailability = async () => {
      setCheckingAvailability(true);
      try {
        // Validate date order locally
        const sTime = new Date(formStart);
        const eTime = new Date(formEnd);
        if (eTime <= sTime) {
          setAvailableResources([]);
          setSelectedResourceId('');
          return;
        }

        const res = await getAvailableResources(sTime.toISOString(), eTime.toISOString());
        if (res.success) {
          setAvailableResources(res.data.resources ?? []);
          if (res.data.resources?.length > 0) {
            setSelectedResourceId(res.data.resources[0].id);
          } else {
            setSelectedResourceId('');
          }
        }
      } catch {
        setAvailableResources([]);
        setSelectedResourceId('');
      } finally {
        setCheckingAvailability(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      checkAvailability();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [formStart, formEnd]);

  // Form submit handler
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResourceId) return toast.error('Please select an available resource.');
    setIsProcessing(true);
    try {
      const res = await createBooking({
        resourceId: selectedResourceId,
        startTime: new Date(formStart).toISOString(),
        endTime: new Date(formEnd).toISOString(),
        purpose: formPurpose,
        notes: formNotes || null
      });
      if (res.success) {
        toast.success('Reservation successfully booked!');
        setIsCreateOpen(false);
        setFormStart('');
        setFormEnd('');
        setFormPurpose('');
        setFormNotes('');
        refetch();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Booking creation failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async (id: string, name: string) => {
    if (!window.confirm(`Cancel reservation for "${name}"?`)) return;
    try {
      const res = await cancelBooking(id);
      if (res.success) {
        toast.success('Booking cancelled.');
        removeBookingFromList(id);
        refetch(); // sync stats
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Cancellation failed.');
    }
  };

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
  const formatTime = (d: string | null) =>
    d ? new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '—';

  // ─── Custom Calendar Logic ──────────────────────────────────────────────────
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    return { firstDay, totalDays };
  };

  const renderCalendar = () => {
    const { firstDay, totalDays } = getDaysInMonth(currentDate);
    const blanks = Array(firstDay).fill(null);
    const days = Array.from({ length: totalDays }, (_, i) => i + 1);
    const grid = [...blanks, ...days];

    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    const colors: Record<string, string> = {
      UPCOMING: 'bg-info/20 text-info border-info/40',
      ONGOING: 'bg-warning/20 text-warning border-warning/40',
      COMPLETED: 'bg-success/20 text-success border-success/40',
      CANCELLED: 'bg-error/20 text-error border-error/40'
    };

    return (
      <div className="space-y-4">
        {/* Calendar Nav */}
        <div className="flex justify-between items-center bg-base-200/50 p-3 rounded-xl border border-base-300/30">
          <h4 className="font-extrabold text-sm text-base-content/80">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h4>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentDate(new Date(currentYear, currentMonth - 1, 1))} className="btn btn-ghost btn-xs btn-circle"><ChevronLeft size={16} /></button>
            <button onClick={() => setCurrentDate(new Date())} className="btn btn-ghost btn-xs normal-case text-xs font-semibold">Today</button>
            <button onClick={() => setCurrentDate(new Date(currentYear, currentMonth + 1, 1))} className="btn btn-ghost btn-xs btn-circle"><ChevronRight size={16} /></button>
          </div>
        </div>

        {/* Week Days Header */}
        <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-base-content/40 uppercase">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="py-1">{d}</div>)}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1.5 min-h-[300px]">
          {grid.map((day, idx) => {
            if (day === null) return <div key={`blank-${idx}`} className="bg-base-200/10 border border-transparent rounded-lg" />;

            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = calendarEvents.filter(ev => {
              const startStr = ev.start.split('T')[0];
              const endStr = ev.end.split('T')[0];
              return dateStr >= startStr && dateStr <= endStr;
            });

            return (
              <div key={day} className="bg-base-100/30 border border-base-300/40 rounded-lg p-1.5 min-h-[70px] flex flex-col justify-between">
                <span className="text-[10px] font-bold text-base-content/50">{day}</span>
                <div className="space-y-1 mt-1 flex-1 overflow-y-auto max-h-[50px]">
                  {dayEvents.map(ev => (
                    <Link key={ev.id} to={`/bookings/${ev.id}`} className={`block text-[8px] font-bold px-1 py-0.5 rounded border leading-tight truncate ${colors[ev.status] ?? 'bg-base-200'}`} title={`${ev.title} (${ev.employee_name})`}>
                      {ev.title}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <PageHeader
        title="Bookings & Reservations"
        subtitle="Manage reservation schedules for vehicles, meeting rooms, and shared equipment."
        breadcrumbs={[{ label: 'Home', path: '/dashboard' }, { label: 'Bookings' }]}
        action={
          <Button variant="primary" size="sm" onClick={() => setIsCreateOpen(true)} className="shadow-md shadow-primary/15">
            <Plus size={16} className="mr-1" /> New Booking
          </Button>
        }
      />

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Total Bookings" value={stats.total_bookings} icon={<CalendarDays size={18} />} color="bg-primary/10 text-primary" />
          <StatCard label="Today's Bookings" value={stats.today_bookings} icon={<Clock size={18} />} color="bg-info/10 text-info" />
          <StatCard label="Active" value={stats.ongoing_bookings} icon={<CheckCircle2 size={18} />} color="bg-warning/10 text-warning" />
          <StatCard label="Most Booked" value={stats.most_booked_resource} icon={<Users size={18} />} color="bg-success/10 text-success" />
        </div>
      )}

      {/* View Toggle */}
      <div className="flex justify-between items-center bg-base-100/40 backdrop-blur-md border border-base-300/50 p-2 rounded-2xl shadow-sm">
        <div className="flex gap-1">
          <button onClick={() => setViewMode('list')} className={`btn btn-xs rounded-xl normal-case px-4 ${viewMode === 'list' ? 'btn-primary text-white' : 'btn-ghost'}`}>
            List View
          </button>
          <button onClick={() => setViewMode('calendar')} className={`btn btn-xs rounded-xl normal-case px-4 ${viewMode === 'calendar' ? 'btn-primary text-white' : 'btn-ghost'}`}>
            Calendar View
          </button>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-base-content/70">
            <input type="checkbox" checked={filters.onlyMine} onChange={e => setFilters({ onlyMine: e.target.checked })} className="checkbox checkbox-xs checkbox-primary" />
            My Bookings Only
          </label>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <Card className="p-5">{renderCalendar()}</Card>
      ) : (
        <>
          {/* Filters */}
          <div className="card bg-base-100/40 backdrop-blur-md border border-base-300/50 shadow-sm rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-base-300/30">
              <h3 className="text-xs font-bold text-base-content/80 flex items-center gap-1.5"><Filter size={14} className="text-primary" /> Filters</h3>
              <button onClick={resetFilters} className="btn btn-ghost btn-xs text-xs text-base-content/50 hover:text-error normal-case flex items-center gap-1"><X size={12} /> Reset</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="form-control">
                <label className="label text-[10px] font-semibold text-base-content/50 p-1">Search</label>
                <input type="text" placeholder="Resource, employee, purpose..." value={filters.q} onChange={e => setFilters({ q: e.target.value })} className="input input-xs input-bordered text-xs rounded-lg w-full" />
              </div>
              <div className="form-control">
                <label className="label text-[10px] font-semibold text-base-content/50 p-1">Status</label>
                <select value={filters.status} onChange={e => setFilters({ status: e.target.value })} className="select select-xs select-bordered text-xs rounded-lg w-full font-medium">
                  <option value="">All Statuses</option>
                  {['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-control">
                <label className="label text-[10px] font-semibold text-base-content/50 p-1">Department</label>
                <select value={filters.departmentId} onChange={e => setFilters({ departmentId: e.target.value })} className="select select-xs select-bordered text-xs rounded-lg w-full font-medium">
                  <option value="">All Departments</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="form-control">
                <label className="label text-[10px] font-semibold text-base-content/50 p-1">Date</label>
                <input type="date" value={filters.date} onChange={e => setFilters({ date: e.target.value })} className="input input-xs input-bordered text-xs rounded-lg w-full" />
              </div>
            </div>
          </div>

          {/* List Table */}
          <Card>
            <div className="flex justify-between items-center pb-3 border-b border-base-300/30 mb-2">
              <span className="text-[10px] font-bold text-base-content/40 uppercase">{total} reservation{total !== 1 ? 's' : ''} found</span>
              <button onClick={refetch} className="btn btn-ghost btn-xs text-base-content/40 hover:text-primary flex items-center gap-1 normal-case"><RefreshCw size={12} /> Refresh</button>
            </div>

            <div className="overflow-x-auto w-full min-h-[280px]">
              {isLoading ? (
                <div className="space-y-3 py-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="skeleton h-10 w-full rounded-xl opacity-50" />
                  ))}
                </div>
              ) : bookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="p-4 bg-base-200 rounded-2xl mb-3 text-base-content/30"><Calendar size={32} /></div>
                  <p className="text-sm font-bold text-base-content/40">No reservations found</p>
                  <p className="text-xs text-base-content/30 mt-1">Schedule a booking window to reserve resources</p>
                  <button onClick={() => setIsCreateOpen(true)} className="btn btn-primary btn-sm mt-4 normal-case text-xs font-semibold shadow-md shadow-primary/20">
                    <Plus size={14} className="mr-1" /> Reserve Resource
                  </button>
                </div>
              ) : (
                <table className="table table-sm w-full">
                  <thead>
                    <tr className="border-b border-base-300/40 text-base-content/40 text-[10px] uppercase font-bold">
                      <th>Resource</th>
                      <th>Employee</th>
                      <th>Department</th>
                      <th>Start Time</th>
                      <th>End Time</th>
                      <th>Duration</th>
                      <th>Status</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(b => (
                      <tr key={b.id} className="hover:bg-base-200/20 border-b border-base-300/20 text-xs">
                        <td>
                          <Link to={`/bookings/${b.id}`} className="font-semibold text-base-content/85 hover:text-primary transition-colors">
                            {b.asset_name}
                          </Link>
                          <div className="font-mono text-[9px] text-primary">{b.asset_tag}</div>
                        </td>
                        <td className="text-base-content/70 font-semibold">{b.employee_name}</td>
                        <td className="text-base-content/60">{b.department_name ?? '—'}</td>
                        <td>
                          <div>{formatDate(b.start_time)}</div>
                          <div className="text-[10px] text-base-content/40">{formatTime(b.start_time)}</div>
                        </td>
                        <td>
                          <div>{formatDate(b.end_time)}</div>
                          <div className="text-[10px] text-base-content/40">{formatTime(b.end_time)}</div>
                        </td>
                        <td className="text-base-content/60 font-medium">{b.duration_hours} hrs</td>
                        <td><BookingStatusBadge status={b.status} /></td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link to={`/bookings/${b.id}`} className="btn btn-ghost btn-xs btn-circle text-base-content/50 hover:text-primary" title="Details">
                              <Eye size={13} />
                            </Link>
                            {b.status === 'UPCOMING' && (
                              <button onClick={() => handleCancel(b.id, b.asset_name)} className="btn btn-ghost btn-xs btn-circle text-base-content/50 hover:text-error" title="Cancel Booking">
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {totalPages > 1 && !isLoading && (
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-base-300/30">
                <span className="text-[10px] font-bold text-base-content/40 uppercase">Page {page} of {totalPages} — {total} total</span>
                <div className="flex gap-1.5">
                  <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="btn btn-outline btn-xs">Prev</button>
                  <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="btn btn-outline btn-xs">Next</button>
                </div>
              </div>
            )}
          </Card>
        </>
      )}

      {/* ── Create Booking Modal ── */}
      {isCreateOpen && (
        <div className="modal modal-open">
          <div className="modal-box bg-base-100 border border-base-300 rounded-2xl p-6 max-w-sm">
            <h3 className="font-bold text-sm mb-4">Book a Resource</h3>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label text-xs font-semibold text-base-content/60">Start Schedule *</label>
                <input type="datetime-local" value={formStart} onChange={e => setFormStart(e.target.value)} required className="input input-sm input-bordered w-full text-xs font-semibold" />
              </div>
              <div className="form-control">
                <label className="label text-xs font-semibold text-base-content/60">End Schedule *</label>
                <input type="datetime-local" value={formEnd} onChange={e => setFormEnd(e.target.value)} required className="input input-sm input-bordered w-full text-xs font-semibold" />
              </div>

              {/* Resource Selector based on availability */}
              <div className="form-control">
                <label className="label text-xs font-semibold text-base-content/60">Available Resources *</label>
                {checkingAvailability ? (
                  <div className="flex items-center gap-2 text-xs text-base-content/40 mt-1"><span className="loading loading-spinner loading-xs" />Checking availability...</div>
                ) : !formStart || !formEnd ? (
                  <div className="alert alert-xs bg-base-200/50 border-0 rounded-lg text-base-content/50 flex items-center gap-1.5 p-2"><Info size={12} />Select schedule to view available resources.</div>
                ) : availableResources.length === 0 ? (
                  <div className="alert alert-xs bg-error/10 border-0 rounded-lg text-error flex items-center gap-1.5 p-2"><AlertTriangle size={12} />No resources available during this period.</div>
                ) : (
                  <select value={selectedResourceId} onChange={e => setSelectedResourceId(e.target.value)} className="select select-sm select-bordered w-full text-xs font-semibold" required>
                    {availableResources.map(r => (
                      <option key={r.id} value={r.id}>{r.name} ({r.asset_tag}) · {r.category_name}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="form-control">
                <label className="label text-xs font-semibold text-base-content/60">Purpose *</label>
                <input type="text" placeholder="e.g. Project presentation" value={formPurpose} onChange={e => setFormPurpose(e.target.value)} required minLength={3} className="input input-sm input-bordered w-full text-xs" />
              </div>
              <div className="form-control">
                <label className="label text-xs font-semibold text-base-content/60">Notes</label>
                <textarea placeholder="Optional notes..." value={formNotes} onChange={e => setFormNotes(e.target.value)} className="textarea textarea-sm textarea-bordered w-full text-xs h-16" />
              </div>

              <div className="modal-action gap-2 mt-4">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="btn btn-sm btn-ghost normal-case text-xs">Cancel</button>
                <button type="submit" disabled={isProcessing || !selectedResourceId} className="btn btn-sm btn-primary text-white font-semibold px-5 normal-case text-xs">
                  {isProcessing ? 'Booking...' : 'Book Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsPage;
