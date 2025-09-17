import { useQuery } from "@tanstack/react-query";
import { Copy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/lib/crypto";
import { useToast } from "@/hooks/use-toast";
import { Password } from "@shared/schema";

interface RecentPasswordsProps {
  onViewAll: () => void;
}

export function RecentPasswords({ onViewAll }: RecentPasswordsProps) {
  const { toast } = useToast();
  const { data: passwords = [], isLoading } = useQuery<Password[]>({
    queryKey: ["/api/passwords"],
    retry: false,
  });

  const recentPasswords = passwords.slice(0, 3);

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

  const getWebsiteIcon = (website: string) => {
    if (!website || typeof website !== 'string') {
      return { icon: "fas fa-globe", color: "bg-primary/10 text-primary" };
    }
    const domain = website.toLowerCase();
    
    // Map common services to their brand colors and icons
    const serviceIcons: Record<string, { icon: string; color: string }> = {
      gmail: { icon: "fab fa-google", color: "bg-red-100 text-red-600" },
      google: { icon: "fab fa-google", color: "bg-red-100 text-red-600" },
      facebook: { icon: "fab fa-facebook", color: "bg-blue-100 text-blue-700" },
      github: { icon: "fab fa-github", color: "bg-gray-100 text-gray-800" },
      twitter: { icon: "fab fa-twitter", color: "bg-blue-100 text-blue-500" },
      linkedin: { icon: "fab fa-linkedin", color: "bg-blue-100 text-blue-700" },
      instagram: { icon: "fab fa-instagram", color: "bg-pink-100 text-pink-600" },
      youtube: { icon: "fab fa-youtube", color: "bg-red-100 text-red-600" },
      amazon: { icon: "fab fa-amazon", color: "bg-orange-100 text-orange-600" },
      netflix: { icon: "fas fa-play", color: "bg-red-100 text-red-600" },
      spotify: { icon: "fab fa-spotify", color: "bg-green-100 text-green-600" },
      dropbox: { icon: "fab fa-dropbox", color: "bg-blue-100 text-blue-600" },
    };

    for (const [service, config] of Object.entries(serviceIcons)) {
      if (domain.includes(service)) {
        return config;
      }
    }

    // Default icon
    return { icon: "fas fa-globe", color: "bg-primary/10 text-primary" };
  };

  const getPasswordStrengthColor = (strength: number) => {
    if (strength >= 3) return "bg-accent";
    if (strength >= 2) return "bg-yellow-500";
    return "bg-destructive";
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Passwords</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
              <div className="w-8 h-8 bg-muted rounded-lg"></div>
              <div className="flex-1 space-y-1">
                <div className="h-4 bg-muted rounded w-24"></div>
                <div className="h-3 bg-muted rounded w-32"></div>
              </div>
              <div className="w-2 h-2 bg-muted rounded-full"></div>
              <div className="w-6 h-6 bg-muted rounded"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Passwords</CardTitle>
        <Button 
          variant="link" 
          onClick={onViewAll}
          className="text-primary hover:underline text-sm"
          data-testid="view-all-passwords"
        >
          View All
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentPasswords.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No passwords yet</p>
            <p className="text-sm">Add your first password to get started</p>
          </div>
        ) : (
          recentPasswords.map((password) => {
            const { icon, color } = getWebsiteIcon(password.website);
            return (
              <div
                key={password.id}
                className="flex items-center gap-3 p-3 hover:bg-secondary rounded-md transition-all"
                data-testid={`recent-password-${password.id}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
                  <i className={`${icon} text-sm`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate" data-testid="password-website">
                    {password.website}
                  </p>
                  <p className="text-sm text-muted-foreground truncate" data-testid="password-username">
                    {password.username}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div 
                    className={`w-2 h-2 rounded-full ${getPasswordStrengthColor(password.strength || 0)}`}
                    title={`Password strength: ${password.strength || 0}/4`}
                  ></div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy((password as any).password)}
                    data-testid="copy-password"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
