import { ChatBubbleOvalLeftIcon } from "@heroicons/react/24/outline";
import Lottie, { type LottieRefCurrentProps } from "lottie-react";
import { useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import ProfileImage from "~/components/ProfileImage";
import heartAnimation from "../assets/heart-fav.json";
import { api, type RouterOutputs } from "~/utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useRouter } from "next/router";
import Modal from "./Modal";
import { NewCommentForm } from "./CommentSection";
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
    commentCount,
    isLiked: likedByMe,
}: Tweet) => {
    const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
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
                    void router.push(`/post/${id}`);
                }}
                className="flex cursor-pointer hover:bg-gray-50 gap-4 items-start border-b px-4 py-4"
            >
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        void router.push(`/profile/${user.id}`);
                    }}
                >
                    <ProfileImage src={user.image} />
                </button>
                <div className="flex flex-grow flex-col">
                    <div className="flex gap-1">
                        <span
                            className="hover:underline font-bold"
                            onClick={(e) => {
                                e.stopPropagation();
                                void router.push(`/profile/${user.id}`);
                            }}
                        >
                            {user.name}
                        </span>
                        <span className="text-gray-500">&middot;</span>
                        <span className="text-gray-500">{dayjs(createdAt).fromNow()}</span>
                    </div>
                    <pre className="">{content}</pre>
                    <div className=" text-gray-600 flex items-center gap-5">
                        <HeartButtonAnimated
                            likedByMe={likedByMe}
                            likeCount={likeCount}
                            isLoading={toggleLike.isLoading}
                            onClick={handleToggleLike}
                        />
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsCommentModalOpen(true);
                            }}
                            className="flex group items-center"
                        >
                            <span className="group-hover:bg-blue-100 p-1.5 rounded-full group-hover:text-blue-500 text-gray-500/60 ">
                                <ChatBubbleOvalLeftIcon className="w-5 h-5 " />
                            </span>
                            &nbsp;
                            <span className="group-hover:text-blue-400">{commentCount}</span>
                        </button>
                    </div>
                </div>
            </article>
            <Modal open={isCommentModalOpen} setOpen={setIsCommentModalOpen}>
                <section className="bg-white w-[500px] p-5 rounded-xl">
                    <article className="flex items-start gap-2.5">
                        <ProfileImage src={user.image} />
                        <div className="flex flex-grow flex-col">
                            <div className="flex gap-1">
                                <span className="font-bold">
                                    {user.name}
                                </span>
                                <span className="text-gray-500">&middot;</span>
                                <span className="text-gray-500">
                                    {dayjs(createdAt).fromNow()}
                                </span>
                            </div>
                            <pre className="">{content}</pre>
                        </div>
                    </article>
                    {user.name &&
                        (
                            <NewCommentForm
                                closeModal={() => setIsCommentModalOpen(false)}
                                id={id}
                                postUser={user.name}
                            />
                        )}
                </section>
            </Modal>
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
                        onDOMLoaded={() => {
                            if (likedByMe) {
                                heartRef.current?.goToAndStop(138, true);
                            }
                        }}
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

export default InfiniteTweetList;
