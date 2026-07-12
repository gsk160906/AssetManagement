import pool from '../../db/index.js';

export const getAssetStatusStats = async (role, departmentId) => {
  let query = `
    SELECT status, COUNT(*) AS count
    FROM assets
    WHERE is_deleted = false
  `;
  const params = [];
  let paramIndex = 1;

  if (role === 'DEPARTMENT_HEAD') {
    query += ` AND current_department_id = $${paramIndex}`;
    params.push(departmentId);
    paramIndex++;
  } else if (role === 'EMPLOYEE') {
    // For employee, only show their active allocations statuses (all are ALLOCATED)
    query = `
      SELECT 'ALLOCATED'::varchar AS status, COUNT(*) AS count
      FROM asset_allocations
      WHERE employee_id = $1 AND status = 'ACTIVE' AND is_deleted = false
    `;
    const result = await pool.query(query, [departmentId]); // departmentId is actually userId in this call
    return result.rows;
  }

  query += ` GROUP BY status`;
  const result = await pool.query(query, params);
  return result.rows;
};

export const getDepartmentStats = async () => {
  const query = `
    SELECT d.name AS department_name, COUNT(a.id) AS asset_count
    FROM departments d
    LEFT JOIN assets a ON a.current_department_id = d.id AND a.is_deleted = false
    WHERE d.is_deleted = false
    GROUP BY d.id, d.name
    ORDER BY asset_count DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

export const getCategoryStats = async (role, departmentId) => {
  let query = `
    SELECT c.name AS category_name, COUNT(a.id) AS asset_count
    FROM asset_categories c
    LEFT JOIN assets a ON a.category_id = c.id AND a.is_deleted = false AND a.is_deleted = false
  `;
  const params = [];
  let paramIndex = 1;

  if (role === 'DEPARTMENT_HEAD') {
    query += ` AND a.current_department_id = $${paramIndex}`;
    params.push(departmentId);
    paramIndex++;
  } else if (role === 'EMPLOYEE') {
    // For employee, count categories of their active allocated assets
    query = `
      SELECT c.name AS category_name, COUNT(aa.id) AS asset_count
      FROM asset_allocations aa
      INNER JOIN assets a ON aa.asset_id = a.id
      INNER JOIN asset_categories c ON a.category_id = c.id
      WHERE aa.employee_id = $1 AND aa.status = 'ACTIVE' AND aa.is_deleted = false
      GROUP BY c.id, c.name
    `;
    const result = await pool.query(query, [departmentId]); // departmentId is actually userId
    return result.rows;
  }

  query += ` WHERE c.is_deleted = false GROUP BY c.id, c.name`;
  const result = await pool.query(query, params);
  return result.rows;
};

export const getMaintenanceCostTrend = async (role, departmentId) => {
  let query = `
    SELECT TO_CHAR(mr.completed_date, 'Mon') AS month_name, SUM(mr.actual_cost) AS total_cost, DATE_TRUNC('month', mr.completed_date) AS m_date
    FROM maintenance_requests mr
    INNER JOIN assets a ON mr.asset_id = a.id
    WHERE mr.status = 'RESOLVED' AND mr.completed_date IS NOT NULL AND mr.is_deleted = false
  `;
  const params = [];
  let paramIndex = 1;

  if (role === 'DEPARTMENT_HEAD') {
    query += ` AND a.current_department_id = $${paramIndex}`;
    params.push(departmentId);
    paramIndex++;
  } else if (role === 'EMPLOYEE') {
    query += ` AND mr.raised_by_id = $${paramIndex}`;
    params.push(departmentId); // departmentId is actually userId
    paramIndex++;
  }

  query += `
    GROUP BY TO_CHAR(mr.completed_date, 'Mon'), DATE_TRUNC('month', mr.completed_date)
    ORDER BY m_date ASC
    LIMIT 6
  `;
  const result = await pool.query(query, params);
  return result.rows;
};

export const getMaintenanceSummary = async (role, departmentId) => {
  let query = `
    SELECT 
      COUNT(CASE WHEN mr.status = 'PENDING' THEN 1 END) AS pending,
      COUNT(CASE WHEN mr.status = 'IN_PROGRESS' THEN 1 END) AS in_progress,
      COUNT(CASE WHEN mr.status = 'RESOLVED' THEN 1 END) AS resolved,
      COUNT(CASE WHEN mr.status = 'REJECTED' THEN 1 END) AS rejected,
      COALESCE(AVG(mr.actual_cost), 0) AS avg_repair_cost,
      COALESCE(SUM(mr.actual_cost), 0) AS total_cost
    FROM maintenance_requests mr
    INNER JOIN assets a ON mr.asset_id = a.id
    WHERE mr.is_deleted = false
  `;
  const params = [];
  let paramIndex = 1;

  if (role === 'DEPARTMENT_HEAD') {
    query += ` AND a.current_department_id = $${paramIndex}`;
    params.push(departmentId);
    paramIndex++;
  } else if (role === 'EMPLOYEE') {
    query = `
      SELECT 
        COUNT(CASE WHEN status = 'PENDING' THEN 1 END) AS pending,
        COUNT(CASE WHEN status = 'IN_PROGRESS' THEN 1 END) AS in_progress,
        COUNT(CASE WHEN status = 'RESOLVED' THEN 1 END) AS resolved,
        COUNT(CASE WHEN status = 'REJECTED' THEN 1 END) AS rejected,
        COALESCE(AVG(actual_cost), 0) AS avg_repair_cost,
        COALESCE(SUM(actual_cost), 0) AS total_cost
      FROM maintenance_requests
      WHERE raised_by_id = $1 AND is_deleted = false
    `;
    const result = await pool.query(query, [departmentId]); // departmentId is actually userId
    return result.rows[0];
  }

  const result = await pool.query(query, params);
  return result.rows[0];
};
