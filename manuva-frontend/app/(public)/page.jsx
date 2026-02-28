'use client'
import BestSelling from "@/components/BestSelling";
import Hero from "@/components/Hero";
import Newsletter from "@/components/Newsletter";
import OurSpecs from "@/components/OurSpec";
import LatestProducts from "@/components/LatestProducts";

export default function Home() {
    return (
        <div>
            <Hero />
            <div className="bg-secondary text-secondary-foreground px-6 py-4 rounded-xl my-6">
                <p className="text-sm">هذا مربع بخلفية سوداء ونص أبيض</p>
            </div>
            <LatestProducts />
            <BestSelling />
            <OurSpecs />
            <Newsletter />
        </div>
    );
}
