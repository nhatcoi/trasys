import { NextRequest, NextResponse } from 'next/server';

// Hợp nhất endpoint: Redirect sang /api/hr/employee-logs, giữ nguyên query params
export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const redirectUrl = new URL('/api/hr/employee-logs', url.origin);
    redirectUrl.search = url.search; // preserve query
    return NextResponse.redirect(redirectUrl, { status: 307 });
}
