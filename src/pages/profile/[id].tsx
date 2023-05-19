import {
    GetStaticPaths,
    GetStaticPathsContext,
    GetStaticProps,
    GetStaticPropsContext,
    InferGetStaticPropsType,
    NextPage,
} from "next";
import { ssgHelper } from "~/server/api/ssgHelper";

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

    const ssg = ssgHelper()

    return {
        props: {
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
    return (
        <div>
            {id}
        </div>
    );
};

export default ProfilePage;
