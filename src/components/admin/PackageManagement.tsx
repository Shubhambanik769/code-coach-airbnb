import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Settings, Clock, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const PackageManagement = () => {
  const { toast } = useToast();
  const [packages, setPackages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingPackage, setEditingPackage] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [newPackage, setNewPackage] = useState({
    title: '',
    category_id: '',
    subcategory: '',
    base_price: 0,
    discounted_price: 0,
    duration: '',
    description: '',
    includes: [],
    excludes: [],
    customizationOptions: [],
    is_active: true
  });

  const [selectedCategory, setSelectedCategory] = useState('');
  const [availableSubcategories, setAvailableSubcategories] = useState([]);

  // Fetch categories and packages on component mount
  useEffect(() => {
    fetchCategories();
    fetchPackages();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('service_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to fetch categories.",
        variant: "destructive"
      });
    }
  };

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const { data: packagesData, error: packagesError } = await supabase
        .from('packages')
        .select(`
          *,
          service_categories(name, slug)
        `)
        .order('created_at', { ascending: false });

      if (packagesError) throw packagesError;

      // Fetch customization options for each package
      const packagesWithOptions = await Promise.all(
        (packagesData || []).map(async (pkg) => {
          const { data: optionsData, error: optionsError } = await supabase
            .from('package_customization_options')
            .select('*')
            .eq('package_id', pkg.id);

          if (optionsError) {
            console.error('Error fetching customization options:', optionsError);
            return { ...pkg, customizationOptions: [] };
          }

          return {
            ...pkg,
            customizationOptions: optionsData || []
          };
        })
      );

      setPackages(packagesWithOptions);
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast({
        title: "Error",
        description: "Failed to fetch packages.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryId, isNewPackage = false) => {
    const category = categories.find(c => c.id === categoryId);
    const subcategories = category?.subcategories || [];
    
    setAvailableSubcategories(subcategories);
    setSelectedCategory(categoryId);
    
    if (isNewPackage) {
      setNewPackage(prev => ({
        ...prev,
        category_id: categoryId,
        subcategory: ''
      }));
    } else if (editingPackage) {
      setEditingPackage(prev => ({
        ...prev,
        category_id: categoryId,
        subcategory: ''
      }));
    }
  };

  const handleCreatePackage = async () => {
    try {
      // Validate required fields
      if (!newPackage.title || !newPackage.category_id || !newPackage.subcategory) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive"
        });
        return;
      }

      // Insert package
      const { data: packageData, error: packageError } = await supabase
        .from('packages')
        .insert([{
          title: newPackage.title,
          category_id: newPackage.category_id,
          subcategory: newPackage.subcategory,
          base_price: newPackage.base_price,
          discounted_price: newPackage.discounted_price,
          duration: newPackage.duration,
          description: newPackage.description,
          includes: newPackage.includes,
          excludes: newPackage.excludes,
          is_active: newPackage.is_active
        }])
        .select()
        .single();

      if (packageError) throw packageError;

      // Insert customization options if any
      if (newPackage.customizationOptions.length > 0) {
        const optionsToInsert = newPackage.customizationOptions.map(option => ({
          package_id: packageData.id,
          name: option.name,
          type: option.type,
          options: option.options,
          is_required: option.required
        }));

        const { error: optionsError } = await supabase
          .from('package_customization_options')
          .insert(optionsToInsert);

        if (optionsError) throw optionsError;
      }

      // Reset form and close modal
      setNewPackage({
        title: '',
        category_id: '',
        subcategory: '',
        base_price: 0,
        discounted_price: 0,
        duration: '',
        description: '',
        includes: [],
        excludes: [],
        customizationOptions: [],
        is_active: true
      });
      setSelectedCategory('');
      setAvailableSubcategories([]);
      setShowCreateModal(false);
      
      // Refresh packages list
      fetchPackages();
      
      toast({
        title: "Success",
        description: "Package created successfully.",
      });
    } catch (error) {
      console.error('Error creating package:', error);
      toast({
        title: "Error",
        description: "Failed to create package.",
        variant: "destructive"
      });
    }
  };

  const handleSavePackage = async () => {
    try {
      if (!editingPackage) return;

      // Update package
      const { error: packageError } = await supabase
        .from('packages')
        .update({
          title: editingPackage.title,
          category_id: editingPackage.category_id,
          subcategory: editingPackage.subcategory,
          base_price: editingPackage.base_price,
          discounted_price: editingPackage.discounted_price,
          duration: editingPackage.duration,
          description: editingPackage.description,
          includes: editingPackage.includes,
          excludes: editingPackage.excludes,
          is_active: editingPackage.is_active
        })
        .eq('id', editingPackage.id);

      if (packageError) throw packageError;

      // Delete existing customization options
      const { error: deleteError } = await supabase
        .from('package_customization_options')
        .delete()
        .eq('package_id', editingPackage.id);

      if (deleteError) throw deleteError;

      // Insert updated customization options
      if (editingPackage.customizationOptions.length > 0) {
        const optionsToInsert = editingPackage.customizationOptions.map(option => ({
          package_id: editingPackage.id,
          name: option.name,
          type: option.type,
          options: option.options,
          is_required: option.required || option.is_required
        }));

        const { error: optionsError } = await supabase
          .from('package_customization_options')
          .insert(optionsToInsert);

        if (optionsError) throw optionsError;
      }

      setEditingPackage(null);
      fetchPackages();
      
      toast({
        title: "Success",
        description: "Package updated successfully.",
      });
    } catch (error) {
      console.error('Error updating package:', error);
      toast({
        title: "Error",
        description: "Failed to update package.",
        variant: "destructive"
      });
    }
  };

  const handleDeletePackage = async (packageId) => {
    try {
      const { error } = await supabase
        .from('packages')
        .delete()
        .eq('id', packageId);

      if (error) throw error;

      fetchPackages();
      toast({
        title: "Success",
        description: "Package deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting package:', error);
      toast({
        title: "Error",
        description: "Failed to delete package.",
        variant: "destructive"
      });
    }
  };

  const addCustomizationOption = () => {
    const newOption = {
      id: Date.now(),
      name: 'New Option',
      type: 'select',
      options: [{ label: 'Option 1', price: 0 }],
      required: false
    };
    
    if (editingPackage) {
      setEditingPackage(prev => ({
        ...prev,
        customizationOptions: [...prev.customizationOptions, newOption]
      }));
    } else {
      setNewPackage(prev => ({
        ...prev,
        customizationOptions: [...prev.customizationOptions, newOption]
      }));
    }
  };

  const removeCustomizationOption = (optionId) => {
    if (editingPackage) {
      setEditingPackage(prev => ({
        ...prev,
        customizationOptions: prev.customizationOptions.filter(opt => opt.id !== optionId)
      }));
    } else {
      setNewPackage(prev => ({
        ...prev,
        customizationOptions: prev.customizationOptions.filter(opt => opt.id !== optionId)
      }));
    }
  };

  const updateCustomizationOption = (optionId, field, value) => {
    const updateFunction = (prev) => ({
      ...prev,
      customizationOptions: prev.customizationOptions.map(opt => 
        opt.id === optionId ? { ...opt, [field]: value } : opt
      )
    });

    if (editingPackage) {
      setEditingPackage(updateFunction);
    } else {
      setNewPackage(updateFunction);
    }
  };

  const addOptionChoice = (optionId) => {
    const updateFunction = (prev) => ({
      ...prev,
      customizationOptions: prev.customizationOptions.map(opt => 
        opt.id === optionId 
          ? { ...opt, options: [...opt.options, { label: 'New Choice', price: 0 }] }
          : opt
      )
    });

    if (editingPackage) {
      setEditingPackage(updateFunction);
    } else {
      setNewPackage(updateFunction);
    }
  };

  const addIncludeItem = (isNewPackage = false) => {
    if (isNewPackage) {
      setNewPackage(prev => ({
        ...prev,
        includes: [...prev.includes, '']
      }));
    } else if (editingPackage) {
      setEditingPackage(prev => ({
        ...prev,
        includes: [...prev.includes, '']
      }));
    }
  };

  const updateIncludeItem = (index, value, isNewPackage = false) => {
    if (isNewPackage) {
      setNewPackage(prev => ({
        ...prev,
        includes: prev.includes.map((item, i) => i === index ? value : item)
      }));
    } else if (editingPackage) {
      setEditingPackage(prev => ({
        ...prev,
        includes: prev.includes.map((item, i) => i === index ? value : item)
      }));
    }
  };

  const removeIncludeItem = (index, isNewPackage = false) => {
    if (isNewPackage) {
      setNewPackage(prev => ({
        ...prev,
        includes: prev.includes.filter((_, i) => i !== index)
      }));
    } else if (editingPackage) {
      setEditingPackage(prev => ({
        ...prev,
        includes: prev.includes.filter((_, i) => i !== index)
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Package Management</h2>
          <p className="text-muted-foreground">Manage training packages and customization options</p>
        </div>
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Package
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Package</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="package-title">Package Title *</Label>
                <Input
                  id="package-title"
                  value={newPackage.title}
                  onChange={(e) => setNewPackage(prev => ({...prev, title: e.target.value}))}
                  placeholder="e.g. Complete Web Development Bootcamp"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="package-category">Category *</Label>
                  <Select 
                    value={selectedCategory} 
                    onValueChange={(value) => handleCategoryChange(value, true)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="package-subcategory">Subcategory *</Label>
                  <Select 
                    value={newPackage.subcategory} 
                    onValueChange={(value) => setNewPackage(prev => ({...prev, subcategory: value}))}
                    disabled={!selectedCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSubcategories.map(subcategory => (
                        <SelectItem key={subcategory} value={subcategory}>{subcategory}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="base-price">Base Price (₹) *</Label>
                  <Input
                    id="base-price"
                    type="number"
                    value={newPackage.base_price}
                    onChange={(e) => setNewPackage(prev => ({...prev, base_price: parseFloat(e.target.value) || 0}))}
                  />
                </div>
                <div>
                  <Label htmlFor="discounted-price">Discounted Price (₹)</Label>
                  <Input
                    id="discounted-price"
                    type="number"
                    value={newPackage.discounted_price}
                    onChange={(e) => setNewPackage(prev => ({...prev, discounted_price: parseFloat(e.target.value) || 0}))}
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={newPackage.duration}
                    onChange={(e) => setNewPackage(prev => ({...prev, duration: e.target.value}))}
                    placeholder="e.g. 8 weeks"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newPackage.description}
                  onChange={(e) => setNewPackage(prev => ({...prev, description: e.target.value}))}
                  placeholder="Package description..."
                  rows={3}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>What's Included</Label>
                  <Button variant="outline" size="sm" onClick={() => addIncludeItem(true)}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Item
                  </Button>
                </div>
                <div className="space-y-2">
                  {newPackage.includes.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={item}
                        onChange={(e) => updateIncludeItem(index, e.target.value, true)}
                        placeholder="What's included..."
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeIncludeItem(index, true)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={handleCreatePackage} className="w-full">
                Create Package
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {packages.map((pkg) => (
          <Card key={pkg.id} className="relative">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{pkg.title}</CardTitle>
                  <Badge variant="secondary" className="mt-1">
                    {pkg.service_categories?.name} - {pkg.subcategory}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingPackage(pkg);
                      handleCategoryChange(pkg.category_id);
                    }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeletePackage(pkg.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="font-semibold">₹{pkg.discounted_price?.toLocaleString() || pkg.base_price?.toLocaleString()}</span>
                    {pkg.discounted_price && pkg.discounted_price !== pkg.base_price && (
                      <span className="text-sm text-gray-500 line-through">₹{pkg.base_price?.toLocaleString()}</span>
                    )}
                  </div>
                  {pkg.duration && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      {pkg.duration}
                    </div>
                  )}
                </div>
                
                {pkg.description && (
                  <p className="text-sm text-gray-600">{pkg.description}</p>
                )}
                
                {pkg.includes && pkg.includes.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Includes:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {pkg.includes.slice(0, 3).map((item, index) => (
                        <li key={index}>• {item}</li>
                      ))}
                      {pkg.includes.length > 3 && (
                        <li>+{pkg.includes.length - 3} more features</li>
                      )}
                    </ul>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-sm">
                  <Settings className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-600 font-medium">
                    {pkg.customizationOptions?.length || 0} customization options
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Package Modal */}
      {editingPackage && (
        <Dialog open={!!editingPackage} onOpenChange={() => setEditingPackage(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Package: {editingPackage.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-title">Package Title</Label>
                  <Input
                    id="edit-title"
                    value={editingPackage.title}
                    onChange={(e) => setEditingPackage(prev => ({...prev, title: e.target.value}))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-category">Category</Label>
                  <Select 
                    value={editingPackage.category_id} 
                    onValueChange={(value) => handleCategoryChange(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="edit-subcategory">Subcategory</Label>
                <Select 
                  value={editingPackage.subcategory} 
                  onValueChange={(value) => setEditingPackage(prev => ({...prev, subcategory: value}))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSubcategories.map(subcategory => (
                      <SelectItem key={subcategory} value={subcategory}>{subcategory}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-base-price">Base Price (₹)</Label>
                  <Input
                    id="edit-base-price"
                    type="number"
                    value={editingPackage.base_price}
                    onChange={(e) => setEditingPackage(prev => ({...prev, base_price: parseFloat(e.target.value) || 0}))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-discounted-price">Discounted Price (₹)</Label>
                  <Input
                    id="edit-discounted-price"
                    type="number"
                    value={editingPackage.discounted_price}
                    onChange={(e) => setEditingPackage(prev => ({...prev, discounted_price: parseFloat(e.target.value) || 0}))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-duration">Duration</Label>
                  <Input
                    id="edit-duration"
                    value={editingPackage.duration}
                    onChange={(e) => setEditingPackage(prev => ({...prev, duration: e.target.value}))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingPackage.description || ''}
                  onChange={(e) => setEditingPackage(prev => ({...prev, description: e.target.value}))}
                  rows={3}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>What's Included</Label>
                  <Button variant="outline" size="sm" onClick={() => addIncludeItem()}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Item
                  </Button>
                </div>
                <div className="space-y-2">
                  {(editingPackage.includes || []).map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={item}
                        onChange={(e) => updateIncludeItem(index, e.target.value)}
                        placeholder="What's included..."
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeIncludeItem(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customization Options */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <Label className="text-base font-semibold">Customization Options</Label>
                  <Button variant="outline" onClick={addCustomizationOption}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Option
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {(editingPackage.customizationOptions || []).map((option) => (
                    <Card key={option.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="grid grid-cols-3 gap-4 flex-1">
                            <Input
                              value={option.name}
                              onChange={(e) => updateCustomizationOption(option.id, 'name', e.target.value)}
                              placeholder="Option name"
                            />
                            <Select 
                              value={option.type} 
                              onValueChange={(value) => updateCustomizationOption(option.id, 'type', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="select">Single Select</SelectItem>
                                <SelectItem value="checkbox">Multiple Choice</SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={option.required || option.is_required}
                                onCheckedChange={(checked) => updateCustomizationOption(option.id, 'required', checked)}
                              />
                              <Label className="text-sm">Required</Label>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCustomizationOption(option.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-sm">Choices:</Label>
                          {(option.options || []).map((choice, choiceIndex) => (
                            <div key={choiceIndex} className="flex gap-2">
                              <Input
                                value={choice.label}
                                onChange={(e) => {
                                  const newOptions = [...(option.options || [])];
                                  newOptions[choiceIndex] = { ...choice, label: e.target.value };
                                  updateCustomizationOption(option.id, 'options', newOptions);
                                }}
                                placeholder="Choice label"
                              />
                              <Input
                                type="number"
                                value={choice.price}
                                onChange={(e) => {
                                  const newOptions = [...(option.options || [])];
                                  newOptions[choiceIndex] = { ...choice, price: parseFloat(e.target.value) || 0 };
                                  updateCustomizationOption(option.id, 'options', newOptions);
                                }}
                                placeholder="Price"
                                className="w-24"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newOptions = (option.options || []).filter((_, i) => i !== choiceIndex);
                                  updateCustomizationOption(option.id, 'options', newOptions);
                                }}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addOptionChoice(option.id)}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Choice
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingPackage(null)}>
                  Cancel
                </Button>
                <Button onClick={handleSavePackage}>
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

export default PackageManagement;