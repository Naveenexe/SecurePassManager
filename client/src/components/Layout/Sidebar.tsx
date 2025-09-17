import { Link, useLocation } from "wouter";
import { User } from "@shared/schema";
import { 
  Shield, 
  LayoutDashboard, 
  Key, 
  Wand2, 
  Tags, 
  Download, 
  Settings,
  ChevronRight
} from "lucide-react";

interface SidebarProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Passwords", href: "/passwords", icon: Key },
  { name: "Generator", href: "/generator", icon: Wand2 },
  { name: "Categories", href: "/categories", icon: Tags },
  { name: "Import/Export", href: "/import-export", icon: Download },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar({ user, isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();

  const getUserInitials = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`;
    }
    if (user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  const getUserDisplayName = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.email || "User";
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
          data-testid="sidebar-overlay"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative w-64 h-full bg-card border-r border-border z-50 transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        data-testid="sidebar"
      >
        <div className="flex flex-col h-full">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3 p-6 border-b border-border">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="text-primary-foreground w-4 h-4" />
            </div>
            <div>
              <h1 className="font-semibold text-lg">SecurePass</h1>
              <p className="text-xs text-muted-foreground">Manager</p>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {navigation.map((item) => {
                const isActive = location === item.href;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-3 py-2 rounded-md transition-all
                      ${isActive 
                        ? 'bg-secondary text-secondary-foreground' 
                        : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground'
                      }
                    `}
                    onClick={onClose}
                    data-testid={`nav-${item.name.toLowerCase().replace('/', '-')}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-border">
            <Link 
              href="/settings"
              className="flex items-center gap-3 p-3 rounded-md hover:bg-secondary transition-all cursor-pointer"
              onClick={onClose}
              data-testid="user-profile-link"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                {user.profileImageUrl ? (
                  <img 
                    src={user.profileImageUrl} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-primary-foreground text-sm font-medium">
                    {getUserInitials(user)}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate" data-testid="user-name">
                  {getUserDisplayName(user)}
                </p>
                <p className="text-xs text-muted-foreground truncate" data-testid="user-email">
                  {user.email}
                </p>
              </div>
              <ChevronRight className="text-muted-foreground w-4 h-4" />
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
