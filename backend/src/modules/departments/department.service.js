import * as repo from './department.repository.js';

export const getDepartments = async (filters) => {
  return repo.getDepartments(filters);
};

export const getDepartmentById = async (id) => {
  const dept = await repo.getDepartmentById(id);
  if (!dept) {
    throw Object.assign(new Error('Department not found'), { statusCode: 404 });
  }
  return dept;
};

export const getDepartmentTree = async () => {
  return repo.getDepartmentTree();
};

export const getDepartmentStats = async () => {
  return repo.getDepartmentStats();
};

export const getDepartmentEmployees = async (id) => {
  await getDepartmentById(id); // Check existence
  return repo.getDepartmentEmployees(id);
};

export const getDepartmentAssets = async (id) => {
  await getDepartmentById(id); // Check existence
  return repo.getDepartmentAssets(id);
};

export const createDepartment = async (data, userId) => {
  // 1. Duplicate check
  const exists = await repo.departmentExists(data.name);
  if (exists) {
    throw Object.assign(new Error('A department with this name already exists.'), { statusCode: 400 });
  }

  // 2. Manager check
  if (data.manager_id) {
    const isAssigned = await repo.isManagerAssignedElsewhere(data.manager_id);
    if (isAssigned) {
      throw Object.assign(new Error('This employee is already heading another department.'), { statusCode: 400 });
    }
  }

  // 3. Insert department
  const dept = await repo.createDepartment(data);

  // 4. Update Manager details if assigned
  if (data.manager_id) {
    await repo.updateUserDepartment(data.manager_id, dept.id);
    await repo.createNotification(
      data.manager_id,
      'SYSTEM',
      'Assigned as Department Head',
      `You have been assigned as the Department Head of the ${dept.name} department.`
    );
  }

  // 5. Activity log
  await repo.createActivityLog(
    userId,
    'DEPARTMENT_CREATED',
    'Organisation',
    'Department',
    dept.id,
    { name: dept.name, manager_id: dept.manager_id }
  );

  return dept;
};

export const updateDepartment = async (id, data, userId) => {
  const dept = await getDepartmentById(id);

  // 1. Duplicate check
  if (data.name && data.name !== dept.name) {
    const exists = await repo.departmentExists(data.name, id);
    if (exists) {
      throw Object.assign(new Error('A department with this name already exists.'), { statusCode: 400 });
    }
  }

  // 2. Circular loop check
  if (data.parent_id) {
    if (data.parent_id === id) {
      throw Object.assign(new Error('A department cannot be its own parent.'), { statusCode: 400 });
    }
    const children = await repo.getDescendants(id);
    if (children.includes(data.parent_id)) {
      throw Object.assign(new Error('Circular relationship detected: Parent department cannot be a child of this department.'), { statusCode: 400 });
    }
  }

  // 3. Manager check
  if (data.manager_id && data.manager_id !== dept.manager_id) {
    const isAssigned = await repo.isManagerAssignedElsewhere(data.manager_id, id);
    if (isAssigned) {
      throw Object.assign(new Error('This employee is already heading another department.'), { statusCode: 400 });
    }
  }

  // 4. Update details
  const updatedDept = await repo.updateDepartment(id, data);

  // 5. Notifications & Logs
  if (data.manager_id !== undefined && data.manager_id !== dept.manager_id) {
    // Manager changed
    if (dept.manager_id) {
      await repo.createNotification(
        dept.manager_id,
        'SYSTEM',
        'Removed as Department Head',
        `You are no longer assigned as the Department Head of the ${dept.name} department.`
      );
    }

    if (data.manager_id) {
      await repo.updateUserDepartment(data.manager_id, id);
      await repo.createNotification(
        data.manager_id,
        'SYSTEM',
        'Assigned as Department Head',
        `You have been assigned as the Department Head of the ${updatedDept.name} department.`
      );
    }

    await repo.createActivityLog(
      userId,
      'DEPARTMENT_HEAD_CHANGED',
      'Organisation',
      'Department',
      id,
      { old_manager_id: dept.manager_id, new_manager_id: data.manager_id }
    );
  } else {
    // Normal updates
    await repo.createActivityLog(
      userId,
      'DEPARTMENT_UPDATED',
      'Organisation',
      'Department',
      id,
      { name: updatedDept.name, parent_id: updatedDept.parent_id }
    );
  }

  return updatedDept;
};

export const deleteDepartment = async (id, userId) => {
  const dept = await getDepartmentById(id);

  // 1. Dependency checks
  const deps = await repo.hasDependentRecords(id);
  if (deps.hasEmployees || deps.hasAssets || deps.hasBookings || deps.hasMaintenance || deps.hasAudits) {
    throw Object.assign(new Error('Department cannot be deleted because it contains active records.'), { statusCode: 400 });
  }

  // 2. Delete
  const deleted = await repo.deleteDepartment(id);

  // 3. Clear manager if existed
  if (dept.manager_id) {
    await repo.createNotification(
      dept.manager_id,
      'SYSTEM',
      'Department Disbanded',
      `The department ${dept.name} you headed has been deleted/disbanded.`
    );
  }

  // 4. Activity log
  await repo.createActivityLog(
    userId,
    'DEPARTMENT_DELETED',
    'Organisation',
    'Department',
    id,
    { name: dept.name }
  );

  return deleted;
};
