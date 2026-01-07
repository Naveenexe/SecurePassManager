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

  const getPasswordStrengthColor = (strength: number) => {
    if (strength >= 3) return "bg-green-500";
    if (strength >= 2) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Recent Passwords</CardTitle>
        <Button variant="ghost" size="sm" onClick={onViewAll}>
          View All
        </Button>
      </CardHeader>
      <CardContent className="grid gap-4 pt-4">
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : recentPasswords.length === 0 ? (
          <div className="text-sm text-muted-foreground">No recent passwords</div>
        ) : (
          recentPasswords.map((password) => (
            <div
              key={password.id}
              className="flex items-center gap-3 p-3 hover:bg-secondary rounded-md transition-all"
              data-testid={`recent-password-${password.id}`}
            >
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="text-primary font-semibold text-sm">
                  {(password.website || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate" data-testid="password-website">
                  {password.website || 'Untitled'}
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
          ))
        )}
      </CardContent>
    </Card>
  );
}
