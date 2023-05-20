import { useSession } from "next-auth/react";
import React, {
    FormEvent,
    useCallback,
    useLayoutEffect,
    useRef,
    useState,
} from "react";
import { api, RouterOutputs } from "~/utils/api";
import ProfileImage from "./ProfileImage";
import Button from "./Button";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useRouter } from "next/router";
dayjs.extend(relativeTime);

function updateTextAreaSize(textArea?: HTMLTextAreaElement) {
    if (textArea == null) return;
    textArea.style.height = "0";
    textArea.style.height = `${textArea.scrollHeight}px`;
}

function CommentSection({ id, name }: { id: string }) {
    return (
        <div>
            <NewCommentForm id={id} />
            <CommentList id={id} />
        </div>
    );
}

export default CommentSection;

type CommentListProps = {
    id: any;
};

type Comment = RouterOutputs["tweet"]["getComments"][number];

const CommentList = ({ id }: CommentListProps) => {
    const { data: comments, isLoading } = api.tweet.getComments.useQuery({
        tweetId: id,
    });
    if (isLoading) return <div>Loading...</div>;
    if (!comments) return <div>Something went wrong.</div>;
    return (
        <ul className="">
            {comments.map((comment) => <CommentCard key={comment.id} {...comment} />)}
        </ul>
    );
};

const CommentCard = ({ id, createdAt, user, content }: Comment) => {
    return (
        <li>
            <article
                onClick={(e) => {
                    e.stopPropagation();
                }}
                className="flex cursor-pointer hover:bg-gray-50 gap-4 border-b px-4 py-4"
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
                            className="hover:underline"
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                        >
                            {user.name}
                        </span>
                        <span className="text-gray-500">&#x2022;</span>
                        <span className="text-gray-500">{dayjs(createdAt).fromNow()}</span>
                    </div>
                    <p>{content}</p>
                </div>
            </article>
        </li>
    );
};

type NewCommentFormProps = {
    id: string;
};

const NewCommentForm = ({ id }: NewCommentFormProps) => {
    const session = useSession();
    const trpcUtils = api.useContext();
    const tweet = trpcUtils.tweet.getSingleTweet.getData({
        postId: id,
    });
    const [inputValue, setInputValue] = useState("");
    const [showReplying, setShowReplying] = useState(false);
    const textAreaRef = useRef<HTMLTextAreaElement>();
    const createTweet = api.tweet.addComment.useMutation({
        onSuccess: (newTweet) => {
            console.log(newTweet);
            setInputValue("");
            trpcUtils.tweet.getComments.invalidate();
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
        <form onSubmit={handleSubmit} className="border-b pb-4 ">
            {showReplying && (
                <div className="pl-[4.5rem]">
                    <span className="text-gray-500">
                        Replying to&nbsp;
                    </span>
                    <span className="text-blue-400">
                        @{tweet?.user?.name}
                    </span>
                </div>
            )}
            <div className="flex gap-4 p-4 ">
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
                    Reply
                </Button>
            </div>
        </form>
    );
};
