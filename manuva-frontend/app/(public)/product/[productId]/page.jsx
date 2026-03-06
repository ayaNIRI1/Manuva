'use client'
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import Loading from "@/components/Loading";
import ProductDescription from "@/components/ProductDescription";
import ProductDetails from "@/components/ProductDetails";

export default function Product() {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProduct = async () => {
        try {
            const data = await apiRequest(`/products/${productId}`);
            setProduct(data);
        } catch (error) {
            console.error('Fetch product error:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchProduct()
        scrollTo(0, 0)
    }, [productId]);

    if (loading) return <Loading />;

    return (
        <div className="mx-6">
            <div className="max-w-7xl mx-auto">

                {/* Breadcrums */}
                <div className="  text-gray-600 text-sm mt-8 mb-5 uppercase font-bold tracking-widest text-[10px]">
                    Home / Products / {product?.category_name || product?.category}
                </div>

                {/* Product Details */}
                {product && (<ProductDetails product={product} />)}

                {/* Description & Reviews */}
                {product && (<ProductDescription product={product} />)}
            </div>
        </div>
    );
}