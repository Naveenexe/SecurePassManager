import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Lock, Unlock, RefreshCw, Wand2, ShieldCheck, AlertCircle, Key } from "lucide-react";
import { MasterPasswordResetModal } from "./MasterPasswordResetModal";
import { AdvancedEncryption } from "@/lib/encryption";
import {
  Dialog,
  DialogContent,
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
  const [isShake, setIsShake] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<MasterPasswordFormData>({
    resolver: zodResolver(masterPasswordSchema),
    defaultValues: {
      masterPassword: "",
    },
  });

  // Reset success state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      form.reset();
    }
  }, [isOpen, form]);

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

        setIsSuccess(true);
        setTimeout(() => {
          toast({
            title: "Master Password Set",
            description: "Your safe is now secured.",
          });
          onUnlock(data.masterPassword);
        }, 800);
      } else {
        // Verify master password
        const encoder = new TextEncoder();
        const data_encoded = encoder.encode(data.masterPassword);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data_encoded);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        const storedHash = localStorage.getItem('masterPasswordHash');
        if (hashHex !== storedHash) {
          setIsShake(true);
          setTimeout(() => setIsShake(false), 500);
          toast({
            title: "Access Denied",
            description: "Incorrect master password.",
            variant: "destructive",
          });
          return;
        }

        setIsSuccess(true);
        setTimeout(() => {
          onUnlock(data.masterPassword);
        }, 600);
      }
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
      title: "Strong Password Generated",
      description: "Don't forget to save this password!",
    });
  };

  const handleReset = () => {
    setShowResetModal(false);
    window.location.reload();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => { }}>
      <DialogContent
        className="sm:max-w-md border-none shadow-2xl bg-gradient-to-b from-background to-secondary/20 p-0 overflow-hidden"
        data-testid="master-password-modal"
      >
        <div className="relative p-6 pt-12 flex flex-col items-center">
          {/* Animated Background Effect */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

          {/* Icon Animation */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className={`
              w-20 h-20 rounded-full flex items-center justify-center mb-6 
              ${isSuccess ? "bg-green-100 dark:bg-green-900/30 text-green-600" : "bg-primary/10 text-primary"}
              transition-colors duration-500
            `}
          >
            <AnimatePresence mode="wait">
              {isSuccess ? (
                <motion.div
                  key="unlock"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                >
                  <Unlock className="w-10 h-10" />
                </motion.div>
              ) : (
                <motion.div
                  key="lock"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                >
                  {isSetup ? <ShieldCheck className="w-10 h-10" /> : <Lock className="w-10 h-10" />}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Header Text */}
          <DialogHeader className="mb-6 text-center space-y-2">
            <DialogTitle className="text-2xl font-bold tracking-tight">
              {isSetup ? "Secure Your Vault" : "Unlock SecurePass"}
            </DialogTitle>
            <p className="text-muted-foreground text-sm max-w-[280px] mx-auto">
              {isSetup
                ? "Set a master password to encrypt your data. This is the only key to your vault."
                : "Enter your master password to decrypt your secure data."
              }
            </p>
          </DialogHeader>

          {/* Form */}
          <Form {...form}>
            <motion.form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full space-y-6"
              animate={isShake ? { x: [-10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.4 }}
            >
              <FormField
                control={form.control}
                name="masterPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Master Password</FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground/50 group-focus-within:text-primary transition-colors">
                          <Key className="w-4 h-4" />
                        </div>
                        <Input
                          id="masterPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder={isSetup ? "Create Master Password" : "Type Master Password"}
                          {...field}
                          className="pl-9 pr-20 h-12 text-base transition-all border-muted-foreground/20 focus:border-primary shadow-sm"
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
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                              onClick={generateSecurePassword}
                              data-testid="generate-master-password"
                              title="Generate strong password"
                            >
                              <Wand2 className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                            onClick={() => setShowPassword(!showPassword)}
                            data-testid="toggle-master-password-visibility"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage className="text-center" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className={`w-full h-11 text-base font-medium transition-all duration-300 ${isSuccess ? "bg-green-600 hover:bg-green-700" : ""
                  }`}
                disabled={isLoading || isSuccess}
                data-testid="master-password-submit"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </motion.div>
                    unsealing...
                  </span>
                ) : isSuccess ? (
                  <span className="flex items-center gap-2">
                    <Unlock className="w-4 h-4" /> Unlocked
                  </span>
                ) : (
                  isSetup ? "Set Master Password" : "Unlock Vault"
                )}
              </Button>

              {!isSetup && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex justify-center"
                >
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    onClick={() => setShowResetModal(true)}
                    className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <AlertCircle className="w-3 h-3 mr-1.5" />
                    Forgot Master Password?
                  </Button>
                </motion.div>
              )}
            </motion.form>
          </Form>
        </div>

        {/* Footer/Status Bar */}
        <div className="bg-muted/30 px-6 py-3 border-t flex justify-center">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="w-3 h-3" />
            <span>256-bit AES Encrypted</span>
          </div>
        </div>
      </DialogContent>

      <MasterPasswordResetModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onReset={handleReset}
      />
    </Dialog>
  );
}
