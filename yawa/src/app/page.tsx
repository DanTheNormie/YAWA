"use client"
import { LogoutButton } from "./LogoutButton";
import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

export default function Page() {
  const trpc = useTRPC()
  const { data } = useQuery(trpc.getWorkflows.queryOptions())
  const queryClient = useQueryClient()
  const create = useMutation(trpc.createWorkflow.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.getWorkflows.queryOptions())
    }
  }))
  
  return (
    <div className="min-h-screen min-w-screen flex flex-col items-center justify-center">
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <Button disabled={create.isPending} onClick={() => create.mutate()}>
        Create Workflow
      </Button>
      <LogoutButton />
    </div>
  );
}