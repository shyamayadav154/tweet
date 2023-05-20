import { HeartIcon } from "@heroicons/react/24/outline";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import ProfileImage from "~/components/ProfileImage";
import heartAnimation from "../assets/heart-fav.json";
import { api, type RouterOutputs } from "~/utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useRouter } from "next/router";
dayjs.extend(relativeTime);

type Tweet = RouterOutputs["tweet"]["infinteFeed"]["tweets"][0];

type InfiniteTweetListProps = {
    tweets?: Tweet[];
    isError: boolean;
    isLoading: boolean;
    hasMore: boolean;
    fetchNewTweets: () => Promise<unknown>;
};

const InfiniteTweetList = ({
    tweets,
    isLoading,
    isError,
    fetchNewTweets,
    hasMore,
}: InfiniteTweetListProps) => {
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
const TweetCard = ({
    user,
    content,
    id,
    createdAt,
    likeCount,
    isLiked: likedByMe,
}: Tweet) => {
    const trpcUtils = api.useContext();
    const router = useRouter();
    const toggleLike = api.tweet.toggleLike.useMutation({
        onSuccess: () => {
            void trpcUtils.tweet.infinteFeed.invalidate();
            void trpcUtils.tweet.infiniteProfileFeed.invalidate();
        },
    });
    function handleToggleLike() {
        toggleLike.mutate({
            id,
        });
    }
    return (
        <li>
            <article
                onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/post/${id}`);
                }}
                className="flex cursor-pointer hover:bg-gray-50 gap-4 border-b px-4 py-4"
            >
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/profile/${user.id}`);
                    }}
                >
                    <ProfileImage src={user.image} />
                </button>
                <div className="flex flex-grow flex-col">
                    <div className="flex gap-1">
                        <span
                            className="hover:underline"
                            onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/profile/${user.id}`);
                            }}
                        >
                            {user.name}
                        </span>
                        <span className="text-gray-500">&#x2022;</span>
                        <span className="text-gray-500">{dayjs(createdAt).fromNow()}</span>
                    </div>
                    <p>{content}</p>
                    <HeartButtonAnimated
                        likedByMe={likedByMe}
                        likeCount={likeCount}
                        isLoading={toggleLike.isLoading}
                        onClick={handleToggleLike}
                    />
                </div>
            </article>
        </li>
    );
};

type HeartButtonProps = {
    likeCount: number;
    likedByMe: boolean;
    isLoading: boolean;
    onClick: () => void;
};

const HeartButtonAnimated = ({
    likedByMe,
    likeCount,
    isLoading,
    onClick,
}: HeartButtonProps) => {
    const heartRef = useRef<LottieRefCurrentProps>(null);

    useEffect(() => {
        if (likedByMe) {
            heartRef.current?.goToAndStop(138, true);
        }
    }, []);
    return (
        <div>
            <button
                disabled={isLoading}
                onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                    if (likedByMe) {
                        heartRef.current?.goToAndStop(1, true);
                        return;
                    }
                    heartRef.current?.goToAndPlay(35, true);
                }}
                className="flex  justify-start items-center group text-gray-500 gap-0.5"
            >
                <div className="grid h-8 w-8 transition-colors duration-200 cursor-pointer place-content-center overflow-hidden rounded-full group-hover:bg-pink-100">
                    <Lottie
                        lottieRef={heartRef}
                        animationData={heartAnimation}
                        loop={false}
                        autoplay={false}
                        className="scale-[3]"
                    />
                </div>
                <span className="group-hover:text-pink-500 transition-colors duration-200">
                    {likeCount}
                </span>
            </button>
        </div>
    );
};

const HeartButton = ({
    likedByMe,
    likeCount,
    isLoading,
    onClick,
}: HeartButtonProps) => {
    return (
        <button
            disabled={isLoading}
            onClick={onClick}
            className="mb-1 mt-1 flex items-center gap-3 self-start text-gray-500"
        >
            <HeartIcon
                className={`h-5 w-5 ${likedByMe ? "fill-red-500 stroke-red-500" : ""}`}
            />
            <span>{likeCount}</span>
        </button>
    );
};

export default InfiniteTweetList;
