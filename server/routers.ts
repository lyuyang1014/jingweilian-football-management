import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { fetchPlayers, fetchMatches, fetchPlayerById, fetchMatchById, fetchSignups, fetchAppreciations } from "./scf";
import { fetchGoalRecordsFromCloud } from "./wechat-cloud";

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

  // Signups: player attendance records from WeChat Cloud `signups` collection
  // _openid is mapped to openid for frontend compatibility
  signups: router({
    list: publicProcedure.query(async () => {
      return await fetchSignups();
    }),
  }),

  // Appreciations: peer recognition records from WeChat Cloud `event_appreciations` collection
  // Used by frontend to calculate MVP count per player (most appreciations received in a match)
  appreciations: router({
    list: publicProcedure.query(async () => {
      return await fetchAppreciations();
    }),
  }),

  // Goal records: goal and assist records from WeChat Cloud `goal_records` collection
  goalRecords: router({
    list: publicProcedure.query(async () => {
      return await fetchGoalRecordsFromCloud();
    }),
  }),
});

export type AppRouter = typeof appRouter;
