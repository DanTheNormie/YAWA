"use client"
import { LogoutButton } from "./LogoutButton";
import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Page() {
  const trpc = useTRPC()
  const { data, isLoading } = useQuery(trpc.getWorkflows.queryOptions())
  const queryClient = useQueryClient()
  const create = useMutation(trpc.createWorkflow.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.getWorkflows.queryOptions())
    }
  }))
  const testAI = useMutation(trpc.testAI.mutationOptions({
    onSuccess: (data) => {
      toast.success(data.message)
    }
  }))
  
  return (
    <div className="min-h-screen min-w-screen flex gap-4 flex-col items-center justify-center">
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <Button disabled={create.isPending || isLoading} onClick={() => create.mutate()}>
        Create Workflow
      </Button>
      <Button disabled={testAI.isPending} onClick={() => testAI.mutate()}>
        Test AI
      </Button>
      <LogoutButton />
    </div>
  );
}