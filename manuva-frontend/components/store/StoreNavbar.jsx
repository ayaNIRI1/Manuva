'use client'
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useLanguage } from "@/lib/language-context"
import { useState } from "react"
import { User, LogOut, ShoppingCart, LayoutDashboard } from "lucide-react"

const StoreNavbar = () => {
    const { user, logout } = useAuth()
    const { t, language } = useLanguage()
    const [showDropdown, setShowDropdown] = useState(false)

    return (
        <div className="flex items-center justify-between px-8 py-4 border-b border-slate-200 bg-white sticky top-0 z-50">
            <Link href="/" className="relative text-3xl font-extrabold tracking-tight text-foreground">
                <span className="text-brand-orange">manuva</span>
                <span className="absolute -top-1 -right-10 px-2.5 py-0.5 bg-green-500 text-[10px] text-white rounded-full font-bold uppercase tracking-tighter">
                    Store
                </span>
            </Link>
            
            <div className="flex items-center gap-6">
                <div className="hidden sm:block text-right">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{language === 'ar' ? 'مرحباً بك' : 'Welcome back'}</p>
                    <p className="text-sm font-bold text-foreground">{user?.name}</p>
                </div>

                <div className="relative">
                    <button 
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="w-10 h-10 rounded-full bg-brand-mauve/10 flex items-center justify-center text-brand-mauve border-2 border-transparent hover:border-brand-mauve/30 transition-all overflow-hidden"
                    >
                        {user?.profile_img ? (
                            <img src={user.profile_img} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            <User size={20} />
                        )}
                    </button>

                    {showDropdown && (
                        <div className="absolute top-full mt-3 right-0 w-56 bg-surface border border-border rounded-[1.5rem] shadow-2xl py-3 z-50 animate-in fade-in zoom-in duration-200">
                            <div className="px-4 py-2 border-b border-border/50 mb-2 sm:hidden">
                                <p className="text-sm font-bold truncate">{user?.name}</p>
                            </div>
                            
                            <Link 
                                href="/profile" 
                                className="flex items-center gap-3 px-5 py-2.5 hover:bg-muted text-sm font-medium transition-colors"
                                onClick={() => setShowDropdown(false)}
                            >
                                <User size={18} className="text-muted-foreground" />
                                {t('profile')}
                            </Link>

                            <Link 
                                href="/" 
                                className="flex items-center gap-3 px-5 py-2.5 hover:bg-muted text-sm font-medium transition-colors"
                                onClick={() => setShowDropdown(false)}
                            >
                                <ShoppingCart size={18} className="text-muted-foreground" />
                                {language === 'ar' ? 'عودة للمتجر' : 'Back to Shop'}
                            </Link>

                            <div className="h-px bg-border/50 my-2 mx-3"></div>
                            
                            <button 
                                onClick={logout}
                                className="w-full flex items-center gap-3 px-5 py-2.5 hover:bg-red-50 text-red-500 text-sm font-bold transition-colors"
                            >
                                <LogOut size={18} />
                                {t('logout')}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default StoreNavbar