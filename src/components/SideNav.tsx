import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import React from "react";
import { VscAccount, VscHome, VscSignIn, VscSignOut } from "react-icons/vsc";

function SideNav() {
    const session = useSession();
    const user = session.data?.user;
    return (
        <nav className="sticky top-0 px-2 py-4 ">
            <ul className="flex flex-col items-start ">
                <li className="">
                    <Link
                        className="flex gap-3 items-center  dark:hover:bg-zinc-800 hover:bg-gray-50 transition-colors duration-200  p-3 rounded-full"
                        href="/"
                    >
                        <VscHome className="w-7 h-7 text-gray-600 dark:text-gray-200" />
                        <span className="hidden text-lg md:inline">
                            Home
                        </span>
                    </Link>
                </li>
                {!!user &&
                    (
                        <li className="">
                            <Link
                                className="flex gap-2 dark:hover:bg-zinc-800 items-center hover:bg-gray-50 transition-colors duration-200 p-3 rounded-full"
                                href={`/profile/${user.id}`}
                            >
                                <VscAccount className="w-7 h-7 text-gray-600 dark:text-gray-200" />
                                <span className="hidden text-lg md:inline">
                                    Profile
                                </span>
                            </Link>
                        </li>
                    )}
                {!!user
                    ? (
                        <li>
                            <button
                                className="flex gap-2 items-center  dark:hover:bg-zinc-800 hover:bg-gray-50 transition-colors duration-200 p-3 rounded-full"
                                onClick={() => void signOut()}
                            >
                                <VscSignOut className="w-7 h-7 text-gray-600 dark:text-gray-200" />
                                <span className="hidden md:inline text-lg">
                                    Log out
                                </span>
                            </button>
                        </li>
                    )
                    : (
                        <li>
                            <button
                                className="flex gap-2 items-center dark:hover:bg-zinc-800 hover:bg-gray-50 transition-colors duration-200 p-3 rounded-full"
                                onClick={() => void signIn()}
                            >
                                <VscSignIn className="w-7 h-7 dark:text-gray-200 text-gray-600" />
                                <span className="hidden md:inline text-lg">
                                    Log in 
                                </span>
                            </button>
                        </li>
                    )}
            </ul>
        </nav>
    );
}

export default SideNav;
