import { withAuth } from "next-auth/middleware";

export default withAuth(
    function middleware(req) {
        console.log('🔒 Middleware triggered for:', req.nextUrl.pathname)
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