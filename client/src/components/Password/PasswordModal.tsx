import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { insertPasswordSchema, type InsertPassword, type Password, type Category } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, Wand2 } from "lucide-react";
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator";
import { PasswordGenerator } from "./PasswordGenerator";
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
import { z } from "zod";

const passwordFormSchema = z.object({
  website: z.string().min(1, "Website is required"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  notes: z.string().optional().nullable(),
  categoryId: z.string().optional(),
  isFavorite: z.boolean().optional(),
});

type PasswordFormData = z.infer<typeof passwordFormSchema>;

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  password?: Password;
}

export function PasswordModal({ isOpen, onClose, password }: PasswordModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);

  const form = useForm<PasswordFormData>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      website: "",
      username: "",
      password: "",
      notes: "",
      categoryId: "none",
      isFavorite: false,
    },
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    retry: false,
  });

  useEffect(() => {
    if (password) {
      form.reset({
        website: password.website,
        username: password.username,
        password: (password as any).password || "",
        notes: password.notes || "",
        categoryId: password.categoryId || "none",
        isFavorite: password.isFavorite || false,
      });
    } else {
      form.reset({
        website: "",
        username: "",
        password: "",
        notes: "",
        categoryId: "none",
        isFavorite: false,
      });
    }
  }, [password, form]);

  const createMutation = useMutation({
    mutationFn: async (data: PasswordFormData) => {
      const response = await apiRequest("POST", "/api/passwords", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/passwords"] });
      queryClient.invalidateQueries({ queryKey: ["/api/passwords/stats"] });
      toast({
        title: "Success",
        description: "Password saved successfully",
      });
      onClose();
      form.reset();
    },
    onError: (error) => {
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
        description: "Failed to save password",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: PasswordFormData) => {
      const response = await apiRequest("PUT", `/api/passwords/${password!.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/passwords"] });
      queryClient.invalidateQueries({ queryKey: ["/api/passwords/stats"] });
      toast({
        title: "Success",
        description: "Password updated successfully",
      });
      onClose();
    },
    onError: (error) => {
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

  const onSubmit = (data: PasswordFormData) => {
    console.log("Form submitted with data:", data);
    
    // Ensure all required fields are present
    if (!data.website || !data.username || !data.password) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    if (password) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const onInvalidSubmit = (errors: any) => {
    console.log("Form validation errors:", errors);
    const errorMessages = Object.values(errors).map((error: any) => error.message).join(", ");
    toast({
      title: "Validation Error",
      description: errorMessages || "Please check your input and try again",
      variant: "destructive",
    });
  };

  const handlePasswordGenerated = (generatedPassword: string) => {
    form.setValue("password", generatedPassword);
  };

  const currentPassword = form.watch("password");

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg" data-testid="password-modal">
          <DialogHeader>
            <DialogTitle>
              {password ? "Edit Password" : "Add New Password"}
            </DialogTitle>
            <DialogDescription>
              {password ? "Update your password details" : "Store a new login credential securely"}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onInvalidSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="website">Website/App Name</FormLabel>
                    <FormControl>
                      <Input 
                        id="website"
                        name="website"
                        placeholder="e.g., Gmail, Facebook, GitHub" 
                        {...field}
                        data-testid="website-input"
                        autoComplete="url"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="username">Username/Email</FormLabel>
                    <FormControl>
                      <Input 
                        id="username"
                        name="username"
                        placeholder="your@email.com or username" 
                        {...field}
                        data-testid="username-input"
                        autoComplete="username"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="password">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter password"
                          {...field}
                          className="pr-20"
                          data-testid="password-input"
                          autoComplete="current-password"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowPassword(!showPassword)}
                            data-testid="toggle-password-visibility"
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowGenerator(true)}
                            data-testid="open-generator-btn"
                          >
                            <Wand2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </FormControl>
                    {currentPassword && (
                      <PasswordStrengthIndicator password={currentPassword} />
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="category">Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger id="category" data-testid="category-select">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No category</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="notes">Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        id="notes"
                        name="notes"
                        placeholder="Additional notes..." 
                        className="h-20 resize-none"
                        {...field}
                        value={field.value || ""}
                        data-testid="notes-input"
                      />
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
                  data-testid="cancel-btn"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="flex-1"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="save-btn"
                >
                  {(createMutation.isPending || updateMutation.isPending) ? "Saving..." : "Save Password"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <PasswordGenerator
        isOpen={showGenerator}
        onClose={() => setShowGenerator(false)}
        onPasswordGenerated={handlePasswordGenerated}
      />
    </>
  );
}
