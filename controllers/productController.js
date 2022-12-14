import asyncHandler from "express-async-handler";
import Product from "../models/productModel.js";

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({});

  res.json(products);
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await product.remove();
    const eventEmmiter = req.app.get("eventEmmiter");;
    eventEmmiter.emit("deletedProduct", { id: req.params.id });
    res.json({ message: "Product removed" });
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const product = new Product({
    name: "Sample name",
    price: 0,
    user: req.user._id,
    image: "/images/sample.jpg",
    brand: "Sample brand",
    category: "Sample category",
    subcategory:"Sample subcategory",
    countInStock: 0,
    numReviews: 0,
    description: "Sample description",
    inStock: true,
    isBestSeller:false
  });
  const eventEmmiter = req.app.get("eventEmmiter");
  const createdProduct = await product.save();
  eventEmmiter.emit("productAdded", { product: createdProduct });
  res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const {
    name,
    price,
    description,
    image,
    brand,
    category,
    subcategory,
    gross,
    netWeight,
    discountPrice,
    countInStock,
    inStock,
    isBestSeller
  } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name;
    product.price = price;
    product.description = description;
    product.image = image;
    product.brand = brand;
    product.category = category;
    product.subcategory = subcategory;
    product.countInStock = countInStock;
    product.gross = gross;
    product.netWeight = netWeight;
    product.discountPrice = discountPrice;
    product.inStock = inStock;
    product.isBestSeller = isBestSeller;

    const updatedProduct = await product.save();
    const eventEmmiter = req.app.get("eventEmmiter");
    eventEmmiter.emit("productUpdated", { id: req.params.id });
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

export {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
};
