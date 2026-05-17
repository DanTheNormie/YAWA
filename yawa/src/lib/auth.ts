import { betterAuth } from "better-auth";
import { checkout, polar, portal } from '@polar-sh/better-auth'
import { prismaAdapter } from "better-auth/adapters/prisma";
import { polarClient } from "@/lib/polar";

import db from "@/lib/db";

export const auth = betterAuth({
    database: prismaAdapter(db, {
        provider: 'postgresql'
    }),
    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
    },
    plugins:[
        polar({
            client: polarClient,
            createCustomerOnSignUp: true,
            use: [
                checkout({
                    products:[
                        {
                            productId:"b19414c1-b492-4bdf-96ec-6d466efc0f92",
                            slug:"pro"
                        }
                    ],
                    successUrl: process.env.POLAR_SUCCESS_URL,
                    authenticatedUsersOnly:true,
                }),
                portal()
            ]
        })
    ]
})
