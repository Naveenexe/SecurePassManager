import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/components/Layout/MainLayout";
import { PasswordModal } from "@/components/Password/PasswordModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Copy, Edit, Trash2, MoreVertical, Star, StarOff } from "lucide-react";
import { Password, Category } from "@shared/schema";
import { copyToClipboard } from "@/lib/crypto";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Passwords() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPassword, setSelectedPassword] = useState<Password | undefined>();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const { data: passwords = [], isLoading: passwordsLoading } = useQuery<Password[]>({
    queryKey: ["/api/passwords"],
    retry: false,
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    retry: false,
  });

  const deleteMutation = useMutation({
    mutationFn: async (passwordId: string) => {
      await apiRequest("DELETE", `/api/passwords/${passwordId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/passwords"] });
      queryClient.invalidateQueries({ queryKey: ["/api/passwords/stats"] });
      toast({
        title: "Success",
        description: "Password deleted successfully",
      });
    },
    onError: (error) => {
      console.error("Delete password error:", error);
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Session expired. Please refresh the page.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.reload();
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete password",
        variant: "destructive",
      });
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ password, isFavorite }: { password: Password; isFavorite: boolean }) => {
      const response = await apiRequest("PUT", `/api/passwords/${password.id}`, {
        isFavorite
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/passwords"] });
    },
    onError: (error) => {
      console.error("Toggle favorite error:", error);
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Session expired. Please refresh the page.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.reload();
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update password",
        variant: "destructive",
      });
    },
  });

  const filteredPasswords = useMemo(() => {
    if (!searchQuery) return passwords;
    return passwords.filter(
      password =>
        (password.website || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (password.username || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [passwords, searchQuery]);

  const handleCopy = async (password: string) => {
    const success = await copyToClipboard(password);
    if (success) {
      toast({
        title: "Copied!",
        description: "Password copied to clipboard",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to copy password",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (password: Password) => {
    setSelectedPassword(password);
    setShowPasswordModal(true);
  };

  const handleDelete = (passwordId: string) => {
    if (confirm("Are you sure you want to delete this password?")) {
      deleteMutation.mutate(passwordId);
    }
  };

  const handleToggleFavorite = (password: Password) => {
    toggleFavoriteMutation.mutate({
      password,
      isFavorite: !password.isFavorite,
    });
  };

  const handleAddPassword = () => {
    setSelectedPassword(undefined);
    setShowPasswordModal(true);
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return null;
    const category = categories.find(c => c.id === categoryId);
    return category?.name;
  };

  const getPasswordStrengthColor = (strength: number) => {
    if (strength >= 3) return "bg-green-500";
    if (strength >= 2) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getPasswordStrengthText = (strength: number) => {
    if (strength >= 3) return "Strong";
    if (strength >= 2) return "Medium";
    return "Weak";
  };

  return (
    <MainLayout onAddPassword={handleAddPassword} onSearch={setSearchQuery}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-semibold mb-2" data-testid="passwords-title">Passwords</h2>
          <p className="text-muted-foreground">Manage all your stored passwords</p>
        </div>

        {/* Search */}
        <div className="flex gap-4">
          <Input
            placeholder="Search passwords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
            data-testid="password-search"
          />
        </div>

        {/* Password List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Your Passwords ({filteredPasswords.length})</span>
              <Button onClick={handleAddPassword} data-testid="add-password-header-btn">
                Add Password
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {passwordsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 border rounded-lg animate-pulse">
                    <div className="w-12 h-12 bg-muted rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-32"></div>
                      <div className="h-3 bg-muted rounded w-48"></div>
                    </div>
                    <div className="w-20 h-6 bg-muted rounded"></div>
                    <div className="w-8 h-8 bg-muted rounded"></div>
                  </div>
                ))}
              </div>
            ) : filteredPasswords.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? "No passwords found matching your search." : "No passwords stored yet."}
                </p>
                {!searchQuery && (
                  <Button onClick={handleAddPassword} data-testid="add-first-password-btn">
                    Add Your First Password
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPasswords.map((password) => (
                  <div
                    key={password.id}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-secondary/50 transition-colors"
                    data-testid={`password-item-${password.id}`}
                  >
                    {/* Website/Service Icon */}
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-primary font-semibold text-lg">
                        {(password.website || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>

                    {/* Password Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium truncate" data-testid="password-website">
                          {password.website || 'Untitled'}
                        </h3>
                        {password.isFavorite && (
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate" data-testid="password-username">
                        {password.username || 'No username'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {getCategoryName(password.categoryId) && (
                          <Badge variant="secondary" className="text-xs">
                            {getCategoryName(password.categoryId)}
                          </Badge>
                        )}
                        <div className="flex items-center gap-1">
                          <div 
                            className={`w-2 h-2 rounded-full ${getPasswordStrengthColor(password.strength || 0)}`}
                          />
                          <span className="text-xs text-muted-foreground">
                            {getPasswordStrengthText(password.strength || 0)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy((password as any).password)}
                        data-testid="copy-password-btn"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" data-testid="password-options-btn">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(password)} data-testid="edit-password-btn">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleToggleFavorite(password)}
                            data-testid="toggle-favorite-btn"
                          >
                            {password.isFavorite ? (
                              <>
                                <StarOff className="w-4 h-4 mr-2" />
                                Remove from Favorites
                              </>
                            ) : (
                              <>
                                <Star className="w-4 h-4 mr-2" />
                                Add to Favorites
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(password.id)}
                            className="text-destructive"
                            data-testid="delete-password-btn"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Password Modal */}
      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setSelectedPassword(undefined);
        }}
        password={selectedPassword}
      />
    </MainLayout>
  );
}
