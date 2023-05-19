import { type NextPage } from "next";
import Link from "next/link";
import InfiniteScroll from "react-infinite-scroll-component";
import NewTweetForm from "~/components/NewTweetForm";
import ProfileImage from "~/components/ProfileImage";
import { api, RouterOutputs } from "~/utils/api";
import { HeartIcon } from "@heroicons/react/24/outline";
import * as Tabs from "@radix-ui/react-tabs";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import heartAnimation from "../assets/heart-fav.json";
import { useEffect, useRef } from "react";

dayjs.extend(relativeTime);

const Home: NextPage = () => {
    return (
        <Tabs.Root defaultValue="recent">
            <header className="sticky top-0 backdrop-blur-lg bg-white/80  z-10">
                <Tabs.List>
                    <h1 className="mb-2 px-4 py-2 text-lg font-bold">Home</h1>

                    <div className="grid border-b   grid-cols-2">
                        <Tabs.Trigger
                            className="transition-colors hover:bg-gray-100 group py-2  "
                            value="recent"
                        >
                            <span className="group-data-[state=active]:border-blue-500 group-data-[state=active]:text-black text-gray-500 py-2 border-transparent  border-b-2">
                                Recents
                            </span>
                        </Tabs.Trigger>
                        <Tabs.Trigger
                            className="hover:bg-gray-50 group transition-colors duration-200 py-2"
                            value="following"
                        >
                            <span className="group-data-[state=active]:border-blue-500 text-gray-500 group-data-[state=active]:text-black border-b-2 pb-2   border-transparent">
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
    const tweets = api.tweet.infinteFeed.useInfiniteQuery({
        onlyFollowing: true,
    }, {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
    });
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
    const tweets = api.tweet.infinteFeed.useInfiniteQuery({}, {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
    });
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

type Tweet = RouterOutputs["tweet"]["infinteFeed"]["tweets"][0];

type InfiniteTweetListProps = {
    tweets?: Tweet[];
    isError: boolean;
    isLoading: boolean;
    hasMore: boolean;
    fetchNewTweets: () => void;
};

const InfiniteTweetList = (
    { tweets, isLoading, isError, fetchNewTweets, hasMore }:
        InfiniteTweetListProps,
) => {
    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error</div>;
    if (!tweets || tweets.length === 0) return <div>No tweets</div>;

    return (
        <ul>
            <InfiniteScroll
                dataLength={tweets.length}
                hasMore={hasMore}
                next={fetchNewTweets}
                loader="loadding..."
            >
                {tweets.map((tweet) => <TweetCard {...tweet} key={tweet.id} />)}
            </InfiniteScroll>
        </ul>
    );
};

const TweetCard = (
    { user, content, id, createdAt, likeCount, isLiked: likedByMe }: Tweet,
) => {
    const trpcUtils = api.useContext();
    const toggleLike = api.tweet.toggleLike.useMutation({
        onSuccess: () => {
            void trpcUtils.tweet.infinteFeed.invalidate();
        },
    });

    function handleToggleLike() {
        toggleLike.mutate(
            {
                id,
            },
        );
    }
    return (
        <li className="flex gap-4 border-b px-4 py-4">
            <Link href={`/profiles/${user.id}`}>
                <ProfileImage src={user.image} />
            </Link>
            <div className="flex flex-grow flex-col">
                <div className="flex gap-1">
                    <Link className="hover:underline" href={`/profiles/${user.id}`}>
                        {user.name}
                    </Link>
                    <span className="text-gray-500">
                    </span>
                    <span className="text-gray-500">
                        {dayjs(createdAt).fromNow()}
                    </span>
                </div>
                <p>
                    {content}
                </p>
                <HeartButtonAnimated
                    likedByMe={likedByMe}
                    likeCount={likeCount}
                    isLoading={toggleLike.isLoading}
                    onClick={handleToggleLike}
                />
            </div>
        </li>
    );
};

type HeartButtonProps = {
    likeCount: number;
    likedByMe: boolean;
    isLoading: boolean;
    onClick: () => void;
};

const HeartButtonAnimated = (
    { likedByMe, likeCount, isLoading, onClick }: HeartButtonProps,
) => {
    const heartRef = useRef<LottieRefCurrentProps>(null);

    useEffect(() => {
        if (likedByMe) {
            heartRef.current?.goToAndStop(138, true);
        }
    }, []);
    return (
        <div className="overflow-hidden h-10 w-10 hover:bg-pink-100 cursor-pointer grid place-content-center rounded-full">
            <Lottie
                onClick={() => {
                    onClick();
                    if (likedByMe) {
                        heartRef.current?.goToAndStop(1,true)
                        return;
                    }
                    heartRef.current?.goToAndPlay(35,true);
                }}
                lottieRef={heartRef}
                animationData={heartAnimation}
                loop={false}
                autoplay={false}
                className="scale-[3]"
            />
        </div>
    );
};
const HeartButton = (
    { likedByMe, likeCount, isLoading, onClick }: HeartButtonProps,
) => {
    return (
        <button
            disabled={isLoading}
            onClick={onClick}
            className="mt-1 mb-1 flex items-center gap-3 self-start text-gray-500"
        >
            <HeartIcon
                className={`h-5 w-5 ${likedByMe ? "fill-red-500 stroke-red-500" : ""}`}
            />
            <span>
                {likeCount}
            </span>
        </button>
    );
};

export default Home;
