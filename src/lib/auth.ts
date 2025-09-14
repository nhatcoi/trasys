// NextAuth configuration
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from './db'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
    session: {
        strategy: 'jwt'
    },
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                identifier: { label: 'Username or Email', type: 'text', placeholder: 'ziet' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.identifier || !credentials?.password) {
                    return null
                }

                // Tìm user bằng email hoặc username
                const user = await db.user.findFirst({
                    where: {
                        OR: [
                            { email: credentials.identifier },
                            { username: credentials.identifier }
                        ]
                    }
                })

                if (!user) {
                    return null
                }

                // So sánh password
                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password_hash
                )

                if (!isPasswordValid) {
                    return null
                }

                // Lấy permissions của user thông qua roles
                const userRoles = await db.user_role.findMany({
                    where: { user_id: user.id },
                    include: {
                        roles: {
                            include: {
                                role_permission: {
                                    include: {
                                        permissions: true
                                    }
                                }
                            }
                        }
                    }
                });

                // Flatten permissions từ tất cả roles
                const permissions = userRoles.flatMap(ur =>
                    ur.roles.role_permission.map(rp => rp.permissions.code)
                );

                return {
                    id: user.id.toString(),
                    username: user.username,
                    email: user.email,
                    full_name: user.full_name,
                    permissions: permissions
                }
            },

        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            return true // Cho phép đăng nhập
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.username = user.username
                token.permissions = (user as any).permissions
            }
            return token
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string
                session.user.username = token.username as string
                session.user.permissions = token.permissions as string[]
            }
            return session
        }
    },
    pages: {
        signIn: '/auth/signin',
    }
}