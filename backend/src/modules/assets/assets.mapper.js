export const mapAsset = (asset) => {
  if (!asset) return null;

  // Cost and Dates
  const cost = parseFloat(asset.acquisition_cost || 0);
  const acquisitionDate = new Date(asset.acquisition_date);
  const now = new Date();
  
  // Calculate Age in Months and Years
  const ageMonths = Math.max(
    0,
    (now.getFullYear() - acquisitionDate.getFullYear()) * 12 + (now.getMonth() - acquisitionDate.getMonth())
  );
  const ageYears = ageMonths / 12;

  // Straight line depreciation (useful life is based on default_warranty_months or default 60 months)
  const usefulLifeMonths = asset.default_warranty_months || 60;
  const slDepreciatedAmount = Math.min(cost, cost * (ageMonths / usefulLifeMonths));
  const slBookValue = Math.max(0, cost - slDepreciatedAmount);
  const slDepreciationPercent = cost > 0 ? (slDepreciatedAmount / cost) * 100 : 0;

  // Declining balance depreciation (assume standard 15% annual rate)
  const dbRate = 0.15; 
  const dbBookValue = Math.max(0, cost * Math.pow(1 - dbRate, ageYears));
  const dbDepreciatedAmount = cost - dbBookValue;
  const dbDepreciationPercent = cost > 0 ? (dbDepreciatedAmount / cost) * 100 : 0;

  return {
    id: asset.id,
    assetTag: asset.asset_tag,
    name: asset.name,
    categoryId: asset.category_id,
    categoryName: asset.category_name || null,
    serialNumber: asset.serial_number,
    manufacturer: asset.manufacturer,
    model: asset.model,
    acquisitionDate: asset.acquisition_date,
    acquisitionCost: cost,
    warrantyExpiryDate: asset.warranty_expiry_date,
    condition: asset.condition,
    status: asset.status,
    currentDepartmentId: asset.current_department_id,
    departmentName: asset.department_name || null,
    currentLocation: asset.current_location,
    isSharedBookable: asset.is_shared_bookable,
    imageUrl: asset.image_url,
    createdById: asset.created_by_id,
    createdByName: asset.created_by_name || null,
    createdAt: asset.created_at,
    updatedAt: asset.updated_at,
    depreciation: {
      ageMonths: Math.round(ageMonths),
      ageYears: parseFloat(ageYears.toFixed(2)),
      straightLine: {
        usefulLifeMonths,
        depreciatedAmount: parseFloat(slDepreciatedAmount.toFixed(2)),
        bookValue: parseFloat(slBookValue.toFixed(2)),
        percent: parseFloat(slDepreciationPercent.toFixed(1))
      },
      decliningBalance: {
        rate: dbRate,
        depreciatedAmount: parseFloat(dbDepreciatedAmount.toFixed(2)),
        bookValue: parseFloat(dbBookValue.toFixed(2)),
        percent: parseFloat(dbDepreciationPercent.toFixed(1))
      }
    }
  };
};

export const mapAssets = (assets) => {
  return assets.map(mapAsset);
};
