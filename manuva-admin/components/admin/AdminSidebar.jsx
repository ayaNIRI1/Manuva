'use client'

import { usePathname } from "next/navigation"
import { HomeIcon, StoreIcon, TicketPercentIcon, ShoppingBasketIcon, MessageSquareIcon, TagsIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { assets } from "@/assets/assets"

const AdminSidebar = () => {

    const pathname = usePathname()

    const sidebarLinks = [
        { name: 'Dashboard', href: '/', icon: HomeIcon },
        { name: 'Stores', href: '/stores', icon: StoreIcon },
        { name: 'Products', href: '/products', icon: ShoppingBasketIcon },
        { name: 'Categories', href: '/categories', icon: TagsIcon },
        { name: 'Comments', href: '/reviews', icon: MessageSquareIcon },
    ]

    return (
        <div className="inline-flex h-full flex-col gap-5 bg-secondary text-secondary-foreground border-r border-secondary/50 sm:min-w-60">
            <div className="flex flex-col gap-3 justify-center items-center pt-8 max-sm:hidden">
                <Image className="w-14 h-14 rounded-full" src={assets.manuva_logo} alt="" width={80} height={80} />
                <p className="text-secondary-foreground font-medium">لوحة التحكم</p>
            </div>

            <div className="max-sm:mt-6">
                {
                    sidebarLinks.map((link, index) => (
                        <Link key={index} href={link.href} className={`relative flex items-center gap-3 text-secondary-foreground/80 hover:bg-white/10 hover:text-accent p-2.5 transition ${pathname === link.href && 'bg-white/20 sm:text-accent font-medium'}`}>
                            <link.icon size={18} className="sm:ml-5" />
                            <p className="max-sm:hidden">{link.name}</p>
                            {pathname === link.href && <span className="absolute bg-primary right-0 top-1.5 bottom-1.5 w-1 sm:w-1.5 rounded-l"></span>}
                        </Link>
                    ))
                }
            </div>
        </div>
    )
}

export default AdminSidebar