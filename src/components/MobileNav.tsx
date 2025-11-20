import { Home, Users, DollarSign, Bell, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

export const MobileNav = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-2 z-50 md:hidden safe-area-pb">
      <div className="flex justify-around items-center">
        <Link 
          to="/dashboard" 
          className={cn(
            "flex flex-col items-center gap-1 min-h-[44px] min-w-[44px] justify-center",
            isActive('/dashboard') ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          <Home size={24} />
          <span className="text-xs">Home</span>
        </Link>
        
        <Link 
          to="/dashboard" 
          className={cn(
            "flex flex-col items-center gap-1 min-h-[44px] min-w-[44px] justify-center",
            location.pathname.includes('/group') ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          <Users size={24} />
          <span className="text-xs">Groups</span>
        </Link>
        
        <Link 
          to="/record-contribution" 
          className={cn(
            "flex flex-col items-center gap-1 min-h-[44px] min-w-[44px] justify-center",
            isActive('/record-contribution') ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          <DollarSign size={24} />
          <span className="text-xs">Pay</span>
        </Link>
        
        <Link 
          to="/notification-history" 
          className={cn(
            "flex flex-col items-center gap-1 relative min-h-[44px] min-w-[44px] justify-center",
            isActive('/notification-history') ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          <Bell size={24} />
          <span className="text-xs">Alerts</span>
        </Link>
        
        <Link 
          to="/profile" 
          className={cn(
            "flex flex-col items-center gap-1 min-h-[44px] min-w-[44px] justify-center",
            isActive('/profile') ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          <User size={24} />
          <span className="text-xs">Profile</span>
        </Link>
      </div>
    </nav>
  );
};
