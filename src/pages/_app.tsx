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
            <main className="dark:bg-black dark:text-zinc-100">
                <Container session={session}>
                    <SideNav />
                    <div className="flex-grow min-h-screen dark:border-zinc-800 border-x">
                        <SessionProvider session={session}>
                            <Component {...pageProps} />
                        </SessionProvider>
                    </div>
                </Container>
            </main>
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
            className={`mx-auto  ${twitter.className} sm:pr-4 flex w-full  container md:max-w-3xl items-start`}
        >
            <SessionProvider session={session}>
                {children}
            </SessionProvider>
        </div>
    );
};

export default api.withTRPC(MyApp);
