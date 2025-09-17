import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Download, Upload, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

interface MasterPasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReset: () => void;
}

export function MasterPasswordResetModal({ isOpen, onClose, onReset }: MasterPasswordResetModalProps) {
  const { toast } = useToast();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleExportData = async () => {
    try {
      // Export current data before reset
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
      a.download = `securepass-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Data Exported",
        description: "Your data has been backed up successfully",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Could not export your data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleResetMasterPassword = () => {
    // Clear master password hash
    localStorage.removeItem('masterPasswordHash');
    sessionStorage.removeItem('isUnlocked');
    
    toast({
      title: "Master Password Reset",
      description: "You can now set a new master password",
    });
    
    onReset();
    onClose();
  };

  const handleFactoryReset = () => {
    // Clear all local data
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear IndexedDB if used
    if ('indexedDB' in window) {
      indexedDB.deleteDatabase('securepass');
    }
    
    toast({
      title: "Factory Reset Complete",
      description: "All local data has been cleared",
    });
    
    window.location.reload();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="master-password-reset-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Master Password Recovery
          </DialogTitle>
          <DialogDescription>
            Choose an option to recover access to your password manager
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              These actions cannot be undone. Make sure to export your data first if you want to keep it.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Export Current Data</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Download a backup of all your passwords and categories before making changes
              </p>
              <Button onClick={handleExportData} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Reset Master Password Only</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Clear master password but keep all your data. You'll set a new master password.
              </p>
              <Button 
                onClick={handleResetMasterPassword} 
                variant="outline" 
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset Master Password
              </Button>
            </div>

            <div className="p-4 border border-destructive/20 rounded-lg">
              <h4 className="font-medium mb-2 text-destructive">Factory Reset</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Clear everything including all passwords, categories, and settings
              </p>
              {!showConfirm ? (
                <Button 
                  onClick={() => setShowConfirm(true)} 
                  variant="destructive" 
                  className="w-full"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Factory Reset
                </Button>
              ) : (
                <div className="space-y-2">
                  <Alert className="border-destructive/50 bg-destructive/5">
                    <AlertDescription>
                      This will permanently delete ALL your data. Are you sure?
                    </AlertDescription>
                  </Alert>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => setShowConfirm(false)} 
                      variant="outline" 
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleFactoryReset} 
                      variant="destructive" 
                      className="flex-1"
                    >
                      Confirm Reset
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
