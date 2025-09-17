import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/Layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Shield, 
  Palette, 
  Download, 
  Trash2, 
  Key, 
  Settings as SettingsIcon,
  AlertTriangle,
  CheckCircle,
  Moon,
  Sun,
  Monitor,
  Lock,
  RefreshCw
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMasterPassword } from "@/hooks/useMasterPassword";
import { Password, Category, User as UserType } from "@shared/schema";
import { ProfileManagement } from "@/components/Profile/ProfileManagement";
import { ChangeMasterPasswordModal } from "@/components/Auth/ChangeMasterPasswordModal";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const { lock } = useMasterPassword();
  const [autoLockEnabled, setAutoLockEnabled] = useState(false);
  const [autoLockTime, setAutoLockTime] = useState(15);
  const [showChangeMasterPassword, setShowChangeMasterPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: passwords = [] } = useQuery<Password[]>({
    queryKey: ["/api/passwords"],
    retry: false,
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    retry: false,
  });

  const handleLogout = () => {
    lock();
    window.location.reload();
  };

  const handleLockApp = () => {
    lock();
    toast({
      title: "App Locked",
      description: "SecurePass Manager has been locked",
    });
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
      a.download = "securepass-backup.json";
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

  const handleDeleteAllData = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    try {
      // Delete all passwords
      const deletePasswordPromises = passwords.map(password =>
        fetch(`/api/passwords/${password.id}`, {
          method: "DELETE",
          credentials: "include",
        })
      );
      await Promise.all(deletePasswordPromises);

      // Delete all categories (except default ones)
      const deleteCategoryPromises = categories
        .filter(cat => cat.name !== "Personal" && cat.name !== "Work")
        .map(category =>
          fetch(`/api/categories/${category.id}`, {
            method: "DELETE",
            credentials: "include",
          })
        );
      await Promise.all(deleteCategoryPromises);

      // Clear local storage data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('masterPasswordHash');
        sessionStorage.removeItem('isUnlocked');
      }

      toast({
        title: "Success",
        description: "All data deleted successfully",
      });
      
      setShowDeleteConfirm(false);
      
      // Reload page to reset state
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Delete all data error:", error);
      toast({
        title: "Error",
        description: "Failed to delete data",
        variant: "destructive",
      });
      setShowDeleteConfirm(false);
    }
  };

  const getUserDisplayName = (user: UserType) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.email || "User";
  };

  const getUserInitials = (user: UserType) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`;
    }
    if (user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  const getPasswordStrengthStats = () => {
    const total = passwords.length;
    const strong = passwords.filter(p => (p.strength || 0) >= 3).length;
    const medium = passwords.filter(p => (p.strength || 0) === 2).length;
    const weak = passwords.filter(p => (p.strength || 0) <= 1).length;
    
    return { total, strong, medium, weak };
  };

  const stats = getPasswordStrengthStats();

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground">Unable to load user data</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-semibold mb-2" data-testid="settings-title">Settings</h2>
          <p className="text-muted-foreground">Manage your account and application preferences</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" data-testid="profile-tab">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" data-testid="security-tab">
              <Shield className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="appearance" data-testid="appearance-tab">
              <Palette className="w-4 h-4 mr-2" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="data" data-testid="data-tab">
              <Download className="w-4 h-4 mr-2" />
              Data
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <ProfileManagement user={user} />
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Password Security Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-semibold text-primary">
                      {stats.total}
                    </div>
                    <div className="text-sm text-muted-foreground">Total</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-semibold text-green-600">
                      {stats.strong}
                    </div>
                    <div className="text-sm text-muted-foreground">Strong</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-semibold text-yellow-600">
                      {stats.medium}
                    </div>
                    <div className="text-sm text-muted-foreground">Medium</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-semibold text-red-600">
                      {stats.weak}
                    </div>
                    <div className="text-sm text-muted-foreground">Weak</div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Security Recommendations</h4>
                  <div className="space-y-3">
                    {stats.weak > 0 && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          You have {stats.weak} weak password{stats.weak === 1 ? '' : 's'}. 
                          Consider updating them with stronger alternatives.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {stats.weak === 0 && stats.medium === 0 && (
                      <Alert className="border-green-200 bg-green-50 dark:bg-green-950/50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription>
                          Excellent! All your passwords are strong.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Master Password Security */}
            <Card>
              <CardHeader>
                <CardTitle>Master Password Security</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Manage your master password and app security settings
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Lock App</h4>
                      <p className="text-sm text-muted-foreground">
                        Manually lock the app and require master password
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        lock();
                        toast({
                          title: "App Locked",
                          description: "Application has been locked successfully",
                        });
                      }}
                      variant="outline"
                      size="sm"
                      data-testid="lock-app-button"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Lock Now
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Change Master Password</h4>
                      <p className="text-sm text-muted-foreground">
                        Update your master password (requires current password)
                      </p>
                    </div>
                    <Button
                      onClick={() => setShowChangeMasterPassword(true)}
                      variant="outline"
                      size="sm"
                      data-testid="change-master-password-button"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Change Password
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Auto-Lock</h4>
                      <p className="text-sm text-muted-foreground">
                        Automatically lock the application after a period of inactivity
                      </p>
                    </div>
                    <Switch
                      id="auto-lock"
                      checked={autoLockEnabled}
                      onCheckedChange={setAutoLockEnabled}
                      data-testid="auto-lock-switch"
                    />
                  </div>

                {autoLockEnabled && (
                  <div>
                    <Label htmlFor="auto-lock-time">Auto-Lock Time (minutes)</Label>
                    <Input
                      id="auto-lock-time"
                      type="number"
                      min="1"
                      max="60"
                      value={autoLockTime}
                      onChange={(e) => setAutoLockTime(parseInt(e.target.value) || 15)}
                      className="mt-2 w-32"
                      data-testid="auto-lock-time-input"
                    />
                  </div>
                )}

                  <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/50">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription>
                      Your passwords are protected with advanced encryption using your master password.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Theme Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base">Color Theme</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Choose your preferred color theme for the application
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div 
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        theme === 'light' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                      }`}
                      onClick={() => setTheme('light')}
                      data-testid="light-theme-option"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Sun className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">Light</div>
                          <div className="text-sm text-muted-foreground">Clean and bright</div>
                        </div>
                      </div>
                    </div>

                    <div 
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        theme === 'dark' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                      }`}
                      onClick={() => setTheme('dark')}
                      data-testid="dark-theme-option"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Moon className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">Dark</div>
                          <div className="text-sm text-muted-foreground">Easy on the eyes</div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg opacity-50 cursor-not-allowed">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                          <Monitor className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-medium text-muted-foreground">System</div>
                          <div className="text-sm text-muted-foreground">Coming soon</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Display Options</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Compact View</Label>
                        <p className="text-sm text-muted-foreground">
                          Show more items on screen with reduced spacing
                        </p>
                      </div>
                      <Switch disabled data-testid="compact-view-switch" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Show Password Strength</Label>
                        <p className="text-sm text-muted-foreground">
                          Display password strength indicators
                        </p>
                      </div>
                      <Switch defaultChecked disabled data-testid="show-strength-switch" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Export All Data</h4>
                      <p className="text-sm text-muted-foreground">
                        Download a complete backup of your passwords and categories
                      </p>
                    </div>
                    <Button onClick={handleExportData} data-testid="export-all-data-btn">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Account Information</h4>
                      <p className="text-sm text-muted-foreground">
                        View your account details and usage statistics
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium text-destructive">Danger Zone</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
                      <div>
                        <h4 className="font-medium">Delete All Data</h4>
                        <p className="text-sm text-muted-foreground">
                          Permanently delete all your passwords and categories
                        </p>
                      </div>
                      <Button 
                        variant="destructive" 
                        onClick={handleDeleteAllData}
                        data-testid="delete-all-data-btn"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {showDeleteConfirm ? "Confirm Delete" : "Delete All"}
                      </Button>
                    </div>

                    {showDeleteConfirm && (
                      <Alert className="border-destructive/50 bg-destructive/5">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <AlertTitle>Are you absolutely sure?</AlertTitle>
                        <AlertDescription>
                          This action cannot be undone. This will permanently delete all your passwords, 
                          categories, and associated data. Click "Confirm Delete" again to proceed.
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
                      <div>
                        <h4 className="font-medium">Lock & Exit</h4>
                        <p className="text-sm text-muted-foreground">
                          Lock the application and return to login screen
                        </p>
                      </div>
                      <Button variant="outline" onClick={handleLogout} data-testid="logout-btn">
                        <Key className="w-4 h-4 mr-2" />
                        Lock & Exit
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <ChangeMasterPasswordModal
        isOpen={showChangeMasterPassword}
        onClose={() => setShowChangeMasterPassword(false)}
        onSuccess={() => {
          toast({
            title: "Success",
            description: "Master password changed successfully. Please log in again.",
          });
          setTimeout(() => {
            lock();
          }, 1000);
        }}
      />
    </MainLayout>
  );
}
