import { useState } from "react";
import { MainLayout } from "@/components/Layout/MainLayout";
import { StatsCards } from "@/components/Dashboard/StatsCards";
import { QuickActions } from "@/components/Dashboard/QuickActions";
import { RecentPasswords } from "@/components/Dashboard/RecentPasswords";
import { PasswordModal } from "@/components/Password/PasswordModal";
import { PasswordGenerator } from "@/components/Password/PasswordGenerator";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);

  const handleAddPassword = () => {
    setShowPasswordModal(true);
  };

  const handleOpenGenerator = () => {
    setShowGenerator(true);
  };

  const handleExportData = async () => {
    try {
      const response = await fetch("/api/export", {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Export failed");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "securepass-export.json";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Success",
        description: "Data exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    }
  };

  const handleViewAllPasswords = () => {
    setLocation("/passwords");
  };

  return (
    <MainLayout onAddPassword={handleAddPassword}>
      <div className="space-y-6">
        {/* Dashboard Header */}
        <div>
          <h2 className="text-2xl font-semibold mb-2" data-testid="dashboard-title">Dashboard</h2>
          <p className="text-muted-foreground">Manage your passwords securely</p>
        </div>

        {/* Stats Cards */}
        <StatsCards />

        {/* Quick Actions & Recent Passwords */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <QuickActions
            onAddPassword={handleAddPassword}
            onOpenGenerator={handleOpenGenerator}
            onExportData={handleExportData}
          />
          <RecentPasswords onViewAll={handleViewAllPasswords} />
        </div>
      </div>

      {/* Modals */}
      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
      
      <PasswordGenerator
        isOpen={showGenerator}
        onClose={() => setShowGenerator(false)}
      />
    </MainLayout>
  );
}
