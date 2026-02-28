import { Outfit } from "next/font/google";
import { Toaster } from "react-hot-toast";
import StoreProvider from "@/app/StoreProvider";
import { AuthProvider } from "@/lib/auth-context";
import { ChatProvider } from "@/lib/chat-context";
import { ThemeProvider } from "@/lib/theme-context";
import { LanguageProvider } from "@/lib/language-context";
import ChatWindow from "@/components/ChatWindow";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata = {
    title: "Manuva - Handmade Marketplace",
    description: "Manuva - Handmade Marketplace",
};

export default function RootLayout({ children }) {
    return (
        <html lang="ar" dir="rtl">
            <body className={`${outfit.className} antialiased transition-colors duration-300`}>
                <StoreProvider>
                    <AuthProvider>
                        <ThemeProvider>
                            <LanguageProvider>
                                <ChatProvider>
                                    <Toaster />
                                    {children}
                                    <ChatWindow />
                                </ChatProvider>
                            </LanguageProvider>
                        </ThemeProvider>
                    </AuthProvider>
                </StoreProvider>
            </body>
        </html>
    );
}

