import {
    GetStaticPaths,
    GetStaticPropsContext,
    InferGetStaticPropsType,
    NextPage,
} from "next";
import Head from "next/head";
import { ssgHelper } from "~/server/api/ssgHelper";
import { api } from "~/utils/api";
import ErrorPage from "next/error";
import { VscArrowLeft } from "react-icons/vsc";
import Image from "next/image";
import ProfileImage from "~/components/ProfileImage";
import { getPulral } from "~/utils/profile";
import Button from "~/components/Button";
import { InfiniteTweetList } from "..";
import Link from "next/link";

export const getStaticProps = async (
    context: GetStaticPropsContext<{
        id: string;
    }>,
) => {
    const id = context.params?.id;

    if (id == null) {
        return {
            redirect: {
                destination: "/",
            },
        };
    }

    const ssg = ssgHelper();
    ssg.profile.getById.prefetch({ id });

    return {
        props: {
            trpcState: ssg.dehydrate(),
            id,
        },
    };
};

export const getStaticPaths: GetStaticPaths = async () => {
    return {
        paths: [],
        fallback: "blocking",
    };
};

const ProfilePage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = (
    { id },
) => {
    const { data: profile } = api.profile.getById.useQuery({
        id,
    });
    const tweets = api.tweet.infiniteProfileFeed.useInfiniteQuery({
        userId: id,
    }, {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
    });

    const trpcUtils = api.useContext();
    const toggleFollow = api.profile.toggleFollow.useMutation({
        onSuccess: () => {
            void trpcUtils.profile.getById.invalidate();
        },
    });

    if (profile == null || profile.name == null) {
        return <ErrorPage statusCode={404} />;
    }

    return (
        <>
            <Head>
                <title>
                    {`Twitter Clone - ${profile?.name}`}
                </title>
            </Head>

            <header className="sticky bg-white z-10 top-0 flex gap-2 items-center p-2 border-b">
                <Link href="..">
                    <VscArrowLeft className="w-6 h-6 text-gray-600" />
                </Link>
                {profile.image && <ProfileImage src={profile.image} />}
                <div className="flex-1">
                    <div className="flex-1 flex gap-2 items-center">
                        <h1 className="font-medium">
                            {profile.name}
                        </h1>
                    </div>
                    <div className="text-gray-500 text-sm capitalize">
                        {profile.tweetsCount}&nbsp;
                        {getPulral(profile.tweetsCount, "tweet", "tweets")} &#x2022;&nbsp;
                        {profile.followersCount}&nbsp;
                        {getPulral(profile.followersCount, "follower", "followers")}{" "}
                        &#x2022;&nbsp;
                        {profile.followsCount}&nbsp;
                        {getPulral(profile.followsCount, "following", "following")}&nbsp;
                    </div>
                </div>
                <FollowButton
                    isFollowing={profile.isFollowing}
                    userId={id}
                    isLoading={toggleFollow.isLoading}
                    onClick={() =>
                        toggleFollow.mutate({
                            userId: id,
                        })}
                />
            </header>
            <main>
                <InfiniteTweetList
                    tweets={tweets.data?.pages.flatMap((page) => page.tweets)}
                    isError={tweets.isError}
                    isLoading={tweets.isLoading}
                    hasMore={!!tweets.hasNextPage}
                    fetchNewTweets={tweets.fetchNextPage}
                />
            </main>
        </>
    );
};

type FollowButtonProps = {
    isFollowing?: boolean;
    isLoading: boolean;
    userId?: string;
    onClick: () => void;
};
const FollowButton = (
    { isFollowing, userId, isLoading, onClick }: FollowButtonProps,
) => {
    return (
        <Button onClick={onClick} disabled={isLoading} small>
            {isFollowing ? "Unfollow" : "Follow"}
        </Button>
    );
};
export default ProfilePage;
