import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import Head from "next/head";
import { type ReactNode } from "react";
import SideNav from "~/components/SideNav";
import { SessionProvider } from "next-auth/react";
import localFont from "next/font/local";

const MyApp: AppType<{ session: Session | null }> = ({
    Component,
    pageProps: { session, ...pageProps },
}) => {
    return (
        <>
            <Head>
                <title>Twitter Clone</title>
                <meta name="description" content="This is a twitter clond" />
            </Head>
            <SessionProvider session={session}>
                <Container session={session}>
                    <SideNav />
                    <main className=" min-h-screen   w-full  dark:border-zinc-800 border-x">
                        <Component {...pageProps} />
                    </main>
                </Container>
            </SessionProvider>
        </>
    );
};

const twitter = localFont({
    src: [
        {
            path: "../assets/font/Chirp-Regular.80fda27a.woff2",
            weight: "400",
            style: "normal",
        },

        {
            path: "../assets/font/Chirp-Medium.f8e2739a.woff2",
            weight: "500",
            style: "normal",
        },
        {
            path: "../assets/font/Chirp-Bold.ebb56aba.woff2",
            weight: "700",
            style: "normal",
        },
    ],
});

const Container = (
    { children, session }: { children: ReactNode; session: Session | null },
) => {
    return (
        <div
            className={`mx-auto  ${twitter.className}   dark:text-zinc-100 flex w-full   md:max-w-3xl items-start`}
        >
            {children}
        </div>
    );
};

export default api.withTRPC(MyApp);
