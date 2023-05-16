import Button from "./Button";
import { useSession } from "next-auth/react";
import {
    FormEvent,
    useCallback,
    useLayoutEffect,
    useRef,
    useState,
} from "react";
import ProfileImage from "./ProfileImage";
import { api } from "~/utils/api";

function updateTextAreaSize(textArea?: HTMLTextAreaElement) {
    if (textArea == null) return;
    textArea.style.height = "0";
    textArea.style.height = `${textArea.scrollHeight}px`;
}

const NewTweetForm = () => {
    const session = useSession();
    if (session.status !== "authenticated") return null;

    return <Form />;
};

const Form = () => {
    const session = useSession();
    const trpcUtils = api.useContext();
    const [inputValue, setInputValue] = useState("");
    const textAreaRef = useRef<HTMLTextAreaElement>();
    const createTweet = api.tweet.create.useMutation({
        onSuccess: (newTweet) => {
            console.log(newTweet);
            setInputValue("");
            trpcUtils.tweet.infinteFeed.invalidate();
        },
    });
    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        createTweet.mutate({
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
        <form action="" onSubmit={handleSubmit}>
            <div className="flex gap-4 p-4 border-b">
                <ProfileImage src={session.data.user.image} />

                <textarea
                    ref={inputRef}
                    style={{ height: 0 }}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="what's happeing?"
                    className="flex-grow resize-none overflow-hidden p-4 text-lg outline-none"
                />
                <Button className="self-end">
                    Tweet
                </Button>
            </div>
        </form>
    );
};

export default NewTweetForm;
