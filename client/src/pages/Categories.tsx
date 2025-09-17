import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/components/Layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Edit, Trash2, MoreVertical, Tags } from "lucide-react";
import { Category, insertCategorySchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const categoryFormSchema = z.object({
  name: z.string().min(1, "Category name is required"),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Please enter a valid hex color"),
});

type CategoryFormData = z.infer<typeof categoryFormSchema>;

export default function Categories() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    retry: false,
  });

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      color: "#3b82f6",
    },
    mode: "onChange",
  });

  const createMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      const response = await apiRequest("POST", "/api/categories", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Success",
        description: "Category created successfully",
      });
      setShowCategoryModal(false);
      form.reset();
    },
    onError: (error) => {
      console.error("Category creation error:", error);
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: `Failed to create category: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      const response = await apiRequest("PUT", `/api/categories/${selectedCategory!.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Success",
        description: "Category updated successfully",
      });
      setShowCategoryModal(false);
      setSelectedCategory(undefined);
      form.reset();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      await apiRequest("DELETE", `/api/categories/${categoryId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/passwords"] });
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    },
  });

  const handleAddCategory = () => {
    setSelectedCategory(undefined);
    form.reset({
      name: "",
      color: "#3b82f6",
    });
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    form.reset({
      name: category.name,
      color: category.color,
    });
    setShowCategoryModal(true);
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (confirm("Are you sure you want to delete this category? This will not delete the passwords in this category.")) {
      deleteMutation.mutate(categoryId);
    }
  };

  const onSubmit = (data: CategoryFormData) => {
    console.log("Form submitted with data:", data);
    console.log("Form validation state:", form.formState);
    
    // Ensure required fields are present
    if (!data.name || !data.color) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedCategory) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const defaultCategories = [
    { name: "Social Media", color: "#3b82f6" },
    { name: "Work", color: "#059669" },
    { name: "Banking", color: "#dc2626" },
    { name: "Shopping", color: "#ea580c" },
    { name: "Entertainment", color: "#9333ea" },
    { name: "Email", color: "#0891b2" },
    { name: "Gaming", color: "#7c3aed" },
    { name: "Education", color: "#0d9488" },
    { name: "Health", color: "#dc2626" },
    { name: "Travel", color: "#2563eb" },
    { name: "Finance", color: "#16a34a" },
    { name: "Streaming", color: "#e11d48" },
    { name: "Cloud Storage", color: "#0ea5e9" },
    { name: "Development", color: "#6366f1" },
    { name: "Photography", color: "#8b5cf6" },
    { name: "News", color: "#f59e0b" },
    { name: "Music", color: "#ec4899" },
    { name: "Productivity", color: "#10b981" },
    { name: "Communication", color: "#06b6d4" },
    { name: "Utilities", color: "#64748b" }
  ];

  const createDefaultCategories = async () => {
    try {
      for (const category of defaultCategories) {
        await apiRequest("POST", "/api/categories", category);
      }
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Success",
        description: "Default categories created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create default categories",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout onAddPassword={() => {}}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-semibold mb-2" data-testid="categories-title">Categories</h2>
          <p className="text-muted-foreground">Organize your passwords with custom categories</p>
        </div>

        {/* Categories List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Your Categories ({categories.length})</span>
              <div className="flex gap-2">
                {categories.length === 0 && (
                  <Button 
                    variant="outline" 
                    onClick={createDefaultCategories}
                    data-testid="create-default-categories"
                  >
                    Add Default Categories
                  </Button>
                )}
                <Button onClick={handleAddCategory} data-testid="add-category-btn">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Category
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="p-4 border rounded-lg animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded flex-1"></div>
                      <div className="w-8 h-8 bg-muted rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-12">
                <Tags className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Categories Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create categories to organize your passwords and make them easier to find.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={handleAddCategory} data-testid="add-first-category">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Category
                  </Button>
                  <Button variant="outline" onClick={createDefaultCategories}>
                    Add Default Categories
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="p-4 border rounded-lg hover:bg-secondary/50 transition-colors"
                    data-testid={`category-item-${category.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="font-medium truncate" data-testid="category-name">
                          {category.name}
                        </span>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" data-testid="category-options">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => handleEditCategory(category)}
                            data-testid="edit-category"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteCategory(category.id)}
                            className="text-destructive"
                            data-testid="delete-category"
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

        {/* Category Info */}
        <Card>
          <CardHeader>
            <CardTitle>About Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Categories help you organize your passwords by grouping similar services together. 
              This makes it easier to find specific passwords and maintain good organization.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Benefits of Using Categories:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Quick filtering and searching</li>
                  <li>• Better password organization</li>
                  <li>• Visual grouping with colors</li>
                  <li>• Easier password management</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Common Category Examples:</h4>
                <div className="flex flex-wrap gap-2">
                  {defaultCategories.map((cat, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {cat.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Modal */}
      <Dialog open={showCategoryModal} onOpenChange={setShowCategoryModal}>
        <DialogContent data-testid="category-modal">
          <DialogHeader>
            <DialogTitle>
              {selectedCategory ? "Edit Category" : "Create New Category"}
            </DialogTitle>
            <DialogDescription>
              {selectedCategory 
                ? "Update your category details" 
                : "Create a new category to organize your passwords"
              }
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Social Media, Work, Banking" 
                        {...field}
                        data-testid="category-name-input"
                        autoComplete="off"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Color</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input 
                          type="color" 
                          className="w-16 h-10 p-1 rounded cursor-pointer"
                          {...field}
                          data-testid="category-color-input"
                          autoComplete="off"
                        />
                        <Input 
                          type="text" 
                          placeholder="#3b82f6"
                          className="flex-1"
                          {...field}
                          autoComplete="off"
                        />
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
                  onClick={() => setShowCategoryModal(false)}
                  className="flex-1"
                  data-testid="cancel-category"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="flex-1"
                  data-testid="save-category"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) 
                    ? "Saving..." 
                    : selectedCategory ? "Update Category" : "Create Category"
                  }
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
