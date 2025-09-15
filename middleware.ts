import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Định nghĩa quyền hạn cho từng route
const ROUTE_PERMISSIONS: Record<string, string[]> = {
    '/hr/dashboard': ['hr.dashboard.view'],
    '/hr/employees': ['hr.employees.view'],
    '/hr/employees/new': ['hr.employees.create'],
    '/hr/employees/[id]/edit': ['hr.employees.update'],
    '/hr/roles': ['hr.roles.view'],
    '/hr/roles/new': ['hr.roles.create'],
    '/hr/roles/[id]/edit': ['hr.roles.update'],
    '/hr/permissions': ['hr.permissions.view'],
    '/hr/permissions/new': ['hr.permissions.create'],
    '/hr/permissions/[id]/edit': ['hr.permissions.update'],
    '/hr/role-permissions': ['hr.role_permissions.view'],
    '/hr/role-permissions/new': ['hr.role_permissions.create'],
    '/hr/user-roles': ['hr.user_roles.view'],
    '/hr/user-roles/new': ['hr.user_roles.create'],
    '/hr/employee-logs': ['hr.employee_logs.view'],
    '/hr/performance-reviews': ['hr.performance_reviews.view'],
    '/hr/performance-reviews/new': ['hr.performance_reviews.create'],
    '/hr/academic-titles': ['hr.academic_titles.view'],
    '/hr/academic-titles/new': ['hr.academic_titles.create'],
    '/hr/academic-titles/[id]/edit': ['hr.academic_titles.update'],
    '/hr/employee-academic-titles': ['hr.employee_academic_titles.view'],
    '/hr/employee-academic-titles/new': ['hr.employee_academic_titles.create'],
    '/hr/trainings': ['hr.trainings.view'],
    '/hr/trainings/new': ['hr.trainings.create'],
    '/hr/trainings/[id]/edit': ['hr.trainings.update'],
    '/hr/employee-trainings': ['hr.employee_trainings.view'],
    '/hr/employee-trainings/new': ['hr.employee_trainings.create'],
    '/hr/qualifications': ['hr.qualifications.view'],
    '/hr/qualifications/new': ['hr.qualifications.create'],
    '/hr/qualifications/[id]/edit': ['hr.qualifications.update'],
    '/hr/employee-qualifications': ['hr.employee_qualifications.view'],
    '/hr/employee-qualifications/new': ['hr.employee_qualifications.create'],
    '/hr/employments': ['hr.employments.view'],
    '/hr/employments/new': ['hr.employments.create'],
    '/hr/employments/[id]/edit': ['hr.employments.update'],
    '/hr/org-structure': ['hr.org_structure.view'],
    '/hr/org-tree': ['hr.org_tree.view'],
    '/hr/faculty': ['hr.faculty.view'],
    '/hr/university-overview': ['hr.university_overview.view'],
    '/hr/reports': ['hr.reports.view'],
    '/hr/profile': ['hr.profile.view'],
    '/hr/change-password': ['hr.profile.update'],
};

