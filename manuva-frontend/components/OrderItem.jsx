'use client'
import Image from "next/image";
import { DotIcon } from "lucide-react";
import { useSelector } from "react-redux";
import Rating from "./Rating";
import { useState } from "react";
import RatingModal from "./RatingModal";

const OrderItem = ({ order }) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';
    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001';
    const [ratingModal, setRatingModal] = useState(null);

    const { ratings } = useSelector(state => state.rating);

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return `${backendUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
    };

    const shippingAddress = typeof order.shipping_address === 'string' 
        ? JSON.parse(order.shipping_address) 
        : order.shipping_address;

    return (
        <>
            <tr className="text-sm">
                <td className="text-start">
                    <div className="flex flex-col gap-6">
                        {order.items.map((item, index) => (
                            <div key={index} className="flex items-center gap-4">
                                <div className="w-20 aspect-square bg-slate-100 flex items-center justify-center rounded-md overflow-hidden relative">
                                    {item.product_image ? (
                                        <Image
                                            className="object-cover w-full h-full"
                                            src={getImageUrl(item.product_image)}
                                            alt={item.product_name}
                                            fill
                                        />
                                    ) : (
                                        <div className="text-slate-400 text-xs">No Image</div>
                                    )}
                                </div>
                                <div className="flex flex-col justify-center text-sm">
                                    <p className="font-medium text-slate-600 text-base">{item.product_name}</p>
                                    <div className="flex items-center gap-2 mt-1 mb-2">
                                        <span className="font-bold">{currency}{item.price_at_purchase}</span>
                                        <span className="text-slate-400 text-xs">Qty: {item.quantity}</span>
                                    </div>
                                    <p className="mb-1 text-xs text-slate-400">{new Date(order.created_at).toDateString()}</p>
                                    <div>
                                        {ratings && ratings.find(rating => item.product_id === rating.productId)
                                            ? <Rating value={ratings.find(rating => item.product_id === rating.productId).rating} />
                                            : <button onClick={() => setRatingModal({ orderId: order.id, productId: item.product_id })} className={`text-green-500 hover:bg-green-50 transition border border-green-500/20 px-3 py-1 rounded-full text-xs font-bold ${order.status.toLowerCase() !== "delivered" && 'hidden'}`}>Rate Product</button>
                                        }</div>
                                    {ratingModal && <RatingModal ratingModal={ratingModal} setRatingModal={setRatingModal} />}
                                </div>
                            </div>
                        ))}
                    </div>
                </td>

                <td className="text-center max-md:hidden font-bold">{currency}{order.total}</td>

                <td className="text-start max-md:hidden text-xs text-slate-500">
                    {shippingAddress ? (
                        <>
                            <p className="font-medium text-slate-700">{shippingAddress.name || order.buyer_name}</p>
                            <p>{shippingAddress.address || shippingAddress.street}</p>
                            <p>{shippingAddress.city}, {shippingAddress.state || ''}</p>
                            <p>{shippingAddress.phone}</p>
                        </>
                    ) : (
                        <p>No address info</p>
                    )}
                </td>

                <td className="text-start space-y-2 text-sm max-md:hidden">
                    <div
                        className={`inline-flex items-center justify-center gap-1 rounded-full py-1 px-3 ${order.status.toLowerCase() === 'confirmed'
                            ? 'text-yellow-500 bg-yellow-100'
                            : order.status.toLowerCase() === 'delivered'
                                ? 'text-green-500 bg-green-100'
                                : 'text-slate-500 bg-slate-100'
                            }`}
                    >
                        <DotIcon size={10} className="scale-250" />
                        {order.status.split('_').join(' ').toLowerCase()}
                    </div>
                </td>
            </tr>
            {/* Mobile */}
            <tr className="md:hidden">
                <td colSpan={5} className="pb-4">
                    <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-1">
                        <p className="font-bold">{shippingAddress?.name || order.buyer_name}</p>
                        <p>{shippingAddress?.address || shippingAddress?.street}, {shippingAddress?.city}</p>
                        <p>{shippingAddress?.phone}</p>
                    </div>
                    <div className="flex items-center mt-3">
                        <span className={`text-center mx-auto px-6 py-1.5 rounded-full text-xs font-bold ${order.status.toLowerCase() === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`} >
                            {order.status.replace(/_/g, ' ').toLowerCase()}
                        </span>
                    </div>
                </td>
            </tr>
            <tr>
                <td colSpan={4}>
                    <div className="border-b border-slate-100 w-full mx-auto my-4" />
                </td>
            </tr>
        </>
    )
}

export default OrderItem