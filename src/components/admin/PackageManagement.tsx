import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, Settings, Clock, DollarSign, Users } from 'lucide-react';
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

const PackageManagement = () => {
  const { toast } = useToast();
  const [packages, setPackages] = useState([
    {
      id: 1,
      title: 'Complete Web Development Bootcamp',
      category: 'Web Development',
      basePrice: 15000,
      discountedPrice: 12000,
      duration: '8 weeks',
      includes: [
        'Live interactive sessions',
        'Hands-on projects',
        'Industry certification',
        'Job placement assistance'
      ],
      customizationOptions: [
        {
          id: 1,
          name: 'Delivery Mode',
          type: 'select',
          options: [
            { label: 'Online Only', price: 0 },
            { label: 'Offline Only', price: 2000 },
            { label: 'Hybrid (3 days online + 3 days offline)', price: 1500 }
          ],
          required: true
        },
        {
          id: 2,
          name: 'Additional Projects',
          type: 'checkbox',
          options: [
            { label: 'E-commerce Project', price: 3000 },
            { label: 'Portfolio Website', price: 1500 },
            { label: 'API Development Project', price: 2500 }
          ],
          required: false
        },
        {
          id: 3,
          name: 'One-on-One Mentoring',
          type: 'select',
          options: [
            { label: 'No mentoring', price: 0 },
            { label: '2 sessions', price: 2000 },
            { label: '5 sessions', price: 4500 },
            { label: '10 sessions', price: 8000 }
          ],
          required: false
        }
      ],
      isActive: true
    },
    {
      id: 2,
      title: 'Data Science Fundamentals',
      category: 'Data Science',
      basePrice: 12000,
      discountedPrice: 9500,
      duration: '6 weeks',
      includes: [
        'Python programming',
        'Data analysis with Pandas',
        'Visualization with Matplotlib',
        'Basic machine learning'
      ],
      customizationOptions: [
        {
          id: 1,
          name: 'Programming Language',
          type: 'select',
          options: [
            { label: 'Python Only', price: 0 },
            { label: 'Python + R', price: 1500 },
            { label: 'Python + SQL', price: 1000 }
          ],
          required: true
        },
        {
          id: 2,
          name: 'Specialization Track',
          type: 'checkbox',
          options: [
            { label: 'Machine Learning Focus', price: 2000 },
            { label: 'Business Analytics Focus', price: 1800 },
            { label: 'Deep Learning Introduction', price: 3000 }
          ],
          required: false
        }
      ],
      isActive: true
    }
  ]);

  const [editingPackage, setEditingPackage] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPackage, setNewPackage] = useState({
    title: '',
    category: '',
    basePrice: 0,
    discountedPrice: 0,
    duration: '',
    includes: [],
    customizationOptions: [],
    isActive: true
  });

  const categories = ['Web Development', 'Data Science', 'Cybersecurity', 'Cloud Computing', 'Finance'];

  const handleSavePackage = () => {
    if (editingPackage) {
      setPackages(prev => prev.map(pkg => 
        pkg.id === editingPackage.id ? editingPackage : pkg
      ));
      setEditingPackage(null);
    }
    toast({
      title: "Package Updated",
      description: "Package has been updated successfully.",
    });
  };

  const handleCreatePackage = () => {
    const packageData = {
      ...newPackage,
      id: Date.now()
    };
    setPackages(prev => [...prev, packageData]);
    setNewPackage({
      title: '',
      category: '',
      basePrice: 0,
      discountedPrice: 0,
      duration: '',
      includes: [],
      customizationOptions: [],
      isActive: true
    });
    setShowCreateModal(false);
    toast({
      title: "Package Created",
      description: "New package has been created successfully.",
    });
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
    }
  };

  const removeCustomizationOption = (optionId) => {
    if (editingPackage) {
      setEditingPackage(prev => ({
        ...prev,
        customizationOptions: prev.customizationOptions.filter(opt => opt.id !== optionId)
      }));
    }
  };

  const updateCustomizationOption = (optionId, field, value) => {
    if (editingPackage) {
      setEditingPackage(prev => ({
        ...prev,
        customizationOptions: prev.customizationOptions.map(opt => 
          opt.id === optionId ? { ...opt, [field]: value } : opt
        )
      }));
    }
  };

  const addOptionChoice = (optionId) => {
    if (editingPackage) {
      setEditingPackage(prev => ({
        ...prev,
        customizationOptions: prev.customizationOptions.map(opt => 
          opt.id === optionId 
            ? { ...opt, options: [...opt.options, { label: 'New Choice', price: 0 }] }
            : opt
        )
      }));
    }
  };

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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Package</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="package-title">Package Title</Label>
                <Input
                  id="package-title"
                  value={newPackage.title}
                  onChange={(e) => setNewPackage(prev => ({...prev, title: e.target.value}))}
                  placeholder="e.g. Complete Web Development Bootcamp"
                />
              </div>
              <div>
                <Label htmlFor="package-category">Category</Label>
                <Select value={newPackage.category} onValueChange={(value) => setNewPackage(prev => ({...prev, category: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="base-price">Base Price (₹)</Label>
                  <Input
                    id="base-price"
                    type="number"
                    value={newPackage.basePrice}
                    onChange={(e) => setNewPackage(prev => ({...prev, basePrice: parseInt(e.target.value) || 0}))}
                  />
                </div>
                <div>
                  <Label htmlFor="discounted-price">Discounted Price (₹)</Label>
                  <Input
                    id="discounted-price"
                    type="number"
                    value={newPackage.discountedPrice}
                    onChange={(e) => setNewPackage(prev => ({...prev, discountedPrice: parseInt(e.target.value) || 0}))}
                  />
                </div>
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
                  <Badge variant="secondary" className="mt-1">{pkg.category}</Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingPackage(pkg)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPackages(prev => prev.filter(p => p.id !== pkg.id))}
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
                    <span className="font-semibold">₹{pkg.discountedPrice.toLocaleString()}</span>
                    <span className="text-sm text-gray-500 line-through">₹{pkg.basePrice.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    {pkg.duration}
                  </div>
                </div>
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
                <div className="flex items-center gap-2 text-sm">
                  <Settings className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-600 font-medium">
                    {pkg.customizationOptions.length} customization options
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
                    value={editingPackage.category} 
                    onValueChange={(value) => setEditingPackage(prev => ({...prev, category: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-base-price">Base Price (₹)</Label>
                  <Input
                    id="edit-base-price"
                    type="number"
                    value={editingPackage.basePrice}
                    onChange={(e) => setEditingPackage(prev => ({...prev, basePrice: parseInt(e.target.value) || 0}))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-discounted-price">Discounted Price (₹)</Label>
                  <Input
                    id="edit-discounted-price"
                    type="number"
                    value={editingPackage.discountedPrice}
                    onChange={(e) => setEditingPackage(prev => ({...prev, discountedPrice: parseInt(e.target.value) || 0}))}
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
                  {editingPackage.customizationOptions.map((option) => (
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
                                checked={option.required}
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
                          {option.options.map((choice, choiceIndex) => (
                            <div key={choiceIndex} className="flex gap-2">
                              <Input
                                value={choice.label}
                                onChange={(e) => {
                                  const newOptions = [...option.options];
                                  newOptions[choiceIndex] = { ...choice, label: e.target.value };
                                  updateCustomizationOption(option.id, 'options', newOptions);
                                }}
                                placeholder="Choice label"
                              />
                              <Input
                                type="number"
                                value={choice.price}
                                onChange={(e) => {
                                  const newOptions = [...option.options];
                                  newOptions[choiceIndex] = { ...choice, price: parseInt(e.target.value) || 0 };
                                  updateCustomizationOption(option.id, 'options', newOptions);
                                }}
                                placeholder="Price"
                                className="w-24"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newOptions = option.options.filter((_, i) => i !== choiceIndex);
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