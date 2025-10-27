import { useState, useEffect } from 'react';
import { ref, set, get } from 'firebase/database';
import { database } from '@/lib/firebase';
import { Product, Category } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const ProductsManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Electronics' as string,
    description: '',
    originalPrice: '',
    offerPrice: '',
    images: '',
    colorVariants: '',
    quantity: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

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
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const newProduct: Omit<Product, 'id'> = {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        originalPrice: parseFloat(formData.originalPrice),
        offerPrice: parseFloat(formData.offerPrice),
        images: formData.images.split(',').map(img => img.trim()),
        colorVariants: formData.colorVariants ? formData.colorVariants.split(',').map(c => c.trim()) : undefined,
        quantity: parseInt(formData.quantity),
        createdAt: Date.now(),
      };

      const productId = editingProduct?.id || Date.now().toString();
      const updatedProducts = editingProduct
        ? products.map(p => (p.id === productId ? { ...newProduct, id: productId } : p))
        : [...products, { ...newProduct, id: productId }];

      const productsData = updatedProducts.reduce((acc, p) => {
        acc[p.id] = { ...p };
        delete acc[p.id].id;
        return acc;
      }, {} as any);

      await set(ref(database, 'products'), JSON.stringify(productsData));
      
      toast.success(editingProduct ? 'Product updated!' : 'Product added!');
      setProducts(updatedProducts);
      resetForm();
      setShowDialog(false);
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const updatedProducts = products.filter(p => p.id !== productId);
      const productsData = updatedProducts.reduce((acc, p) => {
        acc[p.id] = { ...p };
        delete acc[p.id].id;
        return acc;
      }, {} as any);

      await set(ref(database, 'products'), JSON.stringify(productsData));
      
      toast.success('Product deleted!');
      setProducts(updatedProducts);
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      category: product.category,
      description: product.description || '',
      originalPrice: product.originalPrice.toString(),
      offerPrice: product.offerPrice.toString(),
      images: product.images.join(', '),
      colorVariants: product.colorVariants?.join(', ') || '',
      quantity: product.quantity.toString(),
    });
    setShowDialog(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: 'Electronics' as string,
      description: '',
      originalPrice: '',
      offerPrice: '',
      images: '',
      colorVariants: '',
      quantity: '',
    });
    setEditingProduct(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Products</h2>
        <Dialog open={showDialog} onOpenChange={(open) => {
          setShowDialog(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Product Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                {categories.length === 0 ? (
                  <p className="text-sm text-muted-foreground border rounded-md p-3">
                    No categories available. Please add categories first in the Categories tab.
                  </p>
                ) : (
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="originalPrice">Original Price *</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="offerPrice">Offer Price *</Label>
                  <Input
                    id="offerPrice"
                    type="number"
                    value={formData.offerPrice}
                    onChange={(e) => setFormData({ ...formData, offerPrice: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="images">Image URLs (comma separated) *</Label>
                <Textarea
                  id="images"
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="colorVariants">Color Variants (comma separated, optional)</Label>
                <Input
                  id="colorVariants"
                  value={formData.colorVariants}
                  onChange={(e) => setFormData({ ...formData, colorVariants: e.target.value })}
                  placeholder="Red, Blue, Green"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Available Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={categories.length === 0}>
                {editingProduct ? 'Update Product' : 'Add Product'}
              </Button>
              {categories.length === 0 && (
                <p className="text-xs text-center text-muted-foreground">
                  Add categories first to create products
                </p>
              )}
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No products yet. Add your first product!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id}>
              <CardHeader>
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-full h-48 object-cover rounded-lg mb-2"
                />
                <CardTitle className="line-clamp-2">{product.title}</CardTitle>
                <Badge variant="outline" className="w-fit">{product.category}</Badge>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl font-bold text-primary">₹{product.offerPrice}</span>
                  {product.originalPrice > product.offerPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      ₹{product.originalPrice}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Stock: {product.quantity} units
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(product)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(product.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsManagement;
