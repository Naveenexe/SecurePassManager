import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "./Sidebar";
import { TopNavigation } from "./TopNavigation";

interface MainLayoutProps {
  children: React.ReactNode;
  onAddPassword?: () => void;
  onSearch?: (query: string) => void;
}

export function MainLayout({ children, onAddPassword, onSearch }: MainLayoutProps) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  const handleAddPassword = () => {
    onAddPassword?.();
  };

  const handleSearch = (query: string) => {
    onSearch?.(query);
  };

  if (!user) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex h-screen">
      <Sidebar 
        user={user} 
        isOpen={sidebarOpen} 
        onClose={handleSidebarClose} 
      />
      
      <main className="flex-1 flex flex-col min-w-0">
        <TopNavigation 
          onSidebarToggle={handleSidebarToggle}
          onAddPassword={handleAddPassword}
          onSearch={handleSearch}
        />
        
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
