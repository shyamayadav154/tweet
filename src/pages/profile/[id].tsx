import {
    GetStaticPaths,
    GetStaticPropsContext,
    InferGetStaticPropsType,
    NextPage,
} from "next";
import { useSession } from "next-auth/react";
import ErrorPage from "next/error";
import Head from "next/head";
import Link from "next/link";
import { VscArrowLeft } from "react-icons/vsc";
import Button from "~/components/Button";
import ProfileImage from "~/components/ProfileImage";
import { ssgHelper } from "~/server/api/ssgHelper";
import { api } from "~/utils/api";
import { getPulral } from "~/utils/profile";
import { InfiniteTweetList } from "..";

const ProfilePage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
    id,
}) => {
    const { data: profile, status } = api.profile.getById.useQuery({
        id,
    });
    const tweets = api.tweet.infiniteProfileFeed.useInfiniteQuery(
        {
            userId: id,
        },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
        },
    );

    const trpcUtils = api.useContext();
    const toggleFollow = api.profile.toggleFollow.useMutation({
        onSuccess: () => {
            void trpcUtils.profile.getById.invalidate();
        },
    });

    if (status !== "success") return <div>loading...</div>;

    if (profile == null || profile.name == null) {
        return <ErrorPage statusCode={404} />;
    }

    return (
        <>
            <Head>
                <title>{`Twitter Clone - ${profile?.name}`}</title>
            </Head>

            <header className="sticky top-0 z-10 flex items-center gap-2 border-b bg-white p-2">
                <Link href="..">
                    <VscArrowLeft className="h-6 w-6 text-gray-600" />
                </Link>
                {profile.image && <ProfileImage src={profile.image} />}
                <div className="flex-1">
                    <div className="flex flex-1 items-center gap-2">
                        <h1 className="font-medium">{profile.name}</h1>
                    </div>
                    <div className="text-sm capitalize text-gray-500">
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
const FollowButton = ({
    isFollowing,
    userId,
    isLoading,
    onClick,
}: FollowButtonProps) => {
    const session = useSession();

    if (session.status !== "authenticated" || session.data.user.id === userId) {
        return null;
    }

    return (
        <Button onClick={onClick} disabled={isLoading} small gray={isFollowing}>
            {isFollowing ? "Unfollow" : "Follow"}
        </Button>
    );
};
export default ProfilePage;

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
    await ssg.profile.getById.prefetch({ id });

    return {
        props: {
            trpcState: ssg.dehydrate(),
            id,
        },
    };
};

export const getStaticPaths: GetStaticPaths = () => {
    return {
        paths: [],
        fallback: "blocking",
    };
};
