import { useState, useEffect } from 'react';
import { ref, set, get } from 'firebase/database';
import { database } from '@/lib/firebase';
import { Category } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Trash2, FolderOpen } from 'lucide-react';

const CategoriesManagement = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [categoryName, setCategoryName] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const categoriesRef = ref(database, 'categories');
      const snapshot = await get(categoriesRef);
      
      if (snapshot.exists()) {
        const categoriesData = JSON.parse(snapshot.val());
        const categoriesArray = Object.entries(categoriesData).map(([id, data]: [string, any]) => ({
          id,
          ...data,
        }));
        setCategories(categoriesArray.sort((a, b) => a.name.localeCompare(b.name)));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    try {
      const newCategory: Omit<Category, 'id'> = {
        name: categoryName.trim(),
        createdAt: Date.now(),
      };

      const categoryId = Date.now().toString();
      const updatedCategories = [...categories, { ...newCategory, id: categoryId }];

      const categoriesData = updatedCategories.reduce((acc, c) => {
        acc[c.id] = { name: c.name, createdAt: c.createdAt };
        return acc;
      }, {} as any);

      await set(ref(database, 'categories'), JSON.stringify(categoriesData));
      
      toast.success('Category added!');
      setCategories(updatedCategories.sort((a, b) => a.name.localeCompare(b.name)));
      setCategoryName('');
      setShowDialog(false);
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Failed to save category');
    }
  };

  const handleDelete = async (categoryId: string, categoryName: string) => {
    if (!confirm(`Delete "${categoryName}" category? This won't delete products in this category.`)) return;

    try {
      const updatedCategories = categories.filter(c => c.id !== categoryId);
      
      if (updatedCategories.length === 0) {
        // If no categories left, remove the node entirely
        await set(ref(database, 'categories'), null);
      } else {
        const categoriesData = updatedCategories.reduce((acc, c) => {
          acc[c.id] = { name: c.name, createdAt: c.createdAt };
          return acc;
        }, {} as any);

        await set(ref(database, 'categories'), JSON.stringify(categoriesData));
      }
      
      toast.success('Category deleted!');
      setCategories(updatedCategories);
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Categories</h2>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="categoryName">Category Name *</Label>
                <Input
                  id="categoryName"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g., Electronics, Fashion"
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                Add Category
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading categories...</p>
        </div>
      ) : categories.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">No categories yet</p>
            <p className="text-sm text-muted-foreground">Add your first category to organize products</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((category) => (
            <Card key={category.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-semibold">{category.name}</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => handleDelete(category.id, category.name)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Created {new Date(category.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoriesManagement;
