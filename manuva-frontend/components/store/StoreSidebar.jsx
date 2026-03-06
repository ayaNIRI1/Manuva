'use client'
import { usePathname } from "next/navigation"
import { HomeIcon, LayoutListIcon, SquarePenIcon, SquarePlusIcon } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/lib/language-context"

const StoreSidebar = ({storeInfo}) => {
    const { language } = useLanguage()

    const pathname = usePathname()

    const sidebarLinks = [
        { name: 'Dashboard', href: '/store', icon: HomeIcon },
        { name: 'Add Product', href: '/store/add-product', icon: SquarePlusIcon },
        { name: 'Manage Product', href: '/store/manage-product', icon: SquarePenIcon },
        { name: 'Orders', href: '/store/orders', icon: LayoutListIcon },
    ]

    return (
        <div className="inline-flex h-full flex-col gap-5 border-r border-slate-200 sm:min-w-60">
            <div className="flex flex-col gap-3 justify-center items-center pt-8 max-sm:hidden px-4 text-center">
                <div className="w-20 h-20 rounded-2xl bg-brand-mauve/10 flex items-center justify-center text-brand-mauve overflow-hidden border border-brand-mauve/20 shadow-sm transition-transform hover:scale-105">
                    {storeInfo?.profile_img ? (
                        <img className="w-full h-full object-cover" src={storeInfo?.profile_img} alt={storeInfo?.name} />
                    ) : (
                        <div className="text-3xl font-bold">{storeInfo?.name?.charAt(0)}</div>
                    )}
                </div>
                <p className="text-slate-800 font-extrabold text-lg tracking-tight leading-tight">{storeInfo?.name}</p>
                <div className="px-3 py-1 bg-green-500/10 text-green-600 text-[10px] font-bold uppercase rounded-full border border-green-500/20">
                    Artisan Account
                </div>
            </div>

            <div className="max-sm:mt-6">
                {
                    sidebarLinks.map((link, index) => (
                        <Link key={index} href={link.href} className={`relative flex items-center gap-3 text-slate-500 hover:bg-slate-50 p-2.5 transition ${pathname === link.href && 'bg-slate-100 sm:text-slate-600'}`}>
                            <link.icon size={18} className="sm:ml-5" />
                            <p className="max-sm:hidden">{link.name}</p>
                            {pathname === link.href && <span className="absolute bg-green-500 right-0 top-1.5 bottom-1.5 w-1 sm:w-1.5 rounded-l"></span>}
                        </Link>
                    ))
                }
            </div>
        </div>
    )
}

export default StoreSidebar