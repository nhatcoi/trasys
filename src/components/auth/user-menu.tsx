'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export function UserMenu() {
    const { data: session, status } = useSession()
    const router = useRouter()

    if (status === 'loading') {
        return <div>Đang tải...</div>
    }

    if (!session) {
        return (
            <button
                onClick={() => router.push('/auth/signin')}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
                Đăng nhập
            </button>
        )
    }

    const handleSignOut = async () => {
        await signOut({ callbackUrl: '/' })
    }

    return (
        <div className="flex items-center space-x-4">
            <div className="text-sm">
                <p className="font-medium">Xin chào, {session.user?.name || session.user?.email}</p>
                {session.user?.name && (
                    <p className="text-gray-500">@{session.user.name}</p>
                )}
            </div>
            <button
                onClick={handleSignOut}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
                Đăng xuất
            </button>
        </div>
    )
}
