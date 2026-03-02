import { Outfit } from "next/font/google";
import { Toaster } from "react-hot-toast";
import StoreProvider from "@/app/StoreProvider";
import AdminLayout from "@/components/admin/AdminLayout";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata = {
    title: "Manuva - Admin Dashboard",
    description: "Admin panel for Manuva marketplace",
};

export default function RootLayout({ children }) {
    return (
        <html lang="ar" dir="rtl">
            <body className={`${outfit.className} antialiased transition-colors duration-300`}>
                <StoreProvider>
                    <Toaster />
                    <AdminLayout>
                        {children}
                    </AdminLayout>
                </StoreProvider>
            </body>
        </html>
    );
}
