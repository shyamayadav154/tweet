import dayjs from "dayjs";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import Link from "next/link";
import { VscArrowLeft } from "react-icons/vsc";
import ProfileImage from "~/components/ProfileImage";
import { ssgHelper } from "~/server/api/ssgHelper";
import { api } from "~/utils/api";
import { getPulral } from "~/utils/profile";
import { useSession } from "next-auth/react";
import TextAreaAutoSize from "~/components/TextAreaAutoSize";
import { useState } from "react";
import CommentSection from "~/components/CommentSection";

type PostPageProps = InferGetServerSidePropsType<typeof getServerSideProps>;

const PostPage = ({ id }: PostPageProps) => {
    const postInfo = api.tweet.getSingleTweet.useQuery({
        postId: id,
    });
    if (!postInfo.data) return <div>no data found</div>;
    return (
        <>
            <Head>
                <title>Twet - Post</title>
            </Head>
            <header className="sticky top-0 z-10 p-2 backdrop-blur-lg bg-white/80 flex gap-5 items-center">
                <Link href="..">
                    <VscArrowLeft className="h-6 w-6 text-gray-600" />
                </Link>

                <h2 className="font-medium text-xl">Tweet</h2>
            </header>
            <main>
                <article className="m-5  space-y-2 border-b">
                    <div className="flex gap-2.5">
                        <ProfileImage src={postInfo.data.user.image} />
                        <div className="flex flex-col">
                            <span className="font-medium leading-tight">
                                {postInfo.data.user.name}
                            </span>
                            <span className=" text-sm text-gray-500">
                                @{postInfo.data.user.name}
                            </span>
                        </div>
                    </div>
                    <p>
                        {postInfo.data.content}
                    </p>
                    <div className="text-gray-500 space-x-1">
                        <span>
                            {dayjs(postInfo.data.createdAt).format("h:mm A")}
                        </span>
                        &nbsp;&middot;
                        <span>
                            {dayjs(postInfo.data.createdAt).format("MMM D, YYYY")}
                        </span>
                    </div>
                    <div className="border-t py-2  space-x-1">
                        <span className="text-black">
                            {postInfo.data._count.likes}
                        </span>
                        <span className="text-gray-500">
                            {getPulral(postInfo.data._count.likes, "Like", "Likes")}
                        </span>
                    </div>
                </article>
                <CommentSection  id={id} />
            </main>
        </>
    );
};
export const getServerSideProps = async (
    ctx: GetServerSidePropsContext<{ id: string }>,
) => {
    const id = ctx.params?.id;

    if (!id) {
        return {
            notFound: true,
        };
    }
    const ssg = ssgHelper();
    await ssg.tweet.getSingleTweet.prefetch({
        postId: id,
    });

    return {
        props: {
            trpcState: ssg.dehydrate(),
            id,
        },
    };
};

export default PostPage;
