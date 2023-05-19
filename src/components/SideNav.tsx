import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import React from "react";

function SideNav() {
    const session = useSession();
    const user = session.data?.user;
    return (
        <nav className="sticky top-0 px-2 py-4 ">
            <ul className="flex flex-col items-start gap-2">
                <li>
                    <Link href="/">Home</Link>
                </li>
                {!!user &&
                    (
                        <li>
                            <Link href={`/profile/${user.id}`}>Profile</Link>
                        </li>
                    )}
                {!!user
                    ? (
                        <li>
                            <button onClick={() => void signOut()}>
                                Log out
                            </button>
                        </li>
                    )
                    : (
                        <li>
                            <button onClick={() => void signIn()}>
                                Log in
                            </button>
                        </li>
                    )}
            </ul>
        </nav>
    );
}

export default SideNav;
