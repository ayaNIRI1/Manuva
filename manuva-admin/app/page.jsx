'use client'
import Loading from "@/components/Loading"
import OrdersAreaChart from "@/components/OrdersAreaChart"
import { CircleDollarSignIcon, ShoppingBasketIcon, StoreIcon, TagsIcon, AlertCircle, Users, UserCheck, BarChart3, Calendar, TrendingUp, CheckCircle2, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { apiRequest } from "@/lib/api"

export default function AdminDashboard() {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'DA'

    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const [error, setError] = useState(null)
    const [successMessage, setSuccessMessage] = useState(null)

    const [dashboardData, setDashboardData] = useState({
        products: 0,
        profit: 0,
        orders: 0,
        stores: 0,
        revenue: 0,
        revenue_day: 0,
        revenue_week: 0,
        revenue_month: 0,
        active_users: 0,
        active_sellers: 0,
        aov: 0,
        allOrders: [],
    })

    const dashboardCardsData = [
        { title: 'Total Products', value: dashboardData.products || 0, icon: ShoppingBasketIcon },
        { title: 'Total Orders', value: dashboardData.orders || 0, icon: TagsIcon },
        { title: 'Total Stores', value: dashboardData.stores || 0, icon: StoreIcon },
        { title: 'Platform Profit (5%)', value: (Number(dashboardData.profit) || 0).toLocaleString() + ' ' + currency, icon: CircleDollarSignIcon },
        { title: 'Active Users', value: dashboardData.active_users || 0, icon: Users },
        { title: 'Active Sellers', value: dashboardData.active_sellers || 0, icon: UserCheck },
        { title: 'Avg. Order Value', value: (Number(dashboardData.aov) || 0).toFixed(2) + ' ' + currency, icon: TrendingUp },
    ]

    const revenueCardsData = [
        { title: 'Today', value: (Number(dashboardData.revenue_day) || 0).toLocaleString() + ' ' + currency, icon: Calendar },
        { title: 'This Week', value: (Number(dashboardData.revenue_week) || 0).toLocaleString() + ' ' + currency, icon: Calendar },
        { title: 'This Month', value: (Number(dashboardData.revenue_month) || 0).toLocaleString() + ' ' + currency, icon: Calendar },
        { title: 'Total Revenue', value: (Number(dashboardData.revenue) || 0).toLocaleString() + ' ' + currency, icon: BarChart3 },
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

    const handleApproveAll = async () => {
        if (!confirm('Are you sure you want to approve all pending products?')) return
        setActionLoading(true)
        try {
            const res = await apiRequest('/admin/products/approve-all', { method: 'PATCH' })
            setSuccessMessage(res.message)
            fetchDashboardData()
        } catch (err) {
            setError(err.message || 'Failed to approve products')
        } finally {
            setActionLoading(false)
        }
    }

    const handleExportData = async () => {
        setActionLoading(true)
        try {
            const token = localStorage.getItem('token')
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
            const response = await fetch(`${baseUrl}/admin/analytics/export`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            
            if (!response.ok) throw new Error('Export failed')
            
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `manuva_analytics_${new Date().toISOString().split('T')[0]}.csv`
            document.body.appendChild(a)
            a.click()
            a.remove()
            window.URL.revokeObjectURL(url)
            setSuccessMessage('Data exported successfully')
        } catch (err) {
            setError(err.message || 'Failed to export data')
        } finally {
            setActionLoading(false)
        }
    }

    useEffect(() => {
        fetchDashboardData()
    }, [])

    useEffect(() => {
        if (successMessage || error) {
            const timer = setTimeout(() => {
                setSuccessMessage(null)
                setError(null)
            }, 5000)
            return () => clearTimeout(timer)
        }
    }, [successMessage, error])

    if (loading) return <Loading />

    return (
        <div className="text-slate-700 pb-10 relative">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl">Admin <span className="text-foreground font-medium">Dashboard</span></h1>
            </div>

            {successMessage && (
                <div className="fixed top-4 right-4 z-50 bg-emerald-50 border border-emerald-200 text-emerald-700 px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
                    <CheckCircle2 size={20} />
                    <p className="font-medium">{successMessage}</p>
                </div>
            )}

            {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
                    <AlertCircle size={18} />
                    <div>
                        <p className="font-semibold">Operation Failed</p>
                        <p className="text-sm text-red-500">{error}</p>
                    </div>
                </div>
            )}

            {/* Platform Stats Row */}
            <div className="mt-8">
                <h2 className="text-lg font-medium mb-4">Platform Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {
                        dashboardCardsData.map((card, index) => (
                            <div key={index} className="flex items-center justify-between border border-slate-200 p-5 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex flex-col gap-1">
                                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{card.title}</p>
                                    <b className="text-2xl font-semibold text-slate-800">{card.value}</b>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-xl text-slate-600">
                                    <card.icon size={24} />
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>

            {/* Quick Actions Row */}
            <div className="mt-10">
                <h2 className="text-lg font-medium mb-4">Quick Actions / Shortcuts</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div 
                        onClick={handleApproveAll}
                        className="group flex items-center gap-4 border border-slate-200 p-5 rounded-2xl bg-white hover:border-brand-orange/30 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
                    >
                        <div className="p-4 bg-brand-light/20 text-brand-orange rounded-xl group-hover:bg-brand-orange group-hover:text-white transition-colors">
                            <CheckCircle2 size={28} />
                        </div>
                        <div className="flex flex-col gap-1">
                            <p className="font-bold text-slate-800">Approve All Products</p>
                            <p className="text-xs text-slate-500">Instantly verify all pending items</p>
                        </div>
                        {actionLoading && <Loader2 size={20} className="animate-spin absolute right-5 text-brand-orange" />}
                    </div>

                    <div 
                        className="group flex items-center gap-4 border border-slate-200 p-5 rounded-2xl bg-white hover:border-brand-orange/30 hover:shadow-md transition-all cursor-pointer"
                        onClick={handleExportData}
                    >
                        <div className="p-4 bg-brand-light/20 text-brand-orange rounded-xl group-hover:bg-brand-orange group-hover:text-white transition-colors">
                            <TrendingUp size={28} />
                        </div>
                        <div className="flex flex-col gap-1">
                            <p className="font-bold text-slate-800">Export Platform Data</p>
                            <p className="text-xs text-slate-500">Download orders and metrics as CSV</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Revenue Row */}
            <div className="mt-10">
                <h2 className="text-lg font-medium mb-4">Revenue Overview</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {
                        revenueCardsData.map((card, index) => (
                            <div key={index} className="flex flex-col gap-3 border border-slate-200 p-5 rounded-xl bg-brand-light/10 border-brand-light/30 hover:bg-brand-light/20 transition-colors">
                                <div className="flex items-center gap-3 text-brand-orange">
                                    <card.icon size={18} />
                                    <p className="text-xs font-semibold uppercase tracking-wider">{card.title}</p>
                                </div>
                                <b className="text-2xl font-semibold text-brand-black">{card.value}</b>
                            </div>
                        ))
                    }
                </div>
            </div>

            <div className="mt-10">
                {/* Analytics Explorer */}
                <div className="border border-slate-200 p-6 rounded-2xl bg-white shadow-sm">
                    <OrdersAreaChart />
                </div>
            </div>

        </div>
    )
}