import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import InfiniteTweetList from "~/components/InfiniteTweetList";
import LoadingSpinner from "~/components/LoadingSpinner";
import NewTweetForm from "~/components/NewTweetForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/Tabs";
import { api } from "~/utils/api";

const Home: NextPage = () => {
    const session = useSession();
    return (
        <Tabs defaultValue="recent">
            <header className="sticky top-0 z-10 dark:bg-black/60 bg-white/60  backdrop-blur-lg">
                <h1 className="mb-2 px-4 py-2 text-lg font-bold">Home</h1>
                {session.status === "authenticated" &&
                    (
                        <TabsList className="grid grid-cols-2">
                            <TabsTrigger value="recent">
                                Recents
                            </TabsTrigger>
                            <TabsTrigger value="following">
                                Following
                            </TabsTrigger>
                        </TabsList>
                    )}
            </header>
            <NewTweetForm />
            <div className="pb-20 sm:pb-5">
                <TabsContent value="recent">
                    <RecentPosts />
                </TabsContent>
                <TabsContent value="following">
                    <FollowingPosts />
                </TabsContent>
            </div>
        </Tabs>
    );
};

const FollowingPosts = () => {
    const tweets = api.tweet.infinteFeed.useInfiniteQuery(
        {
            onlyFollowing: true,
        },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
        },
    );
    if (tweets.isLoading) return <LoadingSpinner />;
    if (tweets.isError) return <p>Error...</p>;
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

const RecentPosts = () => {
    const tweets = api.tweet.infinteFeed.useInfiniteQuery(
        {},
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
        },
    );
    if (tweets.isLoading) return <LoadingSpinner />;
    if (tweets.isError) return <div>Error...</div>;
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

export default Home;
