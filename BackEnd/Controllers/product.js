import ProductModel from "../Model/product.js";

let cart = [];

export const AddProduct = async (req, res) => {
  let { title, description, price, image } = req.body;
  try {

    const oldProduct = await ProductModel.findOne({ title });

    if (oldProduct) return res.status(400).json({ message: "Product already exists" });
    const defaultReaction = 'react';

    const newProduct = await ProductModel.create({ title, description, price, image, defaultReaction });

    res.status(201).json({ success: true, message: "Product Created", newProduct });

  } catch (error) {
    res.status(500).json({ success: false, message: "Something went wrong" });
    console.error(error);
  }
};

export const AddProductToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const product = await ProductModel.findById(productId);
    console.log(productId)

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Create an item object representing the product added to the cart
    const item = {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: parseInt(quantity)
    };

    // Check if the product is already in the cart
    const existingItemIndex = cart.findIndex(item => item.productId === productId);

    if (existingItemIndex !== -1) {
      // If the product is already in the cart, update the quantity
      cart[existingItemIndex].quantity += parseInt(quantity);
    } else {
      // If the product is not in the cart, add it
      cart.push(item);
    }

    res.status(200).json({ message: 'Product added to cart', cart });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error });
    console.error(error);
  }
};

export const AllProducts = async (req, res) => {
  try {

    const allProducts = await ProductModel.find();

    res.status(201).json({ success: true, message: "All Products", allProducts });
  } catch (error) {
    res.status(500).json({ success: false, message: "Something went wrong" });
    console.log(error);
  }
};

export const SingleProduct = async (req, res) => {
  const { id } = req.params

  try {

    const singleProducts = await ProductModel.findById(id);

    res.status(201).json({ success: true, message: "Products", singleProducts });

  } catch (error) {
    res.status(500).json({ success: false, message: "Something went wrong" });
    console.log(error);
  }
};

export const Social = async (req, res) => {
  const { id } = req.params
  let { reaction } = req.body

  try {
    const updatedProduct = await ProductModel.updateOne(
      { _id: id },
      { $set: { reaction: reaction } }
    );

    if (updatedProduct.nModified === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, message: "Product reaction updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Something went wrong" });
    console.log(error);
  }
};