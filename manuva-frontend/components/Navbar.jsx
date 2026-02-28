"use client";
import {
  Search,
  ShoppingCart,
  Sparkles,
  MessageCircle,
  User,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useChat } from "@/lib/chat-context";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { useTheme } from "@/lib/theme-context";

const Navbar = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const cartCount = useSelector((state) => state.cart.total);
  const { unreadCount } = useChat();
  const { user, isAuthenticated, logout } = useAuth();
  const { t, language } = useLanguage();
  const { theme } = useTheme();

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(`/shop?search=${search}`);
  };

  return (
    <nav className="relative bg-surface/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="mx-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto py-4 transition-all">
          <Link href="/" className="relative flex items-center gap-2 group">
            <div className="relative">
              <span className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-brand-black via-brand-dark to-brand-orange bg-clip-text text-transparent">
                Manuva
              </span>
              <Sparkles className="absolute -top-1 -right-6 text-brand-orange w-4 h-4 group-hover:rotate-12 transition-transform" />
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4 lg:gap-8 text-foreground font-medium">
            <Link href="/" className="hover:text-primary transition-colors">
              {t("home")}
            </Link>
            <Link href="/shop" className="hover:text-primary transition-colors">
              {t("shop")}
            </Link>
            <Link
              href="/about"
              className="hover:text-primary transition-colors"
            >
              {t("about")}
            </Link>
            <Link
              href="/contact"
              className="hover:text-primary transition-colors"
            >
              {t("contact")}
            </Link>

            <form
              onSubmit={handleSearch}
              className="hidden xl:flex items-center w-xs text-sm gap-2 bg-surface border border-border px-4 py-2.5 rounded-full hover:shadow-sm transition-shadow"
            >
              <Search size={18} className="text-primary" />
              <input
                className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
                type="text"
                placeholder={
                  language === "ar"
                    ? "ابحث عن منتجات حرفية..."
                    : "Search for handmade products..."
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                required
              />
            </form>

            <div className="flex items-center gap-6">
              {isAuthenticated && (
                <Link
                  href="/chat"
                  className="relative flex items-center gap-2 text-foreground hover:text-primary transition-colors"
                  title={t("chat")}
                >
                  <div className="relative">
                    <MessageCircle size={22} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-2 -right-2 text-[10px] text-white bg-red-500 px-1.5 py-0.5 rounded-full font-bold shadow-sm">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <span className="lg:inline hidden">
                    {language === "ar" ? "المحادثات" : "Chat"}
                  </span>
                </Link>
              )}

              <Link
                href="/cart"
                className="relative flex items-center gap-2 text-foreground hover:text-primary transition-colors"
              >
                <ShoppingCart size={20} />
                <span className="lg:inline hidden">
                  {language === "ar" ? "السلة" : "Cart"}
                </span>
                <span className="absolute -top-1 -right-2 text-[8px] text-white bg-gradient-to-r from-brand-orange to-brand-dark px-1.5 py-0.5 rounded-full font-bold">
                  {cartCount}
                </span>
              </Link>

              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 px-5 py-2 bg-surface border border-border text-brand-black hover:bg-muted transition-all rounded-full font-medium shadow-sm active:scale-95"
                  >
                    <User size={18} />
                    {t("my_account")}
                  </button>

                  {showDropdown && (
                    <div className="absolute top-full mt-2 left-0 w-48 bg-surface border border-border rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in duration-200">
                      <Link
                        href={
                          user?.role === "artisan"
                            ? "/store"
                            : user?.role === "admin"
                              ? "/admin"
                              : "/profile"
                        }
                        className="flex items-center gap-3 px-4 py-2 hover:bg-muted text-sm transition-colors text-foreground"
                        onClick={() => setShowDropdown(false)}
                      >
                        <User size={16} />
                        {t("profile")}
                      </Link>
                      <Link
                        href="/orders"
                        className="flex items-center gap-3 px-4 py-2 hover:bg-muted text-sm transition-colors text-foreground"
                        onClick={() => setShowDropdown(false)}
                      >
                        <ShoppingCart size={16} />
                        {language === "ar" ? "طلباتي" : "My Orders"}
                      </Link>
                      <div className="h-px bg-border my-1 mx-2"></div>
                      <button
                        onClick={() => {
                          logout();
                          setShowDropdown(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 text-red-500 text-sm transition-colors"
                      >
                        <LogOut size={16} />
                        {t("logout")}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="px-6 py-2 bg-secondary text-secondary-foreground border border-black hover:bg-neutral-700 hover:shadow-lg hover:scale-105 transition-all rounded-full font-medium"
                >
                  {t("login") || "دخول"}
                </Link>
              )}
            </div>
          </div>

          {/* Mobile User Button  */}
          <div className="md:hidden flex items-center gap-3">
            {isAuthenticated && (
              <Link href="/chat" className="relative text-foreground">
                <MessageCircle size={22} />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 text-[10px] text-white bg-red-500 px-1.5 py-0.5 rounded-full font-bold">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )}

            <div className="relative">
              {isAuthenticated ? (
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="px-5 py-1.5 bg-gradient-to-r from-brand-orange to-brand-dark hover:shadow-lg text-sm transition-all text-white rounded-full font-medium"
                >
                  {t("my_account")}
                </button>
              ) : (
                <Link
                  href="/login"
                  className="px-5 py-1.5 bg-secondary text-secondary-foreground border border-black hover:bg-neutral-700 hover:shadow-lg text-sm transition-all rounded-full font-medium"
                >
                  {language === "ar" ? "دخول" : "Login"}
                </Link>
              )}

              {showDropdown && isAuthenticated && (
                <div className="absolute top-full mt-2 right-0 w-48 bg-surface border border-border rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in duration-200">
                  <Link
                    href={
                      user?.role === "artisan"
                        ? "/store"
                        : user?.role === "admin"
                          ? "/admin"
                          : "/profile"
                    }
                    className="flex items-center gap-3 px-4 py-2 hover:bg-muted text-sm transition-colors text-foreground"
                    onClick={() => setShowDropdown(false)}
                  >
                    <User size={16} />
                    {t("profile")}
                  </Link>
                  <Link
                    href="/orders"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-muted text-sm transition-colors text-foreground"
                    onClick={() => setShowDropdown(false)}
                  >
                    <ShoppingCart size={16} />
                    {language === "ar" ? "طلباتي" : "My Orders"}
                  </Link>
                  <div className="h-px bg-border my-1 mx-2"></div>
                  <button
                    onClick={() => {
                      logout();
                      setShowDropdown(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 text-red-500 text-sm transition-colors text-right"
                  >
                    <LogOut size={16} />
                    {t("logout")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
