import express from "express";
const router = express.Router();
import { AddProduct, AllProducts, SingleProduct, Social, AddProductToCart} from "../Controllers/product.js";

router.post("/AddProduct", AddProduct);
router.post("/AddProductToCart", AddProductToCart);
router.get("/AllProducts", AllProducts); 
router.get("/SingleProduct/:id", SingleProduct); 
router.put("/Social/:id", Social);

export default router;