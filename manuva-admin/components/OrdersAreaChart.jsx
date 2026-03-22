'use client'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts'
import { useState, useEffect } from 'react'
import { apiRequest } from '@/lib/api'
import { Filter, Calendar, BarChart3, Loader2 } from 'lucide-react'

export default function OrdersAreaChart() {

    const [type, setType] = useState('orders_by_date')
    const [period, setPeriod] = useState('day')
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchAnalytics = async () => {
        setLoading(true)
        try {
            const result = await apiRequest(`/admin/analytics?type=${type}&period=${period}`)
            setData(result)
        } catch (error) {
            console.error('Failed to fetch analytics:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAnalytics()
    }, [type, period])

    const COLORS = ['#681D2C', '#B2C9DA', '#7B5F5F', '#BEAAAC', '#4B3237', '#D5CECB', '#9D8686', '#87A4BC'];

    return (
        <div className="w-full h-full min-h-[400px] flex flex-col">
            <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-semibold text-slate-800 tracking-tight">Analytics Explorer</h3>
                    <p className="text-xs text-slate-500">Visualize your platform performance</p>
                </div>

                <div className="flex items-center gap-3 bg-slate-50 p-1 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-1.5 px-2">
                        <BarChart3 size={14} className="text-slate-400" />
                        <select 
                            value={type} 
                            onChange={(e) => setType(e.target.value)}
                            className="text-xs bg-transparent border-none outline-none font-medium text-slate-600 cursor-pointer"
                        >
                            <option value="orders_by_date">Orders Over Time</option>
                            <option value="orders_by_seller">Orders by Seller</option>
                            <option value="orders_by_category">Orders by Product Category</option>
                        </select>
                    </div>

                    <div className="w-px h-4 bg-slate-200" />

                    <div className="flex items-center gap-1.5 px-2">
                        <Calendar size={14} className="text-slate-400" />
                        <select 
                            value={period} 
                            onChange={(e) => setPeriod(e.target.value)}
                            disabled={type !== 'orders_by_date'}
                            className="text-xs bg-transparent border-none outline-none font-medium text-slate-600 disabled:opacity-50 cursor-pointer"
                        >
                            <option value="day">Daily</option>
                            <option value="week">Weekly</option>
                            <option value="month">Monthly</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="h-[400px] w-full relative">
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10 rounded-xl transition-all">
                        <Loader2 className="animate-spin text-brand-orange" size={32} />
                    </div>
                )}

                <ResponsiveContainer width="100%" height="100%">
                    {type === 'orders_by_date' ? (
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#681D2C" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#681D2C" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                                dataKey="date" 
                                fontSize={10} 
                                tickFormatter={(val) => new Date(val).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                axisLine={false}
                                tickLine={false}
                                dy={10}
                            />
                            <YAxis 
                                fontSize={10} 
                                axisLine={false} 
                                tickLine={false}
                                tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(1)}k` : val}
                            />
                            <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                labelStyle={{ fontWeight: '600', marginBottom: '4px' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="count" 
                                name="Orders"
                                stroke="#681D2C" 
                                strokeWidth={3}
                                fillOpacity={1} 
                                fill="url(#colorValue)" 
                            />
                            <Area 
                                type="monotone" 
                                dataKey="revenue" 
                                name="Revenue"
                                stroke="#7B5F5F" 
                                strokeWidth={2}
                                fill="transparent" 
                                strokeDasharray="5 5"
                            />
                        </AreaChart>
                    ) : (
                        <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                            <XAxis type="number" fontSize={10} axisLine={false} tickLine={false} />
                            <YAxis dataKey="label" type="category" fontSize={10} width={100} axisLine={false} tickLine={false} />
                            <Tooltip 
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar dataKey="value" name="Value (DA)" radius={[0, 4, 4, 0]}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    )}
                </ResponsiveContainer>
            </div>

            <div className="mt-4 flex items-center justify-center gap-6 text-[10px] text-slate-400 font-medium">
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-brand-orange" />
                    <span>Total Orders</span>
                </div>
                {type === 'orders_by_date' && (
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full border border-brand-dark border-dashed" />
                        <span>Platform Revenue</span>
                    </div>
                )}
            </div>
        </div>
    )
}
