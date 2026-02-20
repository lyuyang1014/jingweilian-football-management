import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { SITE_ASSETS } from "@shared/constants";

const NAV_LINKS = [
  { href: "/", label: "首页" },
  { href: "/players", label: "球员" },
  { href: "/matches", label: "比赛" },
  { href: "/leaderboard", label: "排行榜" },
];

export default function Navbar() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#020309]/90 backdrop-blur-md border-b border-white/5">
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 no-underline">
          <img
            src={SITE_ASSETS.clubLogo}
            alt="京蔚联"
            className="h-10 w-10 object-contain"
          />
          <div className="flex flex-col">
            <span className="text-white font-[Oswald] text-lg font-semibold tracking-wider leading-tight">
              NIO UNITED
            </span>
            <span className="text-white/50 text-[10px] tracking-[0.2em] leading-tight">
              京蔚联足球俱乐部
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 text-sm font-[Oswald] tracking-wider uppercase transition-colors no-underline ${
                location === link.href
                  ? "text-[#4fc3f7] border-b-2 border-[#4fc3f7]"
                  : "text-white/70 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-white/70 hover:text-white p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden bg-[#020309]/95 backdrop-blur-md border-t border-white/5">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-6 py-3 text-sm font-[Oswald] tracking-wider uppercase transition-colors no-underline ${
                location === link.href
                  ? "text-[#4fc3f7] bg-white/5"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
