import { ChatBubbleOvalLeftIcon } from "@heroicons/react/24/outline";
import { BsFillChatFill } from "react-icons/bs";
import { BsFillHeartFill } from "react-icons/bs";
import Lottie, { type LottieRefCurrentProps } from "lottie-react";
import { useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import ProfileImage from "~/components/ProfileImage";
import heartAnimation from "../assets/heart-fav.json";
import { api, type RouterOutputs } from "~/utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import CommentModal from "./CommentModal";
import NoAuthModal from "./NoAuth";
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
    const [showAuthModal, setShowAuthModal] = useState({
        isVisible: false,
        title: "",
        subTitle: "",
        icon: BsFillChatFill,
    });
    const session = useSession();
    const trpcUtils = api.useContext();
    const router = useRouter();
    const toggleLike = api.tweet.toggleLike.useMutation({
        onSuccess: () => {
            void trpcUtils.tweet.infinteFeed.invalidate();
            void trpcUtils.tweet.infiniteProfileFeed.invalidate();
            void trpcUtils.tweet.infineteLikedFeed.invalidate();
            void trpcUtils.tweet.infineteReplyFeed.invalidate();
        },
    });
    function handleToggleLike() {
        if (session.status !== "authenticated") {
            if (!user.name) return false 
            setShowAuthModal({
                isVisible: true,
                title: "Like a Tweet to share the love.",
                subTitle: `Join tweetX to let ${user.name} know you like their Tweet`,
                icon: BsFillHeartFill,
            });
            return false;
        }
        toggleLike.mutate({
            id,
        });
        return true;
    }
    return (
        <li className="">
            <article
                onClick={(e) => {
                    e.stopPropagation();
                    void router.push(`/post/${id}`);
                }}
                className="flex cursor-pointer dark:hover:bg-zinc-950 hover:bg-gray-50 gap-4 items-start dark:border-zinc-800 border-b p-4 "
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
                    <div className="text-gray-600 dark:text-zinc-500  flex items-center gap-5">
                        <HeartButtonAnimated
                            likedByMe={likedByMe}
                            likeCount={likeCount}
                            isLoading={toggleLike.isLoading}
                            onClick={handleToggleLike}
                        />
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (session.status !== "authenticated") {
                                    if (!user.name) return alert("username not found");
                                    return setShowAuthModal({
                                        isVisible: true,
                                        title: "Reply to join the conversation",
                                        subTitle:
                                            `Once you join tweetX, you can respont to ${user.name} Tweet.`,
                                        icon: BsFillChatFill,
                                    });
                                }
                                setIsCommentModalOpen(true);
                            }}
                            className="flex group items-center"
                        >
                            <span className="group-hover:bg-blue-100 dark:group-hover:bg-blue-300/20 p-1.5 rounded-full group-hover:text-blue-500 text-gray-500/60 ">
                                <ChatBubbleOvalLeftIcon className="w-5 h-5 " />
                            </span>
                            &nbsp;
                            <span className="group-hover:text-blue-400">{commentCount}</span>
                        </button>
                    </div>
                </div>
            </article>
            <CommentModal
                open={isCommentModalOpen}
                setOpen={setIsCommentModalOpen}
                user={user}
                content={content}
                createdAt={createdAt}
            />
            <NoAuthModal
                setOpen={() =>
                    setShowAuthModal((prev) => ({ ...prev, isVisible: false }))}
                subTitle={showAuthModal.subTitle}
                title={showAuthModal.title}
                icon={showAuthModal.icon}
                open={showAuthModal.isVisible}
            />
        </li>
    );
};

type MiniPostProps = {
    user: Tweet["user"];
    content: string;
    createdAt: Date;
};

export const MiniPost = ({ user, content, createdAt }: MiniPostProps) => {
    return (
        <article className="flex items-start gap-2.5 ">
            <ProfileImage src={user.image} />
            <div className="flex flex-grow flex-col">
                <div className="flex gap-1">
                    <span className="font-bold dark:text-zinc-100">
                        {user.name}
                    </span>
                    <span className="text-gray-500 dark:text-zinc-400">
                        &middot;
                    </span>
                    <span className="text-gray-500 dark:text-zinc-400">
                        {dayjs(createdAt).fromNow()}
                    </span>
                </div>
                <pre className="dark:text-zinc-100">{content}</pre>
            </div>
        </article>
    );
};

type HeartButtonProps = {
    likeCount: number;
    likedByMe: boolean;
    isLoading: boolean;
    onClick: () => boolean;
};

const HeartButtonAnimated = ({
    likedByMe,
    likeCount,
    isLoading,
    onClick,
}: HeartButtonProps) => {
    const heartRef = useRef<LottieRefCurrentProps>(null);

    return (
        <button
            disabled={isLoading}
            onClick={(e) => {
                e.stopPropagation();
                const goForward = onClick();
                if (!goForward) return;
                if (likedByMe) {
                    heartRef.current?.goToAndStop(1, true);
                    return;
                }
                heartRef.current?.goToAndPlay(35, true);
            }}
            className="flex  justify-start items-center group  gap-0.5"
        >
            <div className="grid h-8 w-8 transition-colors duration-200 cursor-pointer place-content-center overflow-hidden rounded-full group-hover:bg-pink-100 dark:group-hover:bg-pink-900/40">
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
                    className="scale-[3] "
                />
            </div>
            <span className="group-hover:text-pink-500  transition-colors duration-200">
                {likeCount}
            </span>
        </button>
    );
};

export default InfiniteTweetList;
