import { createTRPCRouter, protectedProcedure } from '@/trpc/init';
import db from '@/lib/db';
import { inngest } from '@/inngest/client';
export const appRouter = createTRPCRouter({
  testAI: protectedProcedure.mutation(async () => {
    try{
      await inngest.send({
        name: "exec/ai",
      })
    }catch(error){
      console.trace(error)
      return {
        success: false,
        message: "AI execution failed"
      }
    }
    return {
      success: true,
      message: "AI execution triggered"
    }
  }),
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