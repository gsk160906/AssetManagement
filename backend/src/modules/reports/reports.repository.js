import pool from '../../db/index.js';

export const getAssetReportData = async (filters) => {
  const { status = '', category = '', location = '', from_date = '', to_date = '' } = filters;
  const values = [];
  
  let summaryQuery = `
    SELECT 
      COUNT(*) AS total_assets,
      COUNT(*) FILTER (WHERE status = 'AVAILABLE') AS available,
      COUNT(*) FILTER (WHERE status = 'ALLOCATED') AS allocated,
      COUNT(*) FILTER (WHERE status = 'UNDER_MAINTENANCE') AS under_maintenance,
      COUNT(*) FILTER (WHERE status = 'RETIRED') AS retired,
      COUNT(*) FILTER (WHERE status = 'DISPOSED') AS disposed
    FROM assets
    WHERE is_deleted = FALSE
  `;

  let query = `
    SELECT 
      a.id, a.asset_tag, a.name, a.manufacturer, a.model, a.serial_number, a.status, a.acquisition_date, a.acquisition_cost, a.current_location,
      c.name AS category_name,
      d.name AS department_name
    FROM assets a
    LEFT JOIN asset_categories c ON a.category_id = c.id
    LEFT JOIN departments d ON a.current_department_id = d.id
    WHERE a.is_deleted = FALSE
  `;

  // Filters mapping
  if (status) { values.push(status); query += ` AND a.status = $${values.length}`; }
  if (category) { values.push(category); query += ` AND c.name = $${values.length}`; }
  if (location) { values.push(location); query += ` AND a.current_location = $${values.length}`; }
  if (from_date) { values.push(from_date); query += ` AND a.acquisition_date >= $${values.length}`; }
  if (to_date) { values.push(to_date); query += ` AND a.acquisition_date <= $${values.length}`; }

  const [summaryRes, dataRes] = await Promise.all([
    pool.query(summaryQuery),
    pool.query(query + ' ORDER BY a.acquisition_date DESC', values)
  ]);

  return {
    summary: summaryRes.rows[0],
    data: dataRes.rows
  };
};

export const getMaintenanceReportData = async (filters) => {
  const { status = '', priority = '', from_date = '', to_date = '' } = filters;
  const values = [];

  let query = `
    SELECT 
      mr.id, mr.description, mr.priority,
      (CASE WHEN mr.status = 'REJECTED' THEN 'CANCELLED' ELSE mr.status::text END) AS status,
      mr.estimated_cost, mr.actual_cost, mr.completed_date, mr.created_at,
      a.name AS asset_name, a.asset_tag
    FROM maintenance_requests mr
    JOIN assets a ON mr.asset_id = a.id
    WHERE mr.is_deleted = FALSE
  `;

  if (status) {
    const mapped = status === 'CANCELLED' ? 'REJECTED' : status;
    values.push(mapped);
    query += ` AND mr.status = $${values.length}`;
  }
  if (priority) { values.push(priority); query += ` AND mr.priority = $${values.length}`; }
  if (from_date) { values.push(from_date); query += ` AND mr.created_at >= $${values.length}`; }
  if (to_date) { values.push(to_date); query += ` AND mr.created_at <= $${values.length}`; }

  const { rows } = await pool.query(query + ' ORDER BY mr.created_at DESC', values);

  // Compute summary on the fly
  const totalCount = rows.length;
  const completed = rows.filter(r => r.status === 'RESOLVED').length;
  const pending = rows.filter(r => ['PENDING', 'IN_PROGRESS'].includes(r.status)).length;
  const totalCost = rows.reduce((sum, r) => sum + parseFloat(r.actual_cost || 0), 0);

  return {
    summary: {
      total_services: totalCount,
      completed,
      pending,
      overdue: 0 // Default stub if no overdue logic exists
    },
    cost_summary: {
      total_cost: totalCost
    },
    data: rows
  };
};

