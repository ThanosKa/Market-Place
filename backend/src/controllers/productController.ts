import { Request, Response } from "express";
import mongoose from "mongoose";

import Product, {
  IProduct,
  CATEGORY_TYPES,
  CONDITION_TYPES,
} from "../models/Product";
import User from "../models/User";

// Create a new product
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { title, price, category, condition } = req.body;
    const sellerId = (req as any).userId;

    // Check if all required fields are present
    if (!title || !price || !category || !condition) {
      return res.status(400).json({
        success: 0,
        message: "All fields (title, price, category, condition) are required",
        data: null,
      });
    }

    // Validate category
    if (!CATEGORY_TYPES.includes(category)) {
      return res.status(400).json({
        success: 0,
        message: `Invalid category. Valid categories are: ${CATEGORY_TYPES.join(
          ", "
        )}`,
        data: null,
      });
    }

    // Validate condition
    if (!CONDITION_TYPES.includes(condition)) {
      return res.status(400).json({
        success: 0,
        message: `Invalid condition. Valid conditions are: ${CONDITION_TYPES.join(
          ", "
        )}`,
        data: null,
      });
    }

    // Check if at least one image is provided
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({
        success: 0,
        message: "At least one image is required",
        data: null,
      });
    }

    let images: string[] = (req.files as Express.Multer.File[]).map(
      (file) => `/uploads/${file.filename}`
    );

    const newProduct = new Product({
      title,
      price,
      images,
      category,
      condition,
      seller: sellerId,
    });

    await newProduct.save();

    // Update the user's products array
    await User.findByIdAndUpdate(sellerId, {
      $push: { products: newProduct._id },
    });

    res.status(201).json({
      success: 1,
      message: "Product created successfully",
      data: { product: newProduct },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: 0, message: "Server error", data: null });
  }
};
// Get all products with filters
export const getProducts = async (req: Request, res: Response) => {
  try {
    const {
      search,
      category,
      condition,
      minPrice,
      maxPrice,
      sort = "createdAt",
      order = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    const filter: mongoose.FilterQuery<IProduct> = {};

    if (typeof search === "string") {
      filter.title = { $regex: search, $options: "i" };
    }
    if (category) {
      // Handle multiple categories
      filter.category = {
        $in: Array.isArray(category) ? category : [category],
      };
    }
    if (typeof condition === "string") {
      filter.condition = condition;
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort({ [sort as string]: order as mongoose.SortOrder })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate("seller", "firstName lastName email profilePicture");

    res.json({
      success: 1,
      message: "Products retrieved successfully",
      data: { products, total, page: Number(page), limit: Number(limit) },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: 0, message: "Server error", data: null });
  }
};

// Get a product by ID
export const getProductById = async (req: Request, res: Response) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findById(productId).populate(
      "seller",
      "firstName lastName email profilePicture"
    );

    if (!product) {
      return res
        .status(404)
        .json({ success: 0, message: "Product not found", data: null });
    }

    res.json({
      success: 1,
      message: "Product retrieved successfully",
      data: { product },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: 0, message: "Server error", data: null });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const productId = req.params.productId;
    const userId = (req as any).userId;
    const { title, price, category, condition } = req.body;

    const product = await Product.findOne({
      _id: productId,
      seller: userId,
    });

    if (!product) {
      return res.status(404).json({
        success: 0,
        message: "Product not found or you're not authorized to update it",
        data: null,
      });
    }

    if (title) product.title = title;
    if (price) product.price = price;
    if (category) {
      if (!CATEGORY_TYPES.includes(category)) {
        return res.status(400).json({
          success: 0,
          message: "Invalid category",
          data: null,
        });
      }
      product.category = category;
    }
    if (condition) {
      if (!CONDITION_TYPES.includes(condition)) {
        return res.status(400).json({
          success: 0,
          message: "Invalid condition",
          data: null,
        });
      }
      product.condition = condition;
    }

    if (req.files && Array.isArray(req.files)) {
      const newImages = (req.files as Express.Multer.File[]).map(
        (file) => `/uploads/${file.filename}`
      );
      product.images = [...product.images, ...newImages];
    }

    await product.save();

    res.json({
      success: 1,
      message: "Product updated successfully",
      data: { product },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: 0, message: "Server error", data: null });
  }
};

// Delete a product
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const productId = req.params.productId;
    const userId = (req as any).userId;

    const product = await Product.findOneAndDelete({
      _id: productId,
      seller: userId,
    });

    if (!product) {
      return res.status(404).json({
        success: 0,
        message: "Product not found or you're not authorized to delete it",
        data: null,
      });
    }

    res.json({
      success: 1,
      message: "Product deleted successfully",
      data: null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: 0, message: "Server error", data: null });
  }
};

export const getUserProducts = async (req: Request, res: Response) => {
  try {
    const {
      search,
      category,
      condition,
      minPrice,
      maxPrice,
      sort = "createdAt",
      order = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    const userId = new mongoose.Types.ObjectId((req as any).userId);

    const productFilter: mongoose.FilterQuery<IProduct> = { seller: userId };

    if (typeof search === "string") {
      productFilter.title = { $regex: search, $options: "i" };
    }
    if (category) {
      productFilter.category = {
        $in: Array.isArray(category) ? category : [category],
      };
    }
    if (typeof condition === "string") {
      productFilter.condition = condition;
    }
    if (minPrice || maxPrice) {
      productFilter.price = {};
      if (minPrice) productFilter.price.$gte = Number(minPrice);
      if (maxPrice) productFilter.price.$lte = Number(maxPrice);
    }

    const user = await User.findById(userId)
      .select("-password")
      .populate({
        path: "products",
        match: productFilter,
        options: {
          sort: { [sort as string]: order as mongoose.SortOrder },
          skip: (Number(page) - 1) * Number(limit),
          limit: Number(limit),
        },
        model: Product,
      });

    if (!user) {
      return res.status(404).json({
        success: 0,
        message: "User not found",
        data: null,
      });
    }

    const totalProducts = await Product.countDocuments({
      seller: userId,
      ...productFilter,
    });

    res.json({
      success: 1,
      message: "User products retrieved successfully",
      data: {
        products: user.products,
        page: Number(page),
        limit: Number(limit),
        totalProducts,
        totalPages: Math.ceil(totalProducts / Number(limit)),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: 0,
      message: "Server error",
      data: null,
    });
  }
};
export const getUserByIdProducts = async (req: Request, res: Response) => {
  try {
    const {
      search,
      category,
      condition,
      minPrice,
      maxPrice,
      sort = "createdAt",
      order = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    const userId = new mongoose.Types.ObjectId(req.params.id);
    const productFilter: mongoose.FilterQuery<IProduct> = { seller: userId };

    if (typeof search === "string") {
      productFilter.title = { $regex: search, $options: "i" };
    }
    if (category) {
      productFilter.category = {
        $in: Array.isArray(category) ? category : [category],
      };
    }
    if (typeof condition === "string") {
      productFilter.condition = condition;
    }
    if (minPrice || maxPrice) {
      productFilter.price = {};
      if (minPrice) productFilter.price.$gte = Number(minPrice);
      if (maxPrice) productFilter.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(productFilter)
      .sort({ [sort as string]: order as mongoose.SortOrder })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const totalProducts = await Product.countDocuments(productFilter);

    res.json({
      success: 1,
      message: "User products retrieved successfully",
      data: {
        products,
        page: Number(page),
        limit: Number(limit),
        totalProducts,
        totalPages: Math.ceil(totalProducts / Number(limit)),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: 0,
      message: "Server error",
      data: null,
    });
  }
};
