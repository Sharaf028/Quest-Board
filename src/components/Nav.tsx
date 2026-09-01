"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import ThemeToggle from "./ThemeToggle";
import ChatWidget from "./ChatWidget";

const LINKS = [
  { href: "/board", label: "Board", icon: "🗡️" },
  { href: "/resources", label: "Resources", icon: "📚" },
  { href: "/archive", label: "Archive", icon: "🏆" },
  { href: "/profile", label: "Profile", icon: "🙂" },
];

export default function Nav({
  userName,
  userImage,
}: {
  userName: string;
  userImage: string | null;
}) {
  const pathname = usePathname();

  return (
    <>
      <header className="hero">
        <Link href="/board" className="brand" style={{ textDecoration: "none" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Quest Board logo" className="brand-logo" width={48} height={48} />
          <div>
            <h1>Quest Board</h1>
            <p>your missions, your rules</p>
          </div>
        </Link>

        <nav className="main-nav" aria-label="Main">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link${pathname === link.href ? " active" : ""}`}
            >
              <span aria-hidden="true">{link.icon}</span> {link.label}
            </Link>
          ))}
        </nav>

        <div className="stats">
          <ThemeToggle />
          <button className="user-chip" onClick={() => signOut({ callbackUrl: "/" })} title="Sign out">
            {userImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={userImage} alt="" width={24} height={24} />
            ) : null}
            <span>{userName.split(" ")[0]}</span>
          </button>
        </div>
      </header>
      <ChatWidget />
    </>
  );
}
