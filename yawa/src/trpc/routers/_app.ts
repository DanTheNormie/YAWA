import { baseProcedure, createTRPCRouter } from '@/trpc/init';
import db from '@/lib/db';
export const appRouter = createTRPCRouter({
  getUsers: baseProcedure
    .query(() => {
      return db.user.findMany();
    }),
});

// export type definition of API
export type AppRouter = typeof appRouter;