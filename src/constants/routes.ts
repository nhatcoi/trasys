// HR Routes constants
export const HR_ROUTES = {
    DASHBOARD: '/hr/dashboard',
    EMPLOYEES: '/hr/employees',
    EMPLOYEES_NEW: '/hr/employees/new',
    EMPLOYEES_DETAIL: (id: string) => `/hr/employees/${id}`,
    EMPLOYEES_EDIT: (id: string) => `/hr/employees/${id}/edit`,
    ASSIGNMENTS: '/hr/assignments',
    PROFILE: '/hr/profile',
    CHANGE_PASSWORD: '/hr/change-password',
    UNIVERSITY_OVERVIEW: '/hr/university-overview',
    ORG_STRUCTURE: '/hr/org-structure',
    FACULTY: '/hr/faculty',
};

// API Routes constants
export const API_ROUTES = {
    EMPLOYEES: '/api/hr/employees',
    USERS: '/api/hr/users',
    ORG_UNITS: '/api/org/units',
    ASSIGNMENTS: '/api/hr/assignments',
};

// Org Routes constants
export const ORG_ROUTES = {
    DASHBOARD: '/org/dashboard',
    TREE: '/org/tree',
    UNIT: '/org/unit',
};
