import StoreLayout from "@/components/store/StoreLayout";

export const metadata = {
    title: "Manuva - Store Dashboard",
    description: "Manuva - Store Dashboard",
};

export default function RootAdminLayout({ children }) {

    return (
        <>
            <StoreLayout>
                {children}
            </StoreLayout>
        </>
    );
}
