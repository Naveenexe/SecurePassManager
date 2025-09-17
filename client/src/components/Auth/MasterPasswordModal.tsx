import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, RefreshCw, Wand2 } from "lucide-react";
import { MasterPasswordResetModal } from "./MasterPasswordResetModal";
import { AdvancedEncryption } from "@/lib/encryption";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const masterPasswordSchema = z.object({
  masterPassword: z.string().min(8, "Master password must be at least 8 characters"),
});

type MasterPasswordFormData = z.infer<typeof masterPasswordSchema>;

interface MasterPasswordModalProps {
  isOpen: boolean;
  onUnlock: (masterPassword: string) => void;
  isSetup?: boolean;
}

export function MasterPasswordModal({ isOpen, onUnlock, isSetup = false }: MasterPasswordModalProps) {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const form = useForm<MasterPasswordFormData>({
    resolver: zodResolver(masterPasswordSchema),
    defaultValues: {
      masterPassword: "",
    },
  });

  const onSubmit = async (data: MasterPasswordFormData) => {
    setIsLoading(true);
    try {
      if (isSetup) {
        // Store master password hash in localStorage for setup
        const encoder = new TextEncoder();
        const data_encoded = encoder.encode(data.masterPassword);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data_encoded);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        localStorage.setItem('masterPasswordHash', hashHex);
        
        toast({
          title: "Master Password Set",
          description: "Your master password has been configured successfully",
        });
      } else {
        // Verify master password
        const encoder = new TextEncoder();
        const data_encoded = encoder.encode(data.masterPassword);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data_encoded);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        const storedHash = localStorage.getItem('masterPasswordHash');
        if (hashHex !== storedHash) {
          toast({
            title: "Invalid Master Password",
            description: "The master password you entered is incorrect",
            variant: "destructive",
          });
          return;
        }
      }
      
      onUnlock(data.masterPassword);
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process master password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateSecurePassword = () => {
    const generatedPassword = AdvancedEncryption.generateSecurePassword(16);
    form.setValue("masterPassword", generatedPassword);
    toast({
      title: "Password Generated",
      description: "A secure master password has been generated. Make sure to save it!",
    });
  };

  const handleReset = () => {
    setShowResetModal(false);
    window.location.reload();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" data-testid="master-password-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            {isSetup ? "Set Master Password" : "Enter Master Password"}
          </DialogTitle>
          <DialogDescription>
            {isSetup 
              ? "Create a master password to secure your password manager. This will be required each time you open the app."
              : "Enter your master password to unlock SecurePass Manager"
            }
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="masterPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="masterPassword">Master Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        id="masterPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder={isSetup ? "Create a strong master password" : "Enter your master password"}
                        {...field}
                        className="pr-20"
                        data-testid="master-password-input"
                        autoComplete="current-password"
                        autoFocus
                      />
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                        {isSetup && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={generateSecurePassword}
                            data-testid="generate-master-password"
                            title="Generate secure password"
                          >
                            <Wand2 className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowPassword(!showPassword)}
                          data-testid="toggle-master-password-visibility"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit"
              className="w-full"
              disabled={isLoading}
              data-testid="master-password-submit"
            >
              {isLoading ? "Processing..." : (isSetup ? "Set Password" : "Unlock")}
            </Button>

            {!isSetup && (
              <div className="flex justify-center pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowResetModal(true)}
                  className="text-muted-foreground hover:text-destructive"
                  data-testid="forgot-master-password"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Forgot Password?
                </Button>
              </div>
            )}
          </form>
        </Form>
      </DialogContent>

      <MasterPasswordResetModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onReset={handleReset}
      />
    </Dialog>
  );
}
