import AdminLayout from "@/components/admin/AdminLayout";

export const metadata = {
    title: "Manuva - Admin",
    description: "Manuva - Admin",
};

export default function RootAdminLayout({ children }) {

    return (
        <>
            <AdminLayout>
                {children}
            </AdminLayout>
        </>
    );
}
