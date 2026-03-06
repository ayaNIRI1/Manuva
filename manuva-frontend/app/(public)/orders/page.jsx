'use client'
import PageTitle from "@/components/PageTitle"
import { useEffect, useState } from "react";
import OrderItem from "@/components/OrderItem";
import { apiRequest } from "@/lib/api";
import Loading from "@/components/Loading";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setRatings } from "@/lib/features/rating/ratingSlice";

export default function Orders() {
    const dispatch = useDispatch();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [ordersData, reviewsData] = await Promise.all([
                apiRequest('/orders'),
                apiRequest('/reviews/user')
            ]);
            
            setOrders(ordersData);
            
            // Map backend reviews to frontend Redux structure
            const mappedRatings = reviewsData.map(review => ({
                orderId: null, // Backend doesn't link review to specific order in the 'reviews' table
                productId: review.product_id,
                rating: review.rating,
                comment: review.comment
            }));
            
            dispatch(setRatings(mappedRatings));
        } catch (error) {
            console.error('Fetch orders error:', error);
            toast.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) return <Loading />;

    return (
        <div className="min-h-[70vh] mx-6">
            {orders.length > 0 ? (
                (
                    <div className="my-20 max-w-7xl mx-auto">
                        <PageTitle heading="My Orders" text={`Showing total ${orders.length} orders`} linkText={'Go to home'} />

                        <table className="w-full max-w-5xl text-slate-500 table-auto border-separate border-spacing-y-12 border-spacing-x-4">
                            <thead>
                                <tr className="max-sm:text-sm text-slate-600 max-md:hidden">
                                    <th className="text-start">Product</th>
                                    <th className="text-center">Total Price</th>
                                    <th className="text-start">Address</th>
                                    <th className="text-start">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <OrderItem order={order} key={order.id} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            ) : (
                <div className="min-h-[80vh] mx-6 flex items-center justify-center text-slate-400">
                    <h1 className="text-2xl sm:text-4xl font-semibold">You have no orders</h1>
                </div>
            )}
        </div>
    )
}