'use client'
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LogOutIcon, UserIcon } from "lucide-react"

const AdminNavbar = () => {
    const [user, setUser] = useState(null)
    const router = useRouter()

    useEffect(() => {
        const userStr = localStorage.getItem('user')
        if (userStr) {
            setUser(JSON.parse(userStr))
        }
    }, [])

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/login')
        window.location.reload()
    }

    return (
        <div className="flex items-center justify-between px-12 py-3 border-b border-slate-200 transition-all bg-white sticky top-0 z-50">
            <Link href="/" className="relative text-3xl font-semibold text-slate-700">
                <span className="text-orange-600">manuva</span>
                <p className="absolute text-[10px] uppercase tracking-tighter font-bold -top-1 -right-10 px-2 p-0.5 rounded-full flex items-center gap-2 text-white bg-green-500">
                    Admin
                </p>
            </Link>
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-slate-600">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                        <UserIcon size={16} />
                    </div>
                    <p className="text-sm font-medium">Hi, {user?.name || 'Admin'}</p>
                </div>
                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-red-500 hover:text-red-600 transition-all text-sm font-medium border-l pl-6 border-slate-200"
                >
                    <LogOutIcon size={16} />
                    Logout
                </button>
            </div>
        </div>
    )
}

export default AdminNavbar