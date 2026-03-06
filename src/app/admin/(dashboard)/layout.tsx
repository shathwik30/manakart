import AdminSidebar from "@/components/admin/Sidebar";
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-50 min-h-screen">
      <AdminSidebar />
      <main className="ml-64 p-8 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
