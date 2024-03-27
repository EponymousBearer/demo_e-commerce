import mongoose from "mongoose"

const productSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  price: {
    type: String,
  },
  image: {
    type: String,
  },
  reaction: {
    type: String,
  },
});

const Product = mongoose.model("Product", productSchema);
export default Product