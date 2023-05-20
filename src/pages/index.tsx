import * as Tabs from "@radix-ui/react-tabs";
import { type NextPage } from "next";
import InfiniteTweetList from "~/components/InfiniteTweetList";
import NewTweetForm from "~/components/NewTweetForm";
import { api } from "~/utils/api";

const Home: NextPage = () => {
    return (
        <Tabs.Root defaultValue="recent">
            <header className="sticky top-0 z-10 bg-white/80  backdrop-blur-lg">
                <Tabs.List>
                    <h1 className="mb-2 px-4 py-2 text-lg font-bold">Home</h1>

                    <div className="grid grid-cols-2   border-b">
                        <Tabs.Trigger
                            className="group py-2 transition-colors hover:bg-gray-100  "
                            value="recent"
                        >
                            <span className="border-b-2 border-transparent py-2 text-gray-500 group-data-[state=active]:border-blue-500  group-data-[state=active]:text-black">
                                Recents
                            </span>
                        </Tabs.Trigger>
                        <Tabs.Trigger
                            className="group py-2 transition-colors duration-200 hover:bg-gray-50"
                            value="following"
                        >
                            <span className="border-b-2 border-transparent pb-2 text-gray-500 group-data-[state=active]:border-blue-500   group-data-[state=active]:text-black">
                                Following
                            </span>
                        </Tabs.Trigger>
                    </div>
                </Tabs.List>
            </header>
            <NewTweetForm />
            <Tabs.Content value="recent">
                <RecentPosts />
            </Tabs.Content>
            <Tabs.Content value="following">
                <FollowingPosts />
            </Tabs.Content>
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

