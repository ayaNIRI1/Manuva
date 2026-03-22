'use client'
import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/language-context";
import { apiRequest } from "@/lib/api";

const CategoriesMarquee = () => {
    const { language } = useLanguage();
    const [categoriesList, setCategoriesList] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await apiRequest('/categories');
                setCategoriesList(data || []);
            } catch (error) {
                console.error('Failed to load categories for marquee', error);
            }
        };
        fetchCategories();
    }, []);

    const getShortName = (str) => {
        if (!str) return '';
        // If it has (Arabic), extract parts
        let name = str;
        if (str.includes('(')) {
            const parts = str.split('(');
            const enPart = parts[0].trim();
            const arPart = parts[1].replace(')', '').trim();
            name = language === 'ar' ? arPart : enPart;
        }

        // Remove leading emojis/symbols (anything that isn't a letter/number at the start)
        // This handles cases like "🏺 Home Decor" -> "Home Decor"
        return name.replace(/^[\p{Emoji}\s\d\W]+/u, '').trim() || name;
    };

    if (categoriesList.length === 0) return null;

    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001';

    // Duplicate list to create infinite marquee effect
    const marqueeItems = [...categoriesList, ...categoriesList, ...categoriesList, ...categoriesList, ...categoriesList];

    return (
        <div className="overflow-hidden w-full relative max-w-7xl mx-auto select-none group sm:my-20">
            <div className="absolute left-0 top-0 h-full w-20 z-10 pointer-events-none bg-gradient-to-r from-brand-blush to-transparent" />
            <div className="flex min-w-[200%] animate-[marqueeScroll_10s_linear_infinite] sm:animate-[marqueeScroll_40s_linear_infinite] group-hover:[animation-play-state:paused] gap-4" >
                {marqueeItems.map((category, index) => (
                    <button key={index} title={category.name} className="flex items-center gap-2 px-5 py-2 bg-brand-pink/20 rounded-lg text-brand-prune text-xs sm:text-sm hover:bg-brand-mauve hover:text-white active:scale-95 transition-all duration-300 whitespace-nowrap">
                        {getShortName(category.name)}
                    </button>
                ))}
            </div>
            <div className="absolute right-0 top-0 h-full w-20 md:w-40 z-10 pointer-events-none bg-gradient-to-l from-brand-blush to-transparent" />
        </div>
    );
};

export default CategoriesMarquee;