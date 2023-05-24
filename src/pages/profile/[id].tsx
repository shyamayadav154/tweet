import type {
    GetStaticPaths,
    GetStaticPropsContext,
    InferGetStaticPropsType,
    NextPage,
} from "next";
import { signIn, useSession } from "next-auth/react";
import ErrorPage from "next/error";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { VscArrowLeft } from "react-icons/vsc";
import InfiniteTweetList from "~/components/InfiniteTweetList";
import LoadingSpinner from "~/components/LoadingSpinner";
import ProfileImage from "~/components/ProfileImage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/Tabs";
import { ssgHelper } from "~/server/api/ssgHelper";
import { api } from "~/utils/api";
import { getPulral } from "~/utils/profile";

const ProfilePage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
    id,
}) => {
    const { data: profile, status } = api.profile.getById.useQuery({
        id,
    });

    const trpcUtils = api.useContext();
    const toggleFollow = api.profile.toggleFollow.useMutation({
        onSuccess: () => {
            void trpcUtils.profile.getById.invalidate();
        },
    });

    if (status !== "success") return <LoadingSpinner />;

    if (profile == null || profile.name == null) {
        return <ErrorPage statusCode={404} />;
    }

    return (
        <>
            <Head>
                <title>{`Twitter Clone - ${profile?.name}`}</title>
            </Head>

            <header className="sticky top-0 z-10 flex items-center gap-2 dark dark:border-zinc-800 border-b dark:bg-black/80 bg-white/80 backdrop-blur-xl p-2">
                <Link
                    className="p-2 hover:bg-gray-50 dark:hover:bg-zinc-900 rounded-full"
                    href=".."
                >
                    <VscArrowLeft className="h-6 w-6 dark:text-zinc-400 text-gray-600" />
                </Link>
                {profile.image && <ProfileImage src={profile.image} />}
                <div className="flex-1">
                    <div className="flex flex-1 items-center gap-2">
                        <h1 className="font-bold dark:text-zinc-100 ">{profile.name}</h1>
                    </div>
                    <div className="text-sm capitalize dark:text-zinc-400 text-gray-500">
                        {profile.tweetsCount}&nbsp;
                        {getPulral(profile.tweetsCount, "tweet", "tweets")} &#x2022;&nbsp;
                        {profile.followersCount}&nbsp;
                        {getPulral(profile.followersCount, "follower", "followers")}{" "}
                        &#x2022;&nbsp;
                        {profile.followsCount}&nbsp;
                        {getPulral(profile.followsCount, "following", "following")}&nbsp;
                    </div>
                </div>
                <FollowButton
                    isFollowing={profile.isFollowing}
                    userId={id}
                    isLoading={toggleFollow.isLoading}
                    onClick={() =>
                        toggleFollow.mutate({
                            userId: id,
                        })}
                />
            </header>
            <main>
                <header className="">
                    <Tabs defaultValue="tweet" className="pb-20 ">
                        <TabsList className="grid grid-cols-3">
                            <TabsTrigger value="tweet">Tweets</TabsTrigger>
                            <TabsTrigger value="replies">Replies</TabsTrigger>
                            <TabsTrigger value="likes">Likes</TabsTrigger>
                        </TabsList>
                        <TabsContent value="tweet">
                            <UserPosts id={id} />
                        </TabsContent>
                        <TabsContent value="replies">
                            <RepliedPosts id={id} />
                        </TabsContent>
                        <TabsContent value="likes">
                            <LikedPosts id={id} />
                        </TabsContent>
                    </Tabs>
                </header>
            </main>
        </>
    );
};

const LikedPosts = ({ id }: { id: string }) => {
    const tweets = api.tweet.infineteLikedFeed.useInfiniteQuery(
        {
            userId: id,
        },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
        },
    );
    return (
        <InfiniteTweetList
            tweets={tweets.data?.pages.flatMap((page) => page.tweets)}
            isError={tweets.isError}
            isLoading={tweets.isLoading}
            hasMore={!!tweets.hasNextPage}
            fetchNewTweets={tweets.fetchNextPage}
        />
    );
};

const RepliedPosts = ({ id }: { id: string }) => {
    const tweets = api.tweet.infineteReplyFeed.useInfiniteQuery(
        {
            userId: id,
        },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
        },
    );
    return (
        <InfiniteTweetList
            tweets={tweets.data?.pages.flatMap((page) => page.tweets)}
            isError={tweets.isError}
            isLoading={tweets.isLoading}
            hasMore={!!tweets.hasNextPage}
            fetchNewTweets={tweets.fetchNextPage}
        />
    );
};

const UserPosts = ({ id }: { id: string }) => {
    const tweets = api.tweet.infiniteProfileFeed.useInfiniteQuery(
        {
            userId: id,
        },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
        },
    );
    return (
        <InfiniteTweetList
            tweets={tweets.data?.pages.flatMap((page) => page.tweets)}
            isError={tweets.isError}
            isLoading={tweets.isLoading}
            hasMore={!!tweets.hasNextPage}
            fetchNewTweets={tweets.fetchNextPage}
        />
    );
};

type FollowButtonProps = {
    isFollowing?: boolean;
    isLoading: boolean;
    userId?: string;
    onClick: () => void;
};
const FollowButton = ({
    isFollowing,
    userId,
    isLoading,
    onClick,
}: FollowButtonProps) => {
    const session = useSession();
    const [unFollowText, setUnFollowText] = useState<"Unfollow" | "Following">(
        "Following",
    );

    if (session?.data?.user.id === userId) {
        return null;
    }

    return (
        <button
            onClick={() => {
                if (session.status !== "authenticated") {
                    return signIn();
                }
                onClick();
            }}
            onMouseEnter={() => setUnFollowText("Unfollow")}
            onMouseLeave={() => setUnFollowText("Following")}
            disabled={isLoading}
            className={`px-3 ${isFollowing
                    ? "text-black bg-white hover:bg-red-100 dark:hover:bg-black dark:hover:border-red-400 hover:border-red-300 hover:text-red-500 w-[106px]"
                    : "bg-black text-white hover:bg-opacity-90"
                } font-bold py-1.5 border rounded-full`}
        >
            {isFollowing ? unFollowText : "Follow"}
        </button>
    );
};
export default ProfilePage;

export const getStaticProps = async (
    context: GetStaticPropsContext<{
        id: string;
    }>,
) => {
    const id = context.params?.id;

    if (id == null) {
        return {
            redirect: {
                destination: "/",
            },
        };
    }

    const ssg = ssgHelper();
    await ssg.profile.getById.prefetch({ id });

    return {
        props: {
            trpcState: ssg.dehydrate(),
            id,
        },
    };
};

export const getStaticPaths: GetStaticPaths = () => {
    return {
        paths: [],
        fallback: "blocking",
    };
};
