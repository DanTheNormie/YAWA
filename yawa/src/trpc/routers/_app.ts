import { baseProcedure, createTRPCRouter, protectedProcedure } from '@/trpc/init';
import db from '@/lib/db';
import { inngest } from '@/inngest/client';
export const appRouter = createTRPCRouter({
  getWorkflows: protectedProcedure
    .query(() => {
      return db.workflow.findMany();
    }),
  createWorkflow: protectedProcedure
    .mutation(async () => {
      
      await inngest.send({
        name: "app/task.created",
        data: {
          id: "task-123",
        },
      });
      
      return db.workflow.create({
      data: {
        name: "test-workflow"
      }
    })})
});

// export type definition of API
export type AppRouter = typeof appRouter;