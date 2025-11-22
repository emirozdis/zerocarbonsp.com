'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();
  const navItems = [
    { label: "Liderlik Tablosu", href: "/" },
    { label: "Hakkımızda", href: "/about" },
  ];

  return (
    <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-700/50 rounded-full shadow-lg shadow-zinc-900/5 dark:shadow-zinc-950/50 px-2 py-2">
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  relative px-6 py-2 rounded-full font-medium text-sm
                  transition-all duration-200 ease-out
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 
                  focus-visible:ring-[#008C49] dark:focus-visible:ring-[#008C49]
                  ${isActive
                    ? "bg-[#008C49] text-white shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-white hover:bg-[#008C49]"
                  }
                `}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}