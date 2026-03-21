"use client";
import {
  Search,
  ShoppingCart,
  Sparkles,
  MessageCircle,
  User,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Store,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    <nav className="relative border-b sticky top-0 z-50 bg-secondary/95 border-secondary/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between py-4 transition-all">
          <Link href="/" className="relative flex items-center gap-2 group">
            <span className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-secondary-foreground via-accent to-primary bg-clip-text text-transparent">
              Manuva
            </span>
            <Sparkles className="text-accent w-4 h-4 group-hover:rotate-12 transition-transform" />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4 lg:gap-8 font-medium text-secondary-foreground/90">
            <Link href="/" className="hover:text-accent transition-colors">
              {t("home")}
            </Link>
            <Link href="/shop" className="hover:text-accent transition-colors">
              {t("shop")}
            </Link>
            <Link href="/about" className="hover:text-accent transition-colors">
              {t("about")}
            </Link>
            <Link href="/contact" className="hover:text-accent transition-colors">
              {t("contact")}
            </Link>
          </div>

          <div className="hidden xl:flex items-center">
            <form
              onSubmit={handleSearch}
              className="flex items-center w-80 text-sm border border-white/10 pl-4 pr-1.5 py-1.5 rounded-full bg-black/20 hover:shadow-md transition-all focus-within:ring-2 focus-within:ring-accent/50 focus-within:border-accent group"
            >
              <Search
                size={18}
                className="text-secondary-foreground/50 group-focus-within:text-accent transition-colors"
              />
              <input
                className="flex-1 bg-transparent border-none outline-none px-2 text-secondary-foreground placeholder:text-secondary-foreground/50"
                type="text"
                placeholder={
                  language === "ar"
                    ? "ابحث عن منتجات..."
                    : "Search for products..."
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                required
              />
              <button
                type="submit"
                className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full font-medium hover:bg-accent hover:text-accent-foreground transition-all active:scale-95 whitespace-nowrap"
              >
                {language === "ar" ? "بحث" : "Search"}
              </button>
            </form>
          </div>

          <div className="flex items-center gap-3 lg:gap-6">
            <div className="hidden md:flex items-center gap-4 lg:gap-6">
              {isAuthenticated && (
                <Link
                  href="/chat"
                  className="relative flex items-center gap-2 text-secondary-foreground/90 hover:text-accent transition-colors"
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
                </Link>
              )}

              <Link
                href="/cart"
                className="relative flex items-center gap-2 text-secondary-foreground/90 hover:text-accent transition-colors"
              >
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-2 text-[8px] text-primary-foreground bg-primary px-1.5 py-0.5 rounded-full font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 px-5 py-2 border border-white/20 text-secondary-foreground bg-white/10 hover:bg-white/20 transition-all rounded-full font-medium shadow-sm active:scale-95"
                >
                  <User size={18} className="text-accent" />
                  <span className="hidden sm:inline">{t("my_account")}</span>
                </button>

                {showDropdown && (
                  <div className="absolute top-full mt-2 left-0 w-48 bg-surface border border-border rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in duration-200">
                    <Link
                      href={
                        user?.role === "artisan"
                          ? "/store"
                          : user?.role === "admin"
                            ? "http://localhost:3002"
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
            ) : (
              <Link
                href="/login"
                className="bg-primary text-primary-foreground px-6 py-2 shadow-md hover:bg-accent hover:text-accent-foreground hover:shadow-lg hover:scale-105 transition-all rounded-full font-medium"
              >
                {t("login") || "دخول"}
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 border border-border text-foreground bg-surface rounded-full shadow-sm active:scale-95"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-surface border-b border-border shadow-2xl py-6 px-6 z-50 animate-in slide-in-from-top duration-300">
          <div className="flex flex-col gap-5 text-lg font-medium">
            <Link href="/" className="flex items-center justify-between text-foreground" onClick={() => setMobileMenuOpen(false)}>
              {t("home")}
              <ChevronRight size={18} className="text-muted-foreground" />
            </Link>
            <Link href="/shop" className="flex items-center justify-between text-foreground" onClick={() => setMobileMenuOpen(false)}>
              {t("shop")}
              <ChevronRight size={18} className="text-muted-foreground" />
            </Link>
            <Link href="/about" className="flex items-center justify-between text-foreground" onClick={() => setMobileMenuOpen(false)}>
              {t("about")}
              <ChevronRight size={18} className="text-muted-foreground" />
            </Link>
            <Link href="/contact" className="flex items-center justify-between text-foreground" onClick={() => setMobileMenuOpen(false)}>
              {t("contact")}
              <ChevronRight size={18} className="text-muted-foreground" />
            </Link>
            <div className="my-2 border-t border-border" />
            {isAuthenticated ? (
               <button
                  onClick={logout}
                  className="bg-red-50 text-red-500 px-5 py-3 rounded-xl font-bold"
                >
                  {t("logout")}
                </button>
            ) : (
              <Link
                href="/login"
                className="bg-primary text-primary-foreground px-5 py-3 hover:bg-accent hover:shadow-lg transition-all rounded-xl font-bold text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("login")}
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
