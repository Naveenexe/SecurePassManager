import { useState } from "react";
import { Menu, Moon, Sun, Plus } from "lucide-react";
import { useTheme } from "../ThemeProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TopNavigationProps {
  onSidebarToggle: () => void;
  onAddPassword: () => void;
  onSearch: (query: string) => void;
}

export function TopNavigation({ onSidebarToggle, onAddPassword, onSearch }: TopNavigationProps) {
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  return (
    <header className="bg-card border-b border-border">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={onSidebarToggle}
            data-testid="sidebar-toggle"
          >
            <Menu className="w-5 h-5" />
          </Button>
          
        </div>
        
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            data-testid="theme-toggle"
          >
            {theme === "light" ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </Button>
          
          
          {/* Add Password Button */}
          <Button
            onClick={onAddPassword}
            className="flex items-center gap-2"
            data-testid="add-password-btn"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Password</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
