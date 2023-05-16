import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import Head from "next/head";
import { ReactNode } from "react";
import SideNav from "~/components/SideNav";

const MyApp: AppType<{ session: Session | null }> = ({
    Component,
    pageProps: { session, ...pageProps },
}) => {
    return (
        <SessionProvider session={session}>
            <Head>
                <title>Twitter Clone</title>
                <meta name="description" content="This is a twitter clond" />
            </Head>
            <Container>
                <SideNav />
                <div className="flex-grow min-h-screen border-x">
                    <Component {...pageProps} />
                </div>
            </Container>
        </SessionProvider>
    );
};

const Container = ({ children }: { children: ReactNode }) => {
    return (
        <div className="mx-auto sm:pr-4 flex w-full  container sm:max-w-xl items-start">
            {children}
        </div>
    );
};

export default api.withTRPC(MyApp);
