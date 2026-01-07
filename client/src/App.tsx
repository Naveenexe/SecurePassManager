import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import { useMasterPassword } from "@/hooks/useMasterPassword";
import { MasterPasswordModal } from "@/components/Auth/MasterPasswordModal";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Passwords from "@/pages/Passwords";
import Generator from "@/pages/Generator";
import Categories from "@/pages/Categories";
import ImportExport from "@/pages/ImportExport";
import Settings from "@/pages/Settings";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const { isLocked, hasSetup, unlock, setup } = useMasterPassword();

  const handleMasterPasswordUnlock = (masterPassword: string) => {
    if (hasSetup) {
      unlock(masterPassword);
    } else {
      setup(masterPassword);
    }
  };

  // Show master password modal if user is authenticated but app is locked
  if (isAuthenticated && isLocked) {
    return (
      <MasterPasswordModal
        isOpen={true}
        onUnlock={handleMasterPasswordUnlock}
        isSetup={!hasSetup}
      />
    );
  }

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/passwords" component={Passwords} />
          <Route path="/generator" component={Generator} />
          <Route path="/categories" component={Categories} />
          <Route path="/import-export" component={ImportExport} />
          <Route path="/settings" component={Settings} />
        </>
      )}
      <Route path="/landing" component={Landing} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