// API routes permissions
const API_ROUTE_PERMISSIONS: Record<string, string[]> = {
    'GET:/api/hr/employees': ['hr.employees.view'],
    'POST:/api/hr/employees': ['hr.employees.create'],
    'PUT:/api/hr/employees/[id]': ['hr.employees.update'],
    'DELETE:/api/hr/employees/[id]': ['hr.employees.delete'],
    'GET:/api/hr/roles': ['hr.roles.view'],
    'POST:/api/hr/roles': ['hr.roles.create'],
    'PUT:/api/hr/roles/[id]': ['hr.roles.update'],
    'DELETE:/api/hr/roles/[id]': ['hr.roles.delete'],
    'GET:/api/hr/permissions': ['hr.permissions.view'],
    'POST:/api/hr/permissions': ['hr.permissions.create'],
    'PUT:/api/hr/permissions/[id]': ['hr.permissions.update'],
    'DELETE:/api/hr/permissions/[id]': ['hr.permissions.delete'],
    'GET:/api/hr/role-permissions': ['hr.role_permissions.view'],
    'POST:/api/hr/role-permissions': ['hr.role_permissions.create'],
    'DELETE:/api/hr/role-permissions/[id]': ['hr.role_permissions.delete'],
    'GET:/api/hr/user-roles': ['hr.user_roles.view'],
    'POST:/api/hr/user-roles': ['hr.user_roles.create'],
    'DELETE:/api/hr/user-roles/[id]': ['hr.user_roles.delete'],
    'GET:/api/hr/employee-logs': ['hr.employee_logs.view'],
    'GET:/api/hr/performance-reviews': ['hr.performance_reviews.view'],
    'POST:/api/hr/performance-reviews': ['hr.performance_reviews.create'],
    'GET:/api/hr/academic-titles': ['hr.academic_titles.view'],
    'POST:/api/hr/academic-titles': ['hr.academic_titles.create'],
    'PUT:/api/hr/academic-titles/[id]': ['hr.academic_titles.update'],
    'DELETE:/api/hr/academic-titles/[id]': ['hr.academic_titles.delete'],
    'GET:/api/hr/employee-academic-titles': ['hr.employee_academic_titles.view'],
    'POST:/api/hr/employee-academic-titles': ['hr.employee_academic_titles.create'],
    'PUT:/api/hr/employee-academic-titles/[id]': ['hr.employee_academic_titles.update'],
    'DELETE:/api/hr/employee-academic-titles/[id]': ['hr.employee_academic_titles.delete'],
    'GET:/api/hr/trainings': ['hr.trainings.view'],
    'POST:/api/hr/trainings': ['hr.trainings.create'],
    'PUT:/api/hr/trainings/[id]': ['hr.trainings.update'],
    'DELETE:/api/hr/trainings/[id]': ['hr.trainings.delete'],
    'GET:/api/hr/employee-trainings': ['hr.employee_trainings.view'],
    'POST:/api/hr/employee-trainings': ['hr.employee_trainings.create'],
    'PUT:/api/hr/employee-trainings/[id]': ['hr.employee_trainings.update'],
    'DELETE:/api/hr/employee-trainings/[id]': ['hr.employee_trainings.delete'],
    'GET:/api/hr/qualifications': ['hr.qualifications.view'],
    'POST:/api/hr/qualifications': ['hr.qualifications.create'],
    'PUT:/api/hr/qualifications/[id]': ['hr.qualifications.update'],
    'DELETE:/api/hr/qualifications/[id]': ['hr.qualifications.delete'],
    'GET:/api/hr/employee-qualifications': ['hr.employee_qualifications.view'],
    'POST:/api/hr/employee-qualifications': ['hr.employee_qualifications.create'],
    'PUT:/api/hr/employee-qualifications/[id]': ['hr.employee_qualifications.update'],
    'DELETE:/api/hr/employee-qualifications/[id]': ['hr.employee_qualifications.delete'],
    'GET:/api/hr/employments': ['hr.employments.view'],
    'POST:/api/hr/employments': ['hr.employments.create'],
    'PUT:/api/hr/employments/[id]': ['hr.employments.update'],
    'DELETE:/api/hr/employments/[id]': ['hr.employments.delete'],
};

export default withAuth(
    function middleware(req) {
        const { pathname } = req.nextUrl;
        const method = req.method;

        console.log('🔒 Middleware triggered for:', method, pathname);

        // Kiểm tra quyền hạn cho API routes
        if (pathname.startsWith('/api/hr/')) {
            const apiKey = `${method}:${pathname}`;
            const requiredPermissions = API_ROUTE_PERMISSIONS[apiKey];

            if (requiredPermissions && req.nextauth.token?.permissions) {
                const userPermissions = req.nextauth.token.permissions as string[];
                const hasPermission = requiredPermissions.some(permission =>
                    userPermissions.includes(permission)
                );

                if (!hasPermission) {
                    console.log('❌ Access denied - Missing permissions:', requiredPermissions);
                    return NextResponse.json(
                        { error: 'Access denied - Insufficient permissions' },
                        { status: 403 }
                    );
                }
            }
        }

        // Kiểm tra quyền hạn cho page routes
        const requiredPermissions = ROUTE_PERMISSIONS[pathname];
        if (requiredPermissions && req.nextauth.token?.permissions) {
            const userPermissions = req.nextauth.token.permissions as string[];
            const hasPermission = requiredPermissions.some(permission =>
                userPermissions.includes(permission)
            );

            if (!hasPermission) {
                console.log('❌ Access denied - Missing permissions:', requiredPermissions);
                return NextResponse.redirect(new URL('/hr/dashboard', req.url));
            }
        }

        console.log('✅ Access granted');
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token, // Chỉ cho phép truy cập nếu đã đăng nhập
        },
    }
)

export const config = {
    matcher: [
        '/api/org/:path*',
        '/org/:path*',
        '/dashboard',
        '/employees/:path*',
        '/settings/:path*',
        '/profile/:path*',
        '/hr/:path*'
    ]
}