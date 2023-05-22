import * as Tabs from "@radix-ui/react-tabs";
import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import InfiniteTweetList from "~/components/InfiniteTweetList";
import LoadingSpinner from "~/components/LoadingSpinner";
import NewTweetForm from "~/components/NewTweetForm";
import { api } from "~/utils/api";

const Home: NextPage = () => {
    const session = useSession();
    return (
        <Tabs.Root defaultValue="recent">
            <header className="sticky top-0 z-10 dark:bg-black/60 bg-white/60  backdrop-blur-lg">
                <Tabs.List>
                    <h1 className="mb-2 px-4 py-2 text-lg font-bold">Home</h1>

                    {session.status === "authenticated" &&
                        (
                            <div className="grid grid-cols-2 font-bold dark:border-zinc-800 border-b">
                                <Tabs.Trigger
                                    className="group py-3 transition-colors dark:hover:bg-zinc-800 hover:bg-gray-100  "
                                    value="recent"
                                >
                                    <span className="border-b-2 border-transparent py-3 dark:text-zinc-400 text-gray-500 group-data-[state=active]:border-blue-500  group-data-[state=active]:text-black dark:group-data-[state=active]:text-white ">
                                        Recents
                                    </span>
                                </Tabs.Trigger>
                                <Tabs.Trigger
                                    className="group py-3 transition-colors dark:hover:bg-zinc-800 duration-200 hover:bg-gray-50 "
                                    value="following"
                                >
                                    <span className="border-b-2 border-transparent pb-3 dark:text-zinc-400 text-gray-500 group-data-[state=active]:border-blue-500   group-data-[state=active]:text-black dark:group-data-[state=active]:text-white ">
                                        Following
                                    </span>
                                </Tabs.Trigger>
                            </div>
                        )}
                </Tabs.List>
            </header>
            <NewTweetForm />
            <div className="pb-20 sm:pb-5">
                <Tabs.Content value="recent">
                    <RecentPosts />
                </Tabs.Content>
                <Tabs.Content value="following">
                    <FollowingPosts />
                </Tabs.Content>
            </div>
        </Tabs.Root>
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
