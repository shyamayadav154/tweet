import Link from "next/link";
import React from "react";
import Modal from "./Modal";
import { type IconType } from "react-icons/lib";

export type ContentType = {
    title: string;
    subTitle: string;
    icon: IconType
};

type NoAuthModal = typeof Modal extends React.ComponentType<infer P>
    ? Omit<P, "children"> & ContentType
    : never;

const NoAuthModal = (
    {
        title = "Reply to join the conversation",
        subTitle = "once you join tweetX, you can respont to ",
        ...props
    }: NoAuthModal,
) => {
    return (
        <Modal {...props}>
            <NoAuth icon={props.icon} title={title} subTitle={subTitle} />
        </Modal>
    );
};

function NoAuth({ title, subTitle,...props }: ContentType) {
    return (
        <section className="bg-white dark:bg-black p-5 py-10 rounded-2xl   w-[550px] ">
            <article className="max-w-[450px] flex flex-col items-center gap-6 mx-auto">
                <props.icon className="text-5xl  text-blue-500" />
                <h1 className="text-2xl font-bold dark:text-white">
                    {title}
                </h1>
                <p className="dark:text-zinc-400 text-[15px] text-gray-500">
                    {subTitle}
                </p>
                <Link
                    className="w-full bg-blue-500 text-white rounded-full text-center font-bold py-4 "
                    href="/api/auth/signin"
                >
                    Log in
                </Link>
            </article>
        </section>
    );
}

export default NoAuthModal;
