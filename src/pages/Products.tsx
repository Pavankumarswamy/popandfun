import { useState, useEffect } from 'react';
import { ref, get } from 'firebase/database';
import { database } from '@/lib/firebase';
import { Product, Category } from '@/types/product';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Filter, Search } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  // Category filter + substring search anywhere in the title (case-insensitive)
  useEffect(() => {
    const base = selectedCategory === 'All'
      ? products
      : products.filter((p) => p.category === selectedCategory);

    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setFilteredProducts(base);
      return;
    }

    const filtered = base.filter((p) => p.title.toLowerCase().includes(q));
    setFilteredProducts(filtered);
  }, [selectedCategory, products, searchQuery]);

  const fetchData = async () => {
    try {
      const [productsSnapshot, categoriesSnapshot] = await Promise.all([
        get(ref(database, 'products')),
        get(ref(database, 'categories'))
      ]);
      
      if (productsSnapshot.exists()) {
        const productsData = JSON.parse(productsSnapshot.val());
        const productsArray = Object.entries(productsData).map(([id, data]: [string, any]) => ({
          id,
          ...data,
        }));
        setProducts(productsArray);
        setFilteredProducts(productsArray);
      }

      if (categoriesSnapshot.exists()) {
        const categoriesData = JSON.parse(categoriesSnapshot.val());
        const categoriesArray = Object.entries(categoriesData).map(([id, data]: [string, any]) => ({
          id,
          ...data,
        }));
        setCategories(categoriesArray.sort((a, b) => a.name.localeCompare(b.name)));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">All Products</h1>
        <p className="text-muted-foreground">Discover amazing deals across all categories</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by title"
            className="pl-9"
          />
        </div>
      </div>

      {/* Mobile Filter Toggle */}
      <div className="mb-6 lg:hidden">
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="w-full"
        >
          <Filter className="mr-2 h-4 w-4" />
          {showFilters ? 'Hide' : 'Show'} Filters
        </Button>
      </div>

      {/* Category Filters */}
      {categories.length > 0 && (
        <div className={`mb-8 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === 'All' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('All')}
            >
              All Products
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.name ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.name)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {products.length === 0 
              ? 'No products available yet. Check back soon!' 
              : 'No products found in this category.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onViewDetails={setSelectedProduct}
            />
          ))}
        </div>
      )}

      {/* Product Details Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedProduct.title}</DialogTitle>
                <Badge variant="outline" className="w-fit">{selectedProduct.category}</Badge>
              </DialogHeader>

              <div className="space-y-4">
                <div className="aspect-square overflow-hidden rounded-lg">
                  <img
                    src={selectedProduct.images[0]}
                    alt={selectedProduct.title}
                    className="h-full w-full object-cover"
                  />
                </div>

                {selectedProduct.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {selectedProduct.images.slice(1).map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`${selectedProduct.title} ${idx + 2}`}
                        className="h-20 w-20 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-primary">
                    ₹{selectedProduct.offerPrice}
                  </span>
                  {selectedProduct.originalPrice > selectedProduct.offerPrice && (
                    <>
                      <span className="text-lg text-muted-foreground line-through">
                        ₹{selectedProduct.originalPrice}
                      </span>
                      <Badge className="bg-secondary">
                        {Math.round(((selectedProduct.originalPrice - selectedProduct.offerPrice) / selectedProduct.originalPrice) * 100)}% OFF
                      </Badge>
                    </>
                  )}
                </div>

                {selectedProduct.description && (
                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-muted-foreground">{selectedProduct.description}</p>
                  </div>
                )}

                {selectedProduct.colorVariants && selectedProduct.colorVariants.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Available Colors</h4>
                    <div className="flex gap-2">
                      {selectedProduct.colorVariants.map((color) => (
                        <div
                          key={color}
                          className="h-8 w-8 rounded-full border-2 border-border"
                          style={{ backgroundColor: color.toLowerCase() }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold mb-2">Availability</h4>
                  <p className="text-muted-foreground">
                    {selectedProduct.quantity > 0 
                      ? `${selectedProduct.quantity} units in stock`
                      : 'Out of stock'
                    }
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;
