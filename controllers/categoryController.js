const Category = require('../models/Category');

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.getAll();
    
    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.getCategory = async (req, res) => {
  try {
    const category = await Category.findBySlug(req.params.slug);
    
    res.json({
      success: true,
      category
    });
  } catch (error) {
    if (error.message === 'Category not found') {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const category = await Category.create({ name, description });
    
    res.status(201).json({
      success: true,
      category
    });
  } catch (error) {
    if (error.message === 'Category already exists') {
      return res.status(400).json({
        success: false,
        message: 'Category already exists'
      });
    }
    
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.update(req.params.id, req.body);
    
    res.json({
      success: true,
      category
    });
  } catch (error) {
    if (error.message === 'Category not found') {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    await Category.delete(req.params.id);
    
    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    if (error.message === 'Category not found') {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};