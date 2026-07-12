import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { ArrowLeft, Save } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { getAssetById, updateAsset } from '../../services/assetService';

export const EditAssetPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Seeded list of categories
  const mockCategories = [
    { id: 'c1000000-0000-0000-0000-000000000001', name: 'Computing Hardware' },
    { id: 'c1000000-0000-0000-0000-000000000002', name: 'Mobile Devices' },
    { id: 'c1000000-0000-0000-0000-000000000003', name: 'AV Equipment' },
    { id: 'c1000000-0000-0000-0000-000000000004', name: 'Office Furniture' },
    { id: 'c1000000-0000-0000-0000-000000000005', name: 'Company Vehicles' }
  ];

  // Seeded list of departments
  const mockDepartments = [
    { id: 'd1000000-0000-0000-0000-000000000001', name: 'Information Technology' },
    { id: 'd1000000-0000-0000-0000-000000000002', name: 'Human Resources' },
    { id: 'd1000000-0000-0000-0000-000000000003', name: 'Finance' }
  ];

  useEffect(() => {
    const fetchAssetDetails = async () => {
      if (!id) return;
      try {
        const res = await getAssetById(id);
        if (res.success) {
          const asset = res.data;
          const formatInputDate = (isoStr: string | null) => {
            if (!isoStr) return '';
            return new Date(isoStr).toISOString().split('T')[0];
          };

          reset({
            asset_tag: asset.assetTag,
            name: asset.name,
            category_id: asset.categoryId,
            serial_number: asset.serialNumber,
            manufacturer: asset.manufacturer,
            model: asset.model,
            acquisition_date: formatInputDate(asset.acquisitionDate),
            acquisition_cost: asset.acquisitionCost,
            warranty_expiry_date: formatInputDate(asset.warrantyExpiryDate),
            condition: asset.condition,
            status: asset.status,
            current_department_id: asset.currentDepartmentId || '',
            current_location: asset.currentLocation || '',
            is_shared_bookable: asset.isSharedBookable
          });
        }
      } catch (err: any) {
        toast.error('Failed to load asset details');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAssetDetails();
  }, [id, reset]);

  const onSubmit = async (data: any) => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        warranty_expiry_date: data.warranty_expiry_date || null,
        current_department_id: data.current_department_id || null,
        current_location: data.current_location || null,
        is_shared_bookable: data.is_shared_bookable === 'true' || data.is_shared_bookable === true
      };

      const res = await updateAsset(id, payload);
      if (res.success) {
        toast.success('Asset updated successfully!');
        navigate('/assets');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update asset');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner text-primary"></span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Link to="/assets" className="btn btn-ghost btn-xs btn-circle text-base-content/60">
          <ArrowLeft size={16} />
        </Link>
        <PageHeader
          title="Edit Asset"
          subtitle="Update parameters or assign status values."
          breadcrumbs={[{ label: 'Home', path: '/dashboard' }, { label: 'Assets', path: '/assets' }, { label: 'Edit' }]}
        />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card title="Resource Profile & Identity">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label text-xs font-semibold text-base-content/60">Asset Tag *</label>
              <input
                type="text"
                {...register('asset_tag', { required: 'Asset Tag is required' })}
                className="input input-sm input-bordered rounded-lg text-xs"
              />
              {errors.asset_tag && <span className="text-[10px] text-error mt-1">{errors.asset_tag.message as string}</span>}
            </div>

            <div className="form-control">
              <label className="label text-xs font-semibold text-base-content/60">Asset Name *</label>
              <input
                type="text"
                {...register('name', { required: 'Name is required' })}
                className="input input-sm input-bordered rounded-lg text-xs"
              />
              {errors.name && <span className="text-[10px] text-error mt-1">{errors.name.message as string}</span>}
            </div>

            <div className="form-control">
              <label className="label text-xs font-semibold text-base-content/60">Category *</label>
              <select
                {...register('category_id', { required: 'Category is required' })}
                className="select select-sm select-bordered rounded-lg text-xs font-medium"
              >
                {mockCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label text-xs font-semibold text-base-content/60">Serial Number *</label>
              <input
                type="text"
                {...register('serial_number', { required: 'Serial Number is required' })}
                className="input input-sm input-bordered rounded-lg text-xs"
              />
              {errors.serial_number && <span className="text-[10px] text-error mt-1">{errors.serial_number.message as string}</span>}
            </div>

            <div className="form-control">
              <label className="label text-xs font-semibold text-base-content/60">Manufacturer *</label>
              <input
                type="text"
                {...register('manufacturer', { required: 'Manufacturer is required' })}
                className="input input-sm input-bordered rounded-lg text-xs"
              />
            </div>

            <div className="form-control">
              <label className="label text-xs font-semibold text-base-content/60">Model *</label>
              <input
                type="text"
                {...register('model', { required: 'Model is required' })}
                className="input input-sm input-bordered rounded-lg text-xs"
              />
            </div>
          </div>
        </Card>

        <Card title="Acquisition, Cost & Warranty">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="form-control">
              <label className="label text-xs font-semibold text-base-content/60">Purchase Date *</label>
              <input
                type="date"
                {...register('acquisition_date', { required: 'Purchase Date is required' })}
                className="input input-sm input-bordered rounded-lg text-xs"
              />
            </div>

            <div className="form-control">
              <label className="label text-xs font-semibold text-base-content/60">Purchase Cost ($) *</label>
              <input
                type="number"
                step="0.01"
                {...register('acquisition_cost', { required: 'Cost is required', min: 0 })}
                className="input input-sm input-bordered rounded-lg text-xs font-bold"
              />
            </div>

            <div className="form-control">
              <label className="label text-xs font-semibold text-base-content/60">Warranty Expiry Date</label>
              <input
                type="date"
                {...register('warranty_expiry_date')}
                className="input input-sm input-bordered rounded-lg text-xs"
              />
            </div>
          </div>
        </Card>

        <Card title="Status, Condition & Location">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="form-control">
              <label className="label text-xs font-semibold text-base-content/60">Condition</label>
              <select
                {...register('condition')}
                className="select select-sm select-bordered rounded-lg text-xs font-semibold"
              >
                <option value="EXCELLENT">EXCELLENT</option>
                <option value="GOOD">GOOD</option>
                <option value="FAIR">FAIR</option>
                <option value="POOR">POOR</option>
                <option value="DAMAGED">DAMAGED</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label text-xs font-semibold text-base-content/60">Status</label>
              <select
                {...register('status')}
                className="select select-sm select-bordered rounded-lg text-xs font-semibold"
              >
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="ALLOCATED">ALLOCATED</option>
                <option value="RESERVED">RESERVED</option>
                <option value="UNDER_MAINTENANCE">UNDER MAINTENANCE</option>
                <option value="RETIRED">RETIRED</option>
                <option value="DISPOSED">DISPOSED</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label text-xs font-semibold text-base-content/60">Department</label>
              <select
                {...register('current_department_id')}
                className="select select-sm select-bordered rounded-lg text-xs font-medium"
              >
                <option value="">No Department Assigned</option>
                {mockDepartments.map((dept) => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label text-xs font-semibold text-base-content/60">Current Location / Room</label>
              <input
                type="text"
                {...register('current_location')}
                className="input input-sm input-bordered rounded-lg text-xs"
              />
            </div>

            <div className="form-control flex flex-row items-center gap-2 h-full mt-6">
              <input
                type="checkbox"
                id="is_shared_bookable"
                {...register('is_shared_bookable')}
                className="checkbox checkbox-xs"
              />
              <label htmlFor="is_shared_bookable" className="text-xs font-semibold text-base-content/75 cursor-pointer">
                Bookable Shared Resource
              </label>
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-2.5">
          <Link to="/assets" className="btn btn-sm btn-ghost normal-case text-xs">Cancel</Link>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="shadow-md shadow-primary/15 font-semibold text-xs rounded-xl px-6 flex items-center gap-1.5"
          >
            <Save size={15} />
            {isSubmitting ? 'Saving...' : 'Save Updates'}
          </Button>
        </div>
      </form>
    </div>
  );
};
export default EditAssetPage;
