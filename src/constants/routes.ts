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
    FACULTY: '/hr/faculty',
    QUALIFICATIONS: '/hr/qualifications',
    EMPLOYEE_QUALIFICATIONS: '/hr/employee-qualifications',
    EMPLOYMENTS: '/hr/employments',
    PERFORMANCE_REVIEWS: '/hr/performance-reviews',
    ACADEMIC_TITLES: '/hr/academic-titles',
    EMPLOYEE_ACADEMIC_TITLES: '/hr/employee-academic-titles',
    TRAININGS: '/hr/trainings',
    EMPLOYEE_TRAININGS: '/hr/employee-trainings',
    EMPLOYEE_LOGS: '/hr/employee-logs',
    ROLES: '/hr/roles',
    PERMISSIONS: '/hr/permissions',
    ROLE_PERMISSIONS: '/hr/role-permissions',
    USER_ROLES: '/hr/user-roles',
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
        PERFORMANCE_REVIEWS: '/api/hr/performance-reviews',
        PERFORMANCE_REVIEWS_BY_ID: (id: string) => `/api/hr/performance-reviews/${id}`,
        ACADEMIC_TITLES: '/api/hr/academic-titles',
        ACADEMIC_TITLES_BY_ID: (id: string) => `/api/hr/academic-titles/${id}`,
        EMPLOYEE_ACADEMIC_TITLES: '/api/hr/employee-academic-titles',
        EMPLOYEE_ACADEMIC_TITLES_BY_ID: (id: string) => `/api/hr/employee-academic-titles/${id}`,
        TRAININGS: '/api/hr/trainings',
        TRAININGS_BY_ID: (id: string) => `/api/hr/trainings/${id}`,
        EMPLOYEE_TRAININGS: '/api/hr/employee-trainings',
        EMPLOYEE_TRAININGS_BY_ID: (id: string) => `/api/hr/employee-trainings/${id}`,
        EMPLOYEE_LOGS: '/api/hr/employee-logs',
        ROLES: '/api/hr/roles',
        ROLES_BY_ID: (id: string) => `/api/hr/roles/${id}`,
        PERMISSIONS: '/api/hr/permissions',
        PERMISSIONS_BY_ID: (id: string) => `/api/hr/permissions/${id}`,
        ROLE_PERMISSIONS: '/api/hr/role-permissions',
        ROLE_PERMISSIONS_BY_ID: (id: string) => `/api/hr/role-permissions/${id}`,
        USER_ROLES: '/api/hr/user-roles',
        USER_ROLES_BY_ID: (id: string) => `/api/hr/user-roles/${id}`,
        ME: '/api/hr/me',
    },
    ORG: {
        // Stats and overview
        STATS: '/api/org/stats',
        
        // Units
        UNITS: '/api/org/units',
        UNITS_BY_ID: (id: string) => `/api/org/units/${id}`,
        UNITS_AUDIT: '/api/org/units/audit',
        UNITS_HISTORY: (id: string) => `/api/org/units/${id}/history`,
        UNITS_STATUS: (id: string) => `/api/org/units/${id}/status`,
        
        // Structure requests
        STRUCTURE_REQUESTS: '/api/org/structure-requests',
        STRUCTURE_REQUESTS_BY_ID: (id: string) => `/api/org/structure-requests/${id}`,
        
        // Initial units
        INITIAL_UNITS: '/api/org/initial-units',
        
        // History
        HISTORY: '/api/org/history',
        
        // KPI
        KPI: {
            HEADCOUNT: '/api/org/kpi/headcount',
        },
    },
};

// Org Routes constants
export const ORG_ROUTES = {
    DASHBOARD: '/org/dashboard',
    TREE: '/org/tree',
    DIAGRAM: '/org/diagram',
    REPORTS: '/org/reports',
    HISTORY: '/org/unit/create/audit',

    
    // Unit management
    UNIT: '/org/unit',
    UNIT_DETAIL: (id: string) => `/org/unit/${id}`,
    
    // Unit creation workflow
    UNIT_CREATE: {
        DRAFT: '/org/unit/create/draft',
        REVIEW: '/org/unit/create/review',
        APPROVE: '/org/unit/create/approve',
        ACTIVATE: '/org/unit/create/activate',
        AUDIT: '/org/unit/create/audit',
    },
};
