import Modal from "./Modal";
import { NewCommentForm } from "./CommentSection";
import React from "react";
import XMarkIcon from "@heroicons/react/24/outline/XMarkIcon";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { MiniPost } from "./InfiniteTweetList";
import { useSession } from "next-auth/react";
dayjs.extend(relativeTime);

type CommentModalProps = typeof Modal extends React.ComponentType<infer P>
    ? Omit<P, "children"> & {
        user: {
            name: string | null;
            image: string | null;
            id: string;
        };
        content: string;
        createdAt: Date;
    }
    : never;

function CommentModal(
    { user, content, createdAt, ...props }: CommentModalProps,
) {
    const session = useSession();
    const isAuthenticated = session.status === "authenticated";
    return (
        <Modal open={props.open} setOpen={props.setOpen}>
            <section className="bg-white  w-full sm:w-[600px] px-4 pt-4 rounded-2xl dark:bg-black">
                <header className="mb-5 ">
                    <XMarkIcon
                        onClick={() => props.setOpen(false)}
                        className="w-9 hover:bg-zinc-800 rounded-full -ml-2 -mt-2 p-2 duration-200 transition-colors  h-9 cursor-pointer text-gray-500 dark:text-zinc-100"
                    />
                </header>

                {isAuthenticated && (
                    <>
                        <MiniPost user={user} content={content} createdAt={createdAt} />
                        {user.name &&
                            (
                                <NewCommentForm
                                    closeModal={() => props.setOpen(false)}
                                    id={user.id}
                                    postUser={user.name}
                                />
                            )}
                    </>
                )}
            </section>
        </Modal>
    );
}

export default CommentModal;