export const getAuditReportData = async () => {
  const query = `
    SELECT 
      a.id, a.audit_code, a.audit_name, a.status, a.audit_type, a.start_date, a.end_date,
      COUNT(ai.id) AS total_assets,
      COUNT(ai.id) FILTER (WHERE ai.verification_status = 'verified') AS verified,
      COUNT(ai.id) FILTER (WHERE ai.verification_status = 'missing') AS missing,
      COUNT(ai.id) FILTER (WHERE ai.verification_status = 'damaged') AS damaged,
      COUNT(ai.id) FILTER (WHERE ai.verification_status = 'relocated') AS relocated
    FROM audits a
    LEFT JOIN audit_items ai ON a.id = ai.audit_id
    GROUP BY a.id
    ORDER BY a.created_at DESC
  `;
  const { rows } = await pool.query(query);

  const totalAudits = rows.length;
  const completed = rows.filter(r => r.status === 'completed').length;
  const missingCount = rows.reduce((sum, r) => sum + parseInt(r.missing || 0, 10), 0);
  
  // Average accuracy
  let accuracySum = 0;
  let auditedCount = 0;
  rows.forEach(r => {
    const tot = parseInt(r.total_assets, 10) || 0;
    const ver = parseInt(r.verified, 10) || 0;
    if (tot > 0) {
      accuracySum += (ver / tot) * 100;
      auditedCount++;
    }
  });
  const accuracyAvg = auditedCount > 0 ? `${Math.round(accuracySum / auditedCount)}%` : '100%';

  return {
    total_audits: totalAudits,
    completed,
    accuracy_average: accuracyAvg,
    missing_assets: missingCount,
    data: rows
  };
};

export const getBookingReportData = async () => {
  const { rows } = await pool.query(`
    SELECT 
      rb.id, rb.start_time, rb.end_time, rb.purpose, rb.status,
      a.name AS asset_name, a.asset_tag,
      u.name AS employee_name
    FROM resource_bookings rb
    JOIN assets a ON rb.resource_id = a.id
    JOIN users u ON rb.employee_id = u.id
    WHERE rb.is_deleted = FALSE
    ORDER BY rb.start_time DESC
  `);

  // Top resources usage count
  const topRes = await pool.query(`
    SELECT a.name, COUNT(*) AS usage
    FROM resource_bookings rb
    JOIN assets a ON rb.resource_id = a.id
    WHERE rb.is_deleted = FALSE
    GROUP BY a.name
    ORDER BY usage DESC
    LIMIT 5
  `);

  return {
    total_bookings: rows.length,
    top_resources: topRes.rows,
    data: rows
  };
};

export const getExpenseReportData = async () => {
  // Aggregate expenses
  const assetRes = await pool.query("SELECT COALESCE(SUM(acquisition_cost), 0) AS total FROM assets WHERE is_deleted = FALSE");
  const maintRes = await pool.query("SELECT COALESCE(SUM(actual_cost), 0) AS total FROM maintenance_requests WHERE status = 'RESOLVED'");

  const totalPurchase = parseFloat(assetRes.rows[0].total);
  const totalMaint = parseFloat(maintRes.rows[0].total);

  // Monthly maintenance expenses trend (last 6 months)
  const trendRes = await pool.query(`
    SELECT TO_CHAR(completed_date, 'Mon') AS month_name, SUM(actual_cost) AS cost, DATE_TRUNC('month', completed_date) AS m_date
    FROM maintenance_requests
    WHERE status = 'RESOLVED' AND completed_date IS NOT NULL
    GROUP BY TO_CHAR(completed_date, 'Mon'), DATE_TRUNC('month', completed_date)
    ORDER BY m_date DESC
    LIMIT 6
  `);

  return {
    total_expense: totalPurchase + totalMaint,
    purchase_cost: totalPurchase,
    maintenance_cost: totalMaint,
    monthly_trend: trendRes.rows.reverse(),
    data: [
      { category: 'Physical Assets Purchase', amount: totalPurchase },
      { category: 'Maintenance & Service Requests', amount: totalMaint }
    ]
  };
};

export const saveReportHistory = async (data) => {
  const { rows } = await pool.query(
    `INSERT INTO report_history (user_id, report_type, file_format, filters, file_name)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [data.userId, data.reportType, data.fileFormat, JSON.stringify(data.filters || {}), data.fileName]
  );
  return rows[0];
};

export const getReportHistory = async () => {
  const { rows } = await pool.query(`
    SELECT h.*, u.name AS user_name
    FROM report_history h
    LEFT JOIN users u ON h.user_id = u.id
    ORDER BY h.generated_at DESC
    LIMIT 10
  `);
  return rows;
};
