import { useSession } from "next-auth/react";
import React, {
    type FormEvent,
    useCallback,
    useLayoutEffect,
    useRef,
    useState,
} from "react";
import { api,type RouterOutputs } from "~/utils/api";
import ProfileImage from "./ProfileImage";
import Button from "./Button";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import LoadingSpinner from "./LoadingSpinner";
dayjs.extend(relativeTime);

function updateTextAreaSize(textArea?: HTMLTextAreaElement) {
    if (textArea == null) return;
    textArea.style.height = "0";
    textArea.style.height = `${textArea.scrollHeight}px`;
}

function CommentSection({ id, postUser }: { id: string; postUser: string }) {
    return (
        <div>
            <div className="px-5 border-b">
                <NewCommentForm postUser={postUser} id={id} />
            </div>
            <CommentList id={id} />
        </div>
    );
}

export default CommentSection;

type CommentListProps = {
    id: string;
};

type Comment = RouterOutputs["tweet"]["getComments"][number];

const CommentList = ({ id }: CommentListProps) => {
    const { data: comments, isLoading } = api.tweet.getComments.useQuery({
        tweetId: id,
    });
    if (isLoading) return <LoadingSpinner />;
    if(!comments?.length) return <p>No comments found</p>;
    return (
        <ul className="">
            {comments?.map((comment: Comment) => (
                <CommentCard key={comment.id} {...comment} />
            ))}
        </ul>
    );
};

const CommentCard = ({ createdAt, user, content }: Comment) => {
    return (
        <li className="border-b px-5">
            <article
                onClick={(e) => {
                    e.stopPropagation();
                }}
                className="flex cursor-pointer  gap-4   py-4"
            >
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                >
                    <ProfileImage src={user.image} />
                </button>
                <div className="flex flex-grow flex-col">
                    <div className="flex gap-1">
                        <span
                            className="hover:underline font-medium"
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                        >
                            {user.name}
                        </span>
                        <span className="text-gray-500">&#x2022;</span>
                        <span className="text-gray-500">{dayjs(createdAt).fromNow()}</span>
                    </div>
                    <pre>{content}</pre>
                </div>
            </article>
        </li>
    );
};

type NewCommentFormProps = {
    id: string;
    postUser: string;
    closeModal?: () => void;
};

export const NewCommentForm = (
    { id, postUser, closeModal }: NewCommentFormProps,
) => {
    const session = useSession();
    const trpcUtils = api.useContext();
    const [inputValue, setInputValue] = useState("");
    const [showReplying, setShowReplying] = useState(false);
    const textAreaRef = useRef<HTMLTextAreaElement>();
    const createTweet = api.tweet.addComment.useMutation({
        onSuccess: (newTweet) => {
            console.log(newTweet);
            setInputValue("");
            void trpcUtils.tweet.getComments.invalidate();
            void trpcUtils.tweet.infinteFeed.invalidate();
            if (closeModal) {
                closeModal();
            }
        },
    });
    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        createTweet.mutate({
            tweetId: id,
            content: inputValue,
        });
    }

    const inputRef = useCallback((textArea: HTMLTextAreaElement) => {
        updateTextAreaSize(textArea);
        textAreaRef.current = textArea;
    }, []);

    useLayoutEffect(() => {
        updateTextAreaSize(textAreaRef.current);
    }, [inputValue]);

    if (session.status !== "authenticated") return null;

    return (
        <form onSubmit={handleSubmit} className=" pb-4 ">
            {showReplying && (
                <div className="pl-[3.2rem]">
                    <span className="text-gray-500">
                        Replying to&nbsp;
                    </span>
                    <span className="text-blue-400">
                        @{postUser}
                    </span>
                </div>
            )}
            <div className="flex gap-3 py-4 ">
                <ProfileImage src={session.data.user.image} />
                <textarea
                    ref={inputRef}
                    style={{ height: 0 }}
                    value={inputValue}
                    onFocus={() => setShowReplying(true)}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Tweet your reply!"
                    className="flex-grow resize-none overflow-hidden pb-4 pt-1  text-lg outline-none"
                />
            </div>
            <div className="flex justify-end px-4">
                <Button disabled={!inputValue} className="self-end">
                    {createTweet.isLoading ? "Replying..." : "Reply"}
                </Button>
            </div>
        </form>
    );
};
