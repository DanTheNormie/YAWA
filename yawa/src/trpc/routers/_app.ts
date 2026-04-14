import { baseProcedure, createTRPCRouter, protectedProcedure } from '@/trpc/init';
import db from '@/lib/db';
export const appRouter = createTRPCRouter({
  getUsers: protectedProcedure
    .query(({ctx}) => {
      console.log(ctx.auth.user.id)
      return db.user.findMany({
        where: {
          id: ctx.auth.user.id
        }
      });
    }),
});

// export type definition of API
export type AppRouter = typeof appRouter;