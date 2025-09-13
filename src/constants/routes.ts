// HR Routes constants
export const HR_ROUTES = {
    DASHBOARD: '/hr/dashboard',
    EMPLOYEES: '/hr/employees',
    EMPLOYEES_NEW: '/hr/employees/new',
    EMPLOYEES_DETAIL: (id: string) => `/hr/employees/${id}`,
    EMPLOYEES_EDIT: (id: string) => `/hr/employees/${id}/edit`,
    ASSIGNMENTS: '/hr/assignments',
    ASSIGNMENTS_NEW: '/hr/assignments/new',
    ASSIGNMENTS_DETAIL: (id: string) => `/hr/assignments/${id}`,
    ASSIGNMENTS_EDIT: (id: string) => `/hr/assignments/${id}/edit`,
    PROFILE: '/hr/profile',
    CHANGE_PASSWORD: '/hr/change-password',
    UNIVERSITY_OVERVIEW: '/hr/university-overview',
    ORG_STRUCTURE: '/hr/org-structure',
    ORG_TREE: '/hr/org-tree',
    ORG_TREE_DETAIL: (id: string) => `/hr/org-tree/${id}`,
    ORG_TREE_EMPLOYEES: (id: string) => `/hr/org-tree/${id}/employees`,
    ORG_UNITS: '/hr/org-units',
    ORG_UNITS_NEW: '/hr/org-units/new',
    ORG_UNITS_DETAIL: (id: string) => `/hr/org-units/${id}`,
    ORG_UNITS_EDIT: (id: string) => `/hr/org-units/${id}/edit`,
    FACULTY: '/hr/faculty',
    QUALIFICATIONS: '/hr/qualifications',
    EMPLOYEE_QUALIFICATIONS: '/hr/employee-qualifications',
    EMPLOYMENTS: '/hr/employments',
    REPORTS: '/hr/reports',
};

// API Routes constants
export const API_ROUTES = {
    HR: {
        EMPLOYEES: '/api/hr/employees',
        EMPLOYEES_BY_ID: (id: string) => `/api/hr/employees/${id}`,
        USERS: '/api/hr/users',
        USERS_BY_ID: (id: string) => `/api/hr/users/${id}`,
        ASSIGNMENTS: '/api/hr/assignments',
        ASSIGNMENTS_BY_ID: (id: string) => `/api/hr/assignments/${id}`,
        QUALIFICATIONS: '/api/hr/qualifications',
        QUALIFICATIONS_BY_ID: (id: string) => `/api/hr/qualifications/${id}`,
        EMPLOYEE_QUALIFICATIONS: '/api/hr/employee-qualifications',
        EMPLOYEE_QUALIFICATIONS_BY_ID: (id: string) => `/api/hr/employee-qualifications/${id}`,
        EMPLOYMENTS: '/api/hr/employments',
        EMPLOYMENTS_BY_ID: (id: string) => `/api/hr/employments/${id}`,
        ME: '/api/hr/me',
    },
    ORG: {
        UNITS: '/api/org/units',
        UNITS_BY_ID: (id: string) => `/api/org/units/${id}`,
        KPI: {
            HEADCOUNT: '/api/org/kpi/headcount',
        },
    },
};

// Org Routes constants
export const ORG_ROUTES = {
    DASHBOARD: '/org/dashboard',
    TREE: '/org/tree',
    UNIT: '/org/unit',
};
