import { useState, useEffect } from 'react';
import { ShoppingCart, Eye, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types/product';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
}

const ProductCard = ({ product, onViewDetails }: ProductCardProps) => {
  const { cart, addToCart, updateQuantity } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [validImages, setValidImages] = useState<string[]>(() => product.images?.filter(Boolean) ?? []);

  // Keep valid images in sync with product changes
  useEffect(() => {
    setValidImages(product.images?.filter(Boolean) ?? []);
    setCurrentImageIndex(0);
  }, [product.images]);

  // Ensure index in range when list shrinks
  useEffect(() => {
    if (validImages.length === 0) return;
    if (currentImageIndex >= validImages.length) setCurrentImageIndex(0);
  }, [validImages.length, currentImageIndex]);

  // Always cycle images smoothly (no hover required)
  useEffect(() => {
    if (!validImages || validImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % validImages.length);
    }, 2000); // change every 2s

    return () => clearInterval(interval);
  }, [validImages.length]);

  const existingItem = cart.find((i) => i.id === product.id);
  const qty = existingItem?.cartQuantity ?? 0;

  const handleAddToCart = () => {
    if (product.quantity === 0) return;
    addToCart(product);
    toast.success('Added to cart!');
  };

  const increment = () => {
    if (qty >= product.quantity) return;
    updateQuantity(product.id, qty + 1);
  };

  const decrement = () => {
    updateQuantity(product.id, qty - 1);
  };

  const discount = Math.round(((product.originalPrice - product.offerPrice) / product.originalPrice) * 100);
  const isLowStock = product.quantity < 5;

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-hover animate-fade-in">
      <div
        className="relative aspect-square overflow-hidden bg-muted cursor-pointer"
        role="button"
        tabIndex={0}
        onClick={() => onViewDetails(product)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onViewDetails(product);
          }
        }}
      >
        {/* Crossfade all images */}
        {validImages.length > 0 ? (
          validImages.map((src, idx) => (
            <img
              key={`${product.id}-img-${idx}`}
              src={src}
              alt={product.title}
              onError={() => {
                setValidImages((prev) => {
                  const next = prev.filter((u) => u !== src);
                  return next;
                });
              }}
              className={
                `absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-in-out ` +
                `${idx === currentImageIndex ? 'opacity-100' : 'opacity-0'} ` +
                `group-hover:scale-105`
              }
            />
          ))
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
            Image unavailable
          </div>
        )}
        {discount > 0 && (
          <Badge className="absolute left-2 top-2 bg-secondary">
            {discount}% OFF
          </Badge>
        )}
        {isLowStock && (
          <Badge variant="destructive" className="absolute right-2 top-2">
            Low Stock
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        <div className="mb-2">
          <Badge variant="outline" className="mb-2">{product.category}</Badge>
          <h3 className="font-semibold line-clamp-2 text-foreground">{product.title}</h3>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl font-bold text-primary">₹{product.offerPrice}</span>
          {product.originalPrice > product.offerPrice && (
            <span className="text-sm text-muted-foreground line-through">
              ₹{product.originalPrice}
            </span>
          )}
        </div>

        <p className="text-sm text-muted-foreground">
          {product.quantity} units available
        </p>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2 items-center">
        {qty === 0 ? (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
            className="flex-1"
            disabled={product.quantity === 0}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
        ) : (
          <div className="flex items-center gap-2 flex-1">
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                decrement();
              }}
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="min-w-8 text-center font-medium">{qty}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                increment();
              }}
              aria-label="Increase quantity"
              disabled={qty >= product.quantity}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
        <Button
          variant="outline"
          size="icon"
          onClick={(e) => { e.stopPropagation(); onViewDetails(product); }}
        >
          <Eye className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
