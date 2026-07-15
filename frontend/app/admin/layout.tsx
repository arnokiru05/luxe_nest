import { ReactNode } from "react";
import { AdminSidebar } from "./components/admin-sidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <AdminSidebar />
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* We add a scrollable container for the main content area */}
        <div className="flex-1 overflow-auto bg-gray-50 p-6 lg:p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
