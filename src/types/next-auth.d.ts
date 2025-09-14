import NextAuth from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            username: string
            email: string
            name: string
            permissions: string[]
        }
    }

    interface JWT {
        id: string
        username: string
        permissions: string[]
    }
}