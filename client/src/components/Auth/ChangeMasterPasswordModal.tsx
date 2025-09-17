import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Key, Wand2 } from "lucide-react";
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
import { AdvancedEncryption } from "@/lib/encryption";
import CryptoJS from "crypto-js";

const changeMasterPasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ChangeMasterPasswordFormData = z.infer<typeof changeMasterPasswordSchema>;

interface ChangeMasterPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ChangeMasterPasswordModal({ isOpen, onClose, onSuccess }: ChangeMasterPasswordModalProps) {
  const { toast } = useToast();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ChangeMasterPasswordFormData>({
    resolver: zodResolver(changeMasterPasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ChangeMasterPasswordFormData) => {
    setIsLoading(true);
    try {
      // Verify current master password
      const storedHash = localStorage.getItem('masterPasswordHash');
      if (!storedHash) {
        throw new Error('No master password found');
      }

      const currentPasswordHash = CryptoJS.SHA256(data.currentPassword).toString();
      if (currentPasswordHash !== storedHash) {
        form.setError('currentPassword', { message: 'Current password is incorrect' });
        return;
      }

      // Store new master password hash
      const newPasswordHash = CryptoJS.SHA256(data.newPassword).toString();
      localStorage.setItem('masterPasswordHash', newPasswordHash);

      // Re-encrypt all passwords with new master password
      try {
        const response = await fetch('/api/passwords', {
          credentials: 'include',
        });
        
        if (response.ok) {
          const passwords = await response.json();
          
          // Re-encrypt each password with new master password
          for (const password of passwords) {
            try {
              // Decrypt with old master password
              const decrypted = AdvancedEncryption.decrypt(password.encryptedPassword, data.currentPassword);
              
              // Re-encrypt with new master password
              const reencrypted = AdvancedEncryption.encrypt(decrypted, data.newPassword);
              
              // Update password in database
              await fetch(`/api/passwords/${password.id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                  ...password,
                  encryptedPassword: reencrypted,
                }),
              });
            } catch (error) {
              console.error('Failed to re-encrypt password:', password.id, error);
            }
          }
        }
      } catch (error) {
        console.error('Failed to re-encrypt passwords:', error);
      }

      toast({
        title: "Success",
        description: "Master password changed successfully",
      });

      form.reset();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Change master password error:', error);
      toast({
        title: "Error",
        description: "Failed to change master password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateSecurePassword = () => {
    const generatedPassword = AdvancedEncryption.generateSecurePassword(16);
    form.setValue("newPassword", generatedPassword);
    form.setValue("confirmPassword", generatedPassword);
    toast({
      title: "Password Generated",
      description: "A secure password has been generated. Make sure to save it!",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="change-master-password-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Change Master Password
          </DialogTitle>
          <DialogDescription>
            Enter your current password and choose a new master password
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Master Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="Enter current master password"
                        {...field}
                        className="pr-10"
                        data-testid="current-password-input"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Master Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Enter new master password"
                        {...field}
                        className="pr-20"
                        data-testid="new-password-input"
                      />
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={generateSecurePassword}
                          title="Generate secure password"
                        >
                          <Wand2 className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
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

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm new master password"
                        {...field}
                        className="pr-10"
                        data-testid="confirm-password-input"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isLoading}
                data-testid="change-password-submit"
              >
                {isLoading ? "Changing..." : "Change Password"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
