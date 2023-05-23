import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { type IconType } from "react-icons/lib";
import { VscAccount, VscHome, VscSignIn, VscSignOut } from "react-icons/vsc";

function SideNav() {
    const session = useSession();
    const user = session.data?.user;
    return (
        <nav className="sm:sticky -ml-1 sm:top-0 fixed inset-x-1 bottom-0 z-10 border-t sm:border-none dark:border-zinc-800  bg-white dark:bg-black sm:bg-inherit  px-1 sm:py-4 ">
            <ul className="flex gap-1 justify-between sm:justify-start sm:flex-col items-start ">
                <SingleLink
                    href="/"
                    icon={VscHome}
                    name="Home"
                />
                {!!user &&
                    (
                        <SingleLink
                            href={`/profile/${user.id}`}
                            icon={VscAccount}
                            name="Profile"
                        />
                    )}
                {!!user
                    ? (
                        <SingleLink
                            href="/api/auth/signout"
                            icon={VscSignOut}
                            name="Logout"
                        />
                    )
                    : (
                        <SingleLink
                            href="/api/auth/signin"
                            icon={VscSignIn}
                            name="Login"
                        />
                    )}
            </ul>
        </nav>
    );
}

const SingleLink = (
    { href, name, ...props }: {
        href: string;
        icon: IconType;
        name: string;
    },
) => {
    const router = useRouter();
    const isCurrentPath = (href: string) => router.pathname === href;
    return (
        <li className="">
            <Link
                className={`flex ${isCurrentPath(href) &&
                    "bg-gray-100 font-medium dark:bg-zinc-900 sm:bg-inherit"
                    } gap-3 items-center  dark:hover:bg-zinc-800 hover:bg-gray-50 transition-colors duration-200  p-3 rounded-full`}
                href={href}
            >
                <props.icon className="w-7 h-7 text-gray-600 dark:text-gray-200" />
                <span className="hidden text-lg md:inline">
                    {name}
                </span>
            </Link>
        </li>
    );
};

export default SideNav;
