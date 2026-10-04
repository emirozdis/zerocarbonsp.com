"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sprout,
  Trees,
  Trophy,
  CookingPot,
  ArrowUpRight,
  LogOut,
} from "lucide-react";
import { useForest } from "@/components/forest/provider";
const navItems = [
  { label: "Fidanım", href: "/my-plant", icon: Sprout },
  { label: "Ormanımız", href: "/forest", icon: Trees },
  { label: "Paylaşım Kazanı", href: "/paylasim-kazani", icon: CookingPot },
  { label: "Liderlik Tablosu", href: "/leaderboard", icon: Trophy },
];
export default function Navigation() {
  const path = usePathname(),
    { data, openLogin, logout } = useForest();
  return (
    <header className="forest-header">
      <Link
        href="/"
        className="forest-brand"
        aria-label="Tabaktan Ormana ana sayfa"
      >
        <span className="brand-mark">
          <Sprout size={27} aria-hidden="true" />
        </span>
        <span>
          tabaktan
          <span className="brand-second">
            ormana<span className="brand-dot">.</span>
          </span>
        </span>
      </Link>
      <nav className="forest-nav" aria-label="Ana menü">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            href={href}
            key={href}
            className={
              path === href || (path === "/" && href === "/my-plant")
                ? "active"
                : ""
            }
            aria-current={
              path === href || (path === "/" && href === "/my-plant")
                ? "page"
                : undefined
            }
          >
            <Icon size={20} aria-hidden="true" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
      <div className="nav-account">
        {data && !data.demo ? (
          <>
            <span className="account-avatar">{data.me?.name.slice(0, 1)}</span>
            <span className="account-name">{data.me?.name.split(" ")[0]}</span>
            <button
              onClick={() => void logout()}
              aria-label="Çıkış yap"
              title="Çıkış yap"
            >
              <LogOut size={19} aria-hidden="true" />
            </button>
          </>
        ) : (
          <button className="login-link" onClick={openLogin}>
            Kartımla giriş <ArrowUpRight size={18} aria-hidden="true" />
          </button>
        )}
      </div>
    </header>
  );
}
