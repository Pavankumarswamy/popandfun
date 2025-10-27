import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const { getTotalItems } = useCart();
  const { user, logout } = useAuth();
  const totalItems = getTotalItems();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img 
            src="https://i.ibb.co/yFppc3Jc/Screenshot-2025-10-26-152658-removebg-preview.png" 
            alt="Pop and Fun Logo" 
            className="h-10 w-auto"
          />
        </Link>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">Home</Link>
          </Button>
          {user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin">Dashboard</Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="icon" className="relative" asChild>
                <Link to="/cart">
                  <ShoppingCart className="h-5 w-5" />
                  {totalItems > 0 && (
                    <Badge 
                      className="absolute -right-1 -top-1 h-5 w-5 flex items-center justify-center p-0 bg-primary text-primary-foreground text-xs"
                    >
                      {totalItems}
                    </Badge>
                  )}
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link to="/admin/login">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
