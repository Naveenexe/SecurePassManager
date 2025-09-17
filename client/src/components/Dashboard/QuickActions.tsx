import { Plus, Wand2, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface QuickActionsProps {
  onAddPassword: () => void;
  onOpenGenerator: () => void;
  onExportData: () => void;
}

export function QuickActions({ onAddPassword, onOpenGenerator, onExportData }: QuickActionsProps) {
  const actions = [
    {
      title: "Add New Password",
      description: "Store a new login credential",
      icon: Plus,
      color: "bg-primary/10 text-primary",
      onClick: onAddPassword,
      testId: "quick-action-add-password",
    },
    {
      title: "Generate Password",
      description: "Create a strong password",
      icon: Wand2,
      color: "bg-accent/10 text-accent",
      onClick: onOpenGenerator,
      testId: "quick-action-generate-password",
    },
    {
      title: "Export Data",
      description: "Backup your passwords",
      icon: Download,
      color: "bg-secondary text-muted-foreground",
      onClick: onExportData,
      testId: "quick-action-export-data",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.title}
              variant="ghost"
              className="w-full justify-start h-auto p-3"
              onClick={action.onClick}
              data-testid={action.testId}
            >
              <div className="flex items-center gap-3 w-full">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-medium">{action.title}</p>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
              </div>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}
