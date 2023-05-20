import { Prisma } from "@prisma/client";
import { inferAsyncReturnType } from "@trpc/server";
import { z } from "zod";

import {
    createTRPCContext,
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "~/server/api/trpc";

export const tweetRouter = createTRPCRouter({
    toggleLike: protectedProcedure.input(z.object({
        id: z.string(),
    })).mutation(async ({ input, ctx }) => {
        const data = { tweetId: input.id, userId: ctx.session.user.id };
        const existingLike = await ctx.prisma.like.findUnique({
            where: {
                userId_tweetId: data,
            },
        });

        if (existingLike == null) {
            await ctx.prisma.like.create({
                data,
            });
            return { addedLike: true };
        } else {
            await ctx.prisma.like.delete({
                where: {
                    userId_tweetId: data,
                },
            });
            return { addedLike: false };
        }
    }),
    infiniteProfileFeed: publicProcedure.input(z.object({
        userId: z.string(),
        limit: z.number().optional(),
        cursor: z.object({
            id: z.string(),
            createdAt: z.date(),
        }).optional(),
    })).query(async ({ input: { userId, limit = 10, cursor }, ctx }) => {
        return await getInfiteTweet({
            limit,
            cursor,
            ctx,
            whereClause: { userId },
        });
    }),
    infinteFeed: publicProcedure.input(
        z.object({
            onlyFollowing: z.boolean().optional(),
            userId: z.string().optional(),
            limit: z.number().optional(),
            cursor: z.object({
                id: z.string(),
                createdAt: z.date(),
            }).optional(),
        }),
    ).query(
        async ({ input: { limit = 10, cursor, onlyFollowing = false }, ctx }) => {
            const currentUserId = ctx.session?.user.id;
            return getInfiteTweet({
                ctx,
                limit,
                whereClause: currentUserId == null || !onlyFollowing ? undefined : {
                    user: {
                        followers: {
                            some: {
                                id: currentUserId,
                            },
                        },
                    },
                },
                cursor,
            });
        },
    ),
    create: protectedProcedure.input(z.object({
        content: z.string(),
    })).mutation(async ({ input, ctx }) => {
        void ctx.revalidateSSG?.(`/profile/${ctx.session.user.id}`);

        return await ctx.prisma.tweet.create({
            data: {
                content: input.content,
                userId: ctx.session.user.id,
            },
        });
    }),
});

type InfiniteFeedInput = {
    whereClause?: Prisma.TweetWhereInput;
    limit: number;
    cursor?: {
        id: string;
        createdAt: Date;
    };
    ctx: inferAsyncReturnType<typeof createTRPCContext>;
};

async function getInfiteTweet(
    { ctx, limit, cursor, whereClause }: InfiniteFeedInput,
) {
    const currentUserId = ctx.session?.user.id;

    const data = await ctx.prisma.tweet.findMany({
        take: limit + 1,
        cursor: cursor ? { createdAt_id: cursor } : undefined,
        orderBy: [{
            createdAt: "desc",
        }, {
            id: "desc",
        }],
        where: whereClause,
        select: {
            id: true,
            content: true,
            createdAt: true,
            _count: { select: { likes: true } },
            likes: currentUserId == null ? false : {
                where: {
                    userId: currentUserId,
                },
            },
            user: {
                select: {
                    name: true,
                    id: true,
                    image: true,
                },
            },
        },
    });
    let nextCursor: typeof cursor | undefined;
    if (data.length > limit) {
        const nextItem = data.pop();
        if (nextItem != undefined) {
            nextCursor = {
                id: nextItem.id,
                createdAt: nextItem.createdAt,
            };
        }
    }

    return {
        tweets: data.map((tweet) => ({
            id: tweet.id,
            content: tweet.content,
            createdAt: tweet.createdAt,
            likeCount: tweet._count.likes,
            isLiked: tweet.likes?.length > 0,
            user: tweet.user,
        })),
        nextCursor,
    };
}
