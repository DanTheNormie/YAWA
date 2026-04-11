"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

export const Client = () => {
    const trpc = useTRPC();
    const { data } = useSuspenseQuery(trpc.getUsers.queryOptions());
    return (
        <div>
            Client: {JSON.stringify(data, null, 2)}
        </div>
    )
}