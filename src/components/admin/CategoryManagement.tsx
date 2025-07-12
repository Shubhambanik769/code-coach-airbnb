import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const CategoryManagement = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState([
    {
      id: 1,
      name: 'Web Development',
      slug: 'web-development',
      description: 'Learn modern web technologies',
      icon: '💻',
      isActive: true,
      subcategories: [
        'Full Stack Development',
        'React & Angular',
        'Node.js & Express',
        'Database Design'
      ]
    },
    {
      id: 2,
      name: 'Data Science',
      slug: 'data-science',
      description: 'Master data analysis and machine learning',
      icon: '📊',
      isActive: true,
      subcategories: [
        'Python for Data Science',
        'Machine Learning',
        'Data Visualization',
        'Statistical Analysis'
      ]
    }
  ]);

  const [editingCategory, setEditingCategory] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    icon: '',
    subcategories: []
  });

  const handleSaveCategory = () => {
    if (editingCategory) {
      setCategories(prev => prev.map(cat => 
        cat.id === editingCategory.id ? editingCategory : cat
      ));
      setEditingCategory(null);
    }
    toast({
      title: "Category Updated",
      description: "Category has been updated successfully.",
    });
  };

  const handleCreateCategory = () => {
    const category = {
      ...newCategory,
      id: Date.now(),
      slug: newCategory.name.toLowerCase().replace(/\s+/g, '-'),
      isActive: true
    };
    setCategories(prev => [...prev, category]);
    setNewCategory({ name: '', description: '', icon: '', subcategories: [] });
    setShowCreateModal(false);
    toast({
      title: "Category Created",
      description: "New category has been created successfully.",
    });
  };

  const handleDeleteCategory = (id) => {
    setCategories(prev => prev.filter(cat => cat.id !== id));
    toast({
      title: "Category Deleted",
      description: "Category has been deleted successfully.",
    });
  };

  const addSubcategory = (categoryId, subcategory) => {
    if (editingCategory) {
      setEditingCategory(prev => ({
        ...prev,
        subcategories: [...prev.subcategories, subcategory]
      }));
    }
  };

  const removeSubcategory = (categoryId, index) => {
    if (editingCategory) {
      setEditingCategory(prev => ({
        ...prev,
        subcategories: prev.subcategories.filter((_, i) => i !== index)
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Category Management</h2>
          <p className="text-muted-foreground">Manage training categories and courses</p>
        </div>
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="category-name">Category Name</Label>
                <Input
                  id="category-name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory(prev => ({...prev, name: e.target.value}))}
                  placeholder="e.g. Web Development"
                />
              </div>
              <div>
                <Label htmlFor="category-description">Description</Label>
                <Textarea
                  id="category-description"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory(prev => ({...prev, description: e.target.value}))}
                  placeholder="Brief description of the category"
                />
              </div>
              <div>
                <Label htmlFor="category-icon">Icon (emoji)</Label>
                <Input
                  id="category-icon"
                  value={newCategory.icon}
                  onChange={(e) => setNewCategory(prev => ({...prev, icon: e.target.value}))}
                  placeholder="💻"
                />
              </div>
              <Button onClick={handleCreateCategory} className="w-full">
                Create Category
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Card key={category.id} className="relative">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingCategory(category)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div>
                <h4 className="font-medium mb-2">Courses ({category.subcategories.length})</h4>
                <div className="space-y-1">
                  {category.subcategories.slice(0, 3).map((sub, index) => (
                    <div key={index} className="text-sm text-muted-foreground">
                      • {sub}
                    </div>
                  ))}
                  {category.subcategories.length > 3 && (
                    <div className="text-sm text-muted-foreground">
                      +{category.subcategories.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Category Modal */}
      {editingCategory && (
        <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Category: {editingCategory.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Category Name</Label>
                  <Input
                    id="edit-name"
                    value={editingCategory.name}
                    onChange={(e) => setEditingCategory(prev => ({...prev, name: e.target.value}))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-icon">Icon</Label>
                  <Input
                    id="edit-icon"
                    value={editingCategory.icon}
                    onChange={(e) => setEditingCategory(prev => ({...prev, icon: e.target.value}))}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingCategory.description}
                  onChange={(e) => setEditingCategory(prev => ({...prev, description: e.target.value}))}
                />
              </div>

              <div>
                <Label>Courses/Subcategories</Label>
                <div className="space-y-2 mt-2">
                  {editingCategory.subcategories.map((sub, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={sub}
                        onChange={(e) => {
                          const newSubs = [...editingCategory.subcategories];
                          newSubs[index] = e.target.value;
                          setEditingCategory(prev => ({...prev, subcategories: newSubs}));
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSubcategory(editingCategory.id, index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => addSubcategory(editingCategory.id, 'New Course')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Course
                  </Button>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingCategory(null)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveCategory}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CategoryManagement;