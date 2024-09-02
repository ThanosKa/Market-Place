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
    const { title, category, condition, description } = req.body;
    const price = parseFloat(req.body.price);
    const sellerId = (req as any).userId;

    // Input validation
    if (!title || isNaN(price) || !category || !condition) {
      return res.status(400).json({
        success: false,
        message: "All fields (title, price, category, condition) are required",
        data: null,
      });
    }

    if (price < 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a non-negative number",
        data: null,
      });
    }

    if (!CATEGORY_TYPES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Valid categories are: ${CATEGORY_TYPES.join(
          ", "
        )}`,
        data: null,
      });
    }

    if (!CONDITION_TYPES.includes(condition)) {
      return res.status(400).json({
        success: false,
        message: `Invalid condition. Valid conditions are: ${CONDITION_TYPES.join(
          ", "
        )}`,
        data: null,
      });
    }

    // Handle file uploads
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one image is required",
        data: null,
      });
    }

    const images: string[] = files.map((file) => `/uploads/${file.filename}`);

    // Create new product
    const newProduct: IProduct = new Product({
      title,
      price,
      images,
      category,
      condition,
      seller: sellerId,
      description,
      sold: null, // Initialize sold to null
    });

    await newProduct.save();

    // Update user's products array
    await User.findByIdAndUpdate(sellerId, {
      $push: { products: newProduct._id },
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: { product: newProduct },
    });
  } catch (err) {
    console.error("Error in createProduct:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while creating the product",
      data: null,
    });
  }
};
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const productId = req.params.productId;
    const userId = (req as any).userId;
    const { title, price, category, condition, description } = req.body;

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

    if (product.sold) {
      return res.status(400).json({
        success: 0,
        message: "Cannot update a sold product",
        data: null,
      });
    }

    if (title) product.title = title;
    if (price !== undefined) {
      if (typeof price !== "number" || price < 0) {
        return res.status(400).json({
          success: 0,
          message: "Price must be a non-negative number",
          data: null,
        });
      }
      product.price = price;
    }
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
    if (description !== undefined) product.description = description;

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
// Get a product by ID
// export const getProductById = async (req: Request, res: Response) => {
//   try {
//     const productId = req.params.productId;
//     const product = await Product.findById(productId).populate(
//       "seller",
//       "firstName lastName email profilePicture"
//     );

//     if (!product) {
//       return res
//         .status(404)
//         .json({ success: 0, message: "Product not found", data: null });
//     }

//     // Include sold information if the product is sold
//     if (product.sold) {
//       product.sold = {
//         to: {
//           _id: product.sold.to._id,
//           firstName: product.sold.to.firstName,
//           lastName: product.sold.to.lastName,
//           profilePicture: product.sold.to.profilePicture,
//         },
//         date: product.sold.date,
//       };
//     }

//     res.json({
//       success: 1,
//       message: "Product retrieved successfully",
//       data: { product },
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: 0, message: "Server error", data: null });
//   }
// };

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

    const filter: mongoose.FilterQuery<IProduct> = { sold: null };

    if (typeof search === "string") {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (category) {
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
      data: {
        products,
        total,
        page: Number(page),
        limit: Number(limit),
      },
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

    const productFilter: mongoose.FilterQuery<IProduct> = {
      seller: userId,
      sold: null,
    };

    if (typeof search === "string") {
      productFilter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
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
    const productFilter: mongoose.FilterQuery<IProduct> = {
      seller: userId,
      sold: null,
    };

    if (typeof search === "string") {
      productFilter.title = { $regex: search, $options: "i" };
    }
    if (category) {
      productFilter.category = {
        $in: Array.isArray(category) ? category : [category],
      };
    }
    if (typeof search === "string") {
      productFilter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
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

export const purchaseProduct = async (req: Request, res: Response) => {
  try {
    const productId = req.params.productId;
    const buyerId = new mongoose.Types.ObjectId((req as any).userId);

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        data: null,
      });
    }

    if (product.sold) {
      return res.status(400).json({
        success: false,
        message: "This product has already been sold",
        data: null,
      });
    }

    const buyer = await User.findById(buyerId).select(
      "firstName lastName profilePicture"
    );
    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: "Buyer not found",
        data: null,
      });
    }

    product.sold = {
      to: {
        _id: buyer._id as mongoose.Types.ObjectId,
        firstName: buyer.firstName,
        lastName: buyer.lastName,
        profilePicture: buyer.profilePicture || "",
      },
      date: new Date(),
    };

    await product.save();

    res.json({
      success: true,
      message: "Product purchased successfully",
      data: { product },
    });
  } catch (err) {
    console.error("Error in purchaseProduct:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while purchasing the product",
      data: null,
    });
  }
};

export const getSoldUserProducts = async (req: Request, res: Response) => {
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

    const productFilter: mongoose.FilterQuery<IProduct> = {
      seller: userId,
      sold: { $ne: null },
    };

    if (typeof search === "string") {
      productFilter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
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

    const totalProducts = await Product.countDocuments(productFilter);

    const products = await Product.find(productFilter)
      .sort({ [sort as string]: order as mongoose.SortOrder })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate("seller", "firstName lastName email profilePicture")
      .populate("sold.to", "firstName lastName profilePicture");

    res.json({
      success: 1,
      message: "User sold products retrieved successfully",
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

export const getSoldUserByIdProducts = async (req: Request, res: Response) => {
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
    const productFilter: mongoose.FilterQuery<IProduct> = {
      seller: userId,
      sold: { $ne: null },
    };

    if (typeof search === "string") {
      productFilter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
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

    const totalProducts = await Product.countDocuments(productFilter);

    const products = await Product.find(productFilter)
      .sort({ [sort as string]: order as mongoose.SortOrder })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate("seller", "firstName lastName email profilePicture")
      .populate("sold.to", "firstName lastName profilePicture");

    res.json({
      success: 1,
      message: "User sold products retrieved successfully",
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

export const getProductById = async (req: Request, res: Response) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findById(productId)
      .populate("seller", "firstName lastName email profilePicture")
      .populate("sold.to", "firstName lastName profilePicture");

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
