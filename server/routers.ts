import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { fetchPlayers, fetchMatches, fetchPlayerById, fetchMatchById } from "./scf";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  players: router({
    list: publicProcedure.query(async () => {
      return await fetchPlayers();
    }),
    getById: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        return await fetchPlayerById(input.id);
      }),
  }),

  matches: router({
    list: publicProcedure.query(async () => {
      return await fetchMatches();
    }),
    getById: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        return await fetchMatchById(input.id);
      }),
  }),
});

export type AppRouter = typeof appRouter;
