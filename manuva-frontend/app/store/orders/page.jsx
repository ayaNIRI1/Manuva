'use client'
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import Loading from "@/components/Loading"
import { apiRequest } from "@/lib/api"
import { useLanguage } from "@/lib/language-context"

export default function StoreOrders() {
    const { language } = useLanguage()
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'
    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001'

    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)


    const fetchOrders = async () => {
        try {
            const data = await apiRequest('/orders/seller/orders')
            setOrders(data)
        } catch (error) {
            console.error('Fetch artisan orders error:', error)
            toast.error(language === 'ar' ? 'فشل جلب الطلبات' : 'Failed to fetch orders')
        } finally {
            setLoading(false)
        }
    }

    const updateOrderStatus = async (orderId, status) => {
        try {
            await apiRequest(`/orders/${orderId}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status })
            })
            toast.success(language === 'ar' ? 'تم تحديث حالة الطلب' : 'Order status updated')
            fetchOrders()
        } catch (error) {
            console.error('Update order status error:', error)
            toast.error(language === 'ar' ? 'فشل تحديث حالة الطلب' : 'Failed to update order status')
        }
    }

    const openModal = (order) => {
        setSelectedOrder(order)
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setSelectedOrder(null)
        setIsModalOpen(false)
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    if (loading) return <Loading />

    const getStatusColor = (status) => {
        switch(status) {
            case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100'
            case 'confirmed': return 'bg-blue-50 text-blue-600 border-blue-100'
            case 'shipped': return 'bg-indigo-50 text-indigo-600 border-indigo-100'
            case 'delivered': return 'bg-green-50 text-green-600 border-green-100'
            case 'cancelled': return 'bg-red-50 text-red-600 border-red-100'
            default: return 'bg-slate-50 text-slate-600 border-slate-100'
        }
    }

    const getStatusLabel = (status) => {
        if (language === 'ar') {
            switch(status) {
                case 'pending': return 'قيد الانتظار'
                case 'confirmed': return 'تم التأكيد'
                case 'shipped': return 'تم الشحن'
                case 'delivered': return 'تم التوصيل'
                case 'cancelled': return 'ملغى'
                default: return status
            }
        }
        return status.charAt(0).toUpperCase() + status.slice(1)
    }

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-8">
                {language === 'ar' ? 'طلبات' : 'Store'} <span className="text-brand-orange">{language === 'ar' ? 'المتجر' : 'Orders'}</span>
            </h1>

            {orders.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-100 p-20 text-center shadow-sm">
                    <p className="text-slate-400 font-medium">
                        {language === 'ar' ? 'لا توجد طلبات بعد' : 'No orders found yet'}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{language === 'ar' ? '#' : 'Sr.'}</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{language === 'ar' ? 'الزبون' : 'Customer'}</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{language === 'ar' ? 'الإجمالي' : 'Total'}</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{language === 'ar' ? 'الدفع' : 'Payment'}</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 font-medium">
                                {orders.map((order, index) => (
                                    <tr
                                        key={order.id}
                                        className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                                        onClick={() => openModal(order)}
                                    >
                                        <td className="px-6 py-4 text-brand-orange font-bold">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-foreground font-bold">{order.buyer_name}</p>
                                            <p className="text-[10px] text-slate-400">{order.buyer_email}</p>
                                        </td>
                                        <td className="px-6 py-4 font-extrabold text-brand-mauve">{currency}{order.total}</td>
                                        <td className="px-6 py-4 text-[10px] uppercase font-bold text-slate-500">{order.payment_method}</td>
                                        <td className="px-6 py-4" onClick={(e) => { e.stopPropagation() }}>
                                            <select
                                                value={order.status}
                                                onChange={e => updateOrderStatus(order.id, e.target.value)}
                                                className={`text-[10px] font-bold border rounded-full px-3 py-1 outline-none appearance-none cursor-pointer transition-all ${getStatusColor(order.status)}`}
                                            >
                                                <option value="pending">{getStatusLabel('pending')}</option>
                                                <option value="confirmed">{getStatusLabel('confirmed')}</option>
                                                <option value="shipped">{getStatusLabel('shipped')}</option>
                                                <option value="delivered">{getStatusLabel('delivered')}</option>
                                                <option value="cancelled">{getStatusLabel('cancelled')}</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-[10px] text-slate-400">
                                            {new Date(order.created_at).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
                                                year: 'numeric', month: 'short', day: 'numeric'
                                            })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && selectedOrder && (
                <div onClick={closeModal} className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4" >
                    <div onClick={e => e.stopPropagation()} className="bg-white rounded-[40px] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 relative scale-100 transition-transform">
                        <button onClick={closeModal} className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-red-500 transition-colors">
                            ✕
                        </button>
                        
                        <h2 className="text-2xl font-black text-foreground mb-8 flex items-center gap-3">
                            <span className="w-2 h-8 bg-brand-orange rounded-full"></span>
                            {language === 'ar' ? 'تفاصيل الطلب' : 'Order Details'}
                        </h2>

                        <div className="grid md:grid-cols-2 gap-8 mb-8">
                            <div className="bg-slate-50 p-6 rounded-3xl">
                                <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-4">{language === 'ar' ? 'بيانات الزبون' : 'Customer Info'}</h3>
                                <div className="space-y-2">
                                    <p className="font-bold text-foreground">{selectedOrder.buyer_name}</p>
                                    <p className="text-sm text-slate-500">{selectedOrder.buyer_email}</p>
                                    <p className="text-sm text-slate-500">{selectedOrder.shipping_address?.phone || '-'}</p>
                                </div>
                            </div>
                            
                            <div className="bg-slate-50 p-6 rounded-3xl">
                                <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-4">{language === 'ar' ? 'عنوان الشحن' : 'Shipping Address'}</h3>
                                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                    {`${selectedOrder.shipping_address?.address || ''}, ${selectedOrder.shipping_address?.city || ''}`}
                                </p>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-4">{language === 'ar' ? 'المنتجات' : 'Products'}</h3>
                            <div className="space-y-4">
                                {selectedOrder.items.map((item, i) => {
                                    const itemImageUrl = item.product_image 
                                        ? (item.product_image.startsWith('http') 
                                            ? item.product_image 
                                            : `${backendUrl}${item.product_image.startsWith('/') ? '' : '/'}${item.product_image}`)
                                        : null;

                                    return (
                                        <div key={i} className="flex items-center gap-4 bg-white border border-slate-100 p-4 rounded-3xl hover:border-brand-orange/20 transition-colors">
                                            <div className="w-16 h-16 rounded-2xl bg-slate-50 overflow-hidden flex-shrink-0 border border-slate-50">
                                                {itemImageUrl ? (
                                                    <img src={itemImageUrl} alt={item.product_name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-slate-100">📦</div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-foreground truncate">{item.product_name}</p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                                                        QTY: {item.quantity}
                                                    </span>
                                                    <span className="text-sm font-extrabold text-brand-orange">
                                                        {currency}{item.price_at_purchase}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-6 pt-6 border-t border-slate-100">
                           <div className="flex items-center gap-4">
                               <div className={`px-4 py-2 rounded-2xl border text-sm font-black ${getStatusColor(selectedOrder.status)}`}>
                                   {getStatusLabel(selectedOrder.status)}
                               </div>
                               <div className="text-[10px] font-bold text-slate-400">
                                   {new Date(selectedOrder.created_at).toLocaleString()}
                               </div>
                           </div>
                           
                           <div className="text-right">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{language === 'ar' ? 'الإجمالي الكلي' : 'Order Total'}</p>
                               <p className="text-3xl font-black text-brand-mauve">{currency}{selectedOrder.total}</p>
                           </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
