'use client'
import Loading from "@/components/Loading"
import OrdersAreaChart from "@/components/OrdersAreaChart"
import { CircleDollarSignIcon, ShoppingBasketIcon, StoreIcon, TagsIcon, AlertCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { apiRequest } from "@/lib/api"

export default function AdminDashboard() {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'DA'

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [dashboardData, setDashboardData] = useState({
        products: 0,
        profit: 0,
        orders: 0,
        stores: 0,
        allOrders: [],
    })

    const dashboardCardsData = [
        { title: 'Total Products', value: dashboardData.products || 0, icon: ShoppingBasketIcon },
        { title: 'Platform Profit (5%)', value: (Number(dashboardData.profit) || 0).toFixed(2) + ' ' + currency, icon: CircleDollarSignIcon },
        { title: 'Total Orders', value: dashboardData.orders || 0, icon: TagsIcon },
        { title: 'Total Stores', value: dashboardData.stores || 0, icon: StoreIcon },
    ]

    const fetchDashboardData = async () => {
        try {
            const data = await apiRequest('/admin/dashboard')
            setDashboardData(data)
            setError(null)
        } catch (err) {
            console.error('Failed to fetch admin stats:', err)
            setError(err.message || 'Failed to load dashboard data')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDashboardData()
    }, [])

    if (loading) return <Loading />

    return (
        <div className="text-slate-500">
            <h1 className="text-2xl">Admin <span className="text-slate-800 font-medium">Dashboard</span></h1>

            {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
                    <AlertCircle size={18} />
                    <div>
                        <p className="font-semibold">Failed to load dashboard data</p>
                        <p className="text-sm text-red-500">{error}</p>
                    </div>
                    <button onClick={fetchDashboardData} className="ml-auto text-sm bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-lg font-medium transition">Retry</button>
                </div>
            )}

            {/* Cards */}
            <div className="flex flex-wrap gap-5 my-10 mt-4">
                {
                    dashboardCardsData.map((card, index) => (
                        <div key={index} className="flex items-center gap-10 border border-slate-200 p-3 px-6 rounded-lg">
                            <div className="flex flex-col gap-3 text-xs">
                                <p>{card.title}</p>
                                <b className="text-2xl font-medium text-slate-700">{card.value}</b>
                            </div>
                            <card.icon size={50} className=" w-11 h-11 p-2.5 text-slate-400 bg-slate-100 rounded-full" />
                        </div>
                    ))
                }
            </div>

            {/* Area Chart */}
            <OrdersAreaChart allOrders={dashboardData.allOrders || []} />
        </div>
    )
}