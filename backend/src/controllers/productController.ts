import { Request, Response } from "express";
import mongoose from "mongoose";

import Product, {
  IProduct,
  CATEGORY_TYPES,
  CONDITION_TYPES,
} from "../models/Product";
import User from "../models/User";
import { createActivity } from "./activityController";

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

    // Validate sort parameter
    const validSortFields = ["price", "createdAt"];
    if (!validSortFields.includes(sort as string)) {
      return res.status(400).json({
        success: 0,
        message: `Invalid sort parameter. Valid options are: ${validSortFields.join(
          ", "
        )}`,
        data: null,
      });
    }

    // Validate order parameter
    const validOrderValues = [
      "asc",
      "desc",
      "ascending",
      "descending",
      "1",
      "-1",
    ];
    if (!validOrderValues.includes(order as string)) {
      return res.status(400).json({
        success: 0,
        message: `Invalid order parameter. Valid options are: ${validOrderValues.join(
          ", "
        )}`,
        data: null,
      });
    }

    const filter: mongoose.FilterQuery<IProduct> = { sold: null };

    // Validate and process category
    if (category) {
      const categories = Array.isArray(category) ? category : [category];
      const invalidCategories = categories.filter(
        (cat) => !CATEGORY_TYPES.includes(cat as any)
      );
      if (invalidCategories.length > 0) {
        return res.status(400).json({
          success: 0,
          message: `Invalid categories: ${invalidCategories.join(
            ", "
          )}. Correct categories are: ${CATEGORY_TYPES.join(", ")}`,
          data: null,
        });
      }
      filter.category = { $in: categories };
    }

    // Validate and process condition
    if (condition) {
      const conditions = Array.isArray(condition) ? condition : [condition];
      const invalidConditions = conditions.filter(
        (cond) => !CONDITION_TYPES.includes(cond as any)
      );
      if (invalidConditions.length > 0) {
        return res.status(400).json({
          success: 0,
          message: `Invalid conditions: ${invalidConditions.join(
            ", "
          )}. Correct conditions are: ${CONDITION_TYPES.join(", ")}`,
          data: null,
        });
      }
      filter.condition = { $in: conditions };
    }

    if (typeof search === "string") {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
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
        sort,
        order,
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

    // Validate sort parameter
    const validSortFields = ["price", "createdAt"];
    if (!validSortFields.includes(sort as string)) {
      return res.status(400).json({
        success: 0,
        message: `Invalid sort parameter. Valid options are: ${validSortFields.join(
          ", "
        )}`,
        data: null,
      });
    }

    // Validate order parameter
    const validOrderValues = [
      "asc",
      "desc",
      "ascending",
      "descending",
      "1",
      "-1",
    ];
    if (!validOrderValues.includes(order as string)) {
      return res.status(400).json({
        success: 0,
        message: `Invalid order parameter. Valid options are: ${validOrderValues.join(
          ", "
        )}`,
        data: null,
      });
    }

    const filter: mongoose.FilterQuery<IProduct> = {
      seller: userId,
      sold: null,
    };

    // Validate and process category
    if (category) {
      const categories = Array.isArray(category) ? category : [category];
      const invalidCategories = categories.filter(
        (cat) => !CATEGORY_TYPES.includes(cat as any)
      );
      if (invalidCategories.length > 0) {
        return res.status(400).json({
          success: 0,
          message: `Invalid categories: ${invalidCategories.join(
            ", "
          )}. Correct categories are: ${CATEGORY_TYPES.join(", ")}`,
          data: null,
        });
      }
      filter.category = { $in: categories };
    }

    // Validate and process condition
    if (condition) {
      const conditions = Array.isArray(condition) ? condition : [condition];
      const invalidConditions = conditions.filter(
        (cond) => !CONDITION_TYPES.includes(cond as any)
      );
      if (invalidConditions.length > 0) {
        return res.status(400).json({
          success: 0,
          message: `Invalid conditions: ${invalidConditions.join(
            ", "
          )}. Correct conditions are: ${CONDITION_TYPES.join(", ")}`,
          data: null,
        });
      }
      filter.condition = { $in: conditions };
    }

    if (typeof search === "string") {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
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
      .limit(Number(limit));

    res.json({
      success: 1,
      message: "User products retrieved successfully",
      data: {
        products,
        total,
        page: Number(page),
        limit: Number(limit),
        sort,
        order,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: 0, message: "Server error", data: null });
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

    // Validate sort parameter
    const validSortFields = ["price", "createdAt"];
    if (!validSortFields.includes(sort as string)) {
      return res.status(400).json({
        success: 0,
        message: `Invalid sort parameter. Valid options are: ${validSortFields.join(
          ", "
        )}`,
        data: null,
      });
    }

    // Validate order parameter
    const validOrderValues = [
      "asc",
      "desc",
      "ascending",
      "descending",
      "1",
      "-1",
    ];
    if (!validOrderValues.includes(order as string)) {
      return res.status(400).json({
        success: 0,
        message: `Invalid order parameter. Valid options are: ${validOrderValues.join(
          ", "
        )}`,
        data: null,
      });
    }

    const filter: mongoose.FilterQuery<IProduct> = {
      seller: userId,
      sold: null,
    };

    // Validate and process category
    if (category) {
      const categories = Array.isArray(category) ? category : [category];
      const invalidCategories = categories.filter(
        (cat) => !CATEGORY_TYPES.includes(cat as any)
      );
      if (invalidCategories.length > 0) {
        return res.status(400).json({
          success: 0,
          message: `Invalid categories: ${invalidCategories.join(
            ", "
          )}. Correct categories are: ${CATEGORY_TYPES.join(", ")}`,
          data: null,
        });
      }
      filter.category = { $in: categories };
    }

    // Validate and process condition
    if (condition) {
      const conditions = Array.isArray(condition) ? condition : [condition];
      const invalidConditions = conditions.filter(
        (cond) => !CONDITION_TYPES.includes(cond as any)
      );
      if (invalidConditions.length > 0) {
        return res.status(400).json({
          success: 0,
          message: `Invalid conditions: ${invalidConditions.join(
            ", "
          )}. Correct conditions are: ${CONDITION_TYPES.join(", ")}`,
          data: null,
        });
      }
      filter.condition = { $in: conditions };
    }

    if (typeof search === "string") {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
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
      .limit(Number(limit));

    res.json({
      success: 1,
      message: "User products retrieved successfully",
      data: {
        products,
        total,
        page: Number(page),
        limit: Number(limit),
        sort,
        order,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: 0, message: "Server error", data: null });
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

export const purchaseProduct = async (req: Request, res: Response) => {
  try {
    const productId = req.params.productId;
    const buyerId = new mongoose.Types.ObjectId((req as any).userId);

    // Fetch the product along with limited seller information
    const product = await Product.findById(productId)
      .populate({
        path: "seller",
        select: "firstName lastName profilePicture _id",
      })
      .select("title price images category condition sold seller");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        data: null,
      });
    }

    // Check if the product has already been sold
    if (product.sold) {
      return res.status(400).json({
        success: false,
        message: "This product has already been sold",
        data: null,
      });
    }

    // Check if the buyer is the owner of the product
    if (product.seller._id.toString() === buyerId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot purchase your own product",
        data: null,
      });
    }

    // Update the sold information in the product
    product.sold = {
      to: buyerId,
      date: new Date(),
    };

    await product.save();

    // Populate buyer information before sending the response
    await product.populate({
      path: "sold.to",
      select: "firstName lastName profilePicture",
    });

    // Create an activity for the seller
    const buyer = await User.findById(buyerId).select("firstName lastName");
    const activityContent = `${buyer!.firstName} ${
      buyer!.lastName
    } has purchased your product "${product.title}".`;
    await createActivity(
      product.seller._id.toString(),
      "product_purchased",
      buyerId.toString(),
      activityContent,
      productId
    );

    res.json({
      success: true,
      message: "Product purchased successfully",
      data: {
        product: {
          _id: product._id,
          title: product.title,
          price: product.price,
          images: product.images,
          category: product.category,
          condition: product.condition,
          seller: product.seller,
          sold: product.sold,
        },
      },
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
      sold: { $ne: null }, // Only sold products
    };

    if (typeof search === "string" && search.trim()) {
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

    const totalSoldProducts = await Product.countDocuments(productFilter);

    const products = await Product.find(productFilter)
      .sort({ [sort as string]: order as mongoose.SortOrder })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate("seller", "firstName lastName profilePicture _id")
      .populate({
        path: "sold.to",
        select: "firstName lastName profilePicture _id",
      });
    res.json({
      success: 1,
      message: "User sold products retrieved successfully",
      data: {
        products,
        page: Number(page),
        limit: Number(limit),
        totalSoldProducts,
        totalPages: Math.ceil(totalSoldProducts / Number(limit)),
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
      sold: { $ne: null }, // Only sold products
    };

    if (typeof search === "string" && search.trim()) {
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

    const totalSoldProducts = await Product.countDocuments(productFilter);

    const products = await Product.find(productFilter)
      .sort({ [sort as string]: order as mongoose.SortOrder })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate("seller", "firstName lastName profilePicture _id")
      .populate({
        path: "sold.to",
        select: "firstName lastName profilePicture _id",
      });

    res.json({
      success: 1,
      message: "Sold products retrieved successfully",
      data: {
        products,
        page: Number(page),
        limit: Number(limit),
        totalSoldProducts,
        totalPages: Math.ceil(totalSoldProducts / Number(limit)),
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

export const getPurchasedProducts = async (req: Request, res: Response) => {
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
      "sold.to": userId,
    };

    if (typeof search === "string" && search.trim()) {
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

    const totalPurchasedProducts = await Product.countDocuments(productFilter);

    const products = await Product.find(productFilter)
      .sort({ [sort as string]: order as mongoose.SortOrder })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate("seller", "firstName lastName profilePicture _id")
      .populate({
        path: "sold.to",
        select: "firstName lastName profilePicture _id",
      });

    res.json({
      success: 1,
      message: "Purchased products retrieved successfully",
      data: {
        products,
        page: Number(page),
        limit: Number(limit),
        totalPurchasedProducts,
        totalPages: Math.ceil(totalPurchasedProducts / Number(limit)),
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

export const getPurchasedProductsByUserId = async (
  req: Request,
  res: Response
) => {
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
      "sold.to": userId,
    };

    if (typeof search === "string" && search.trim()) {
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

    const totalPurchasedProducts = await Product.countDocuments(productFilter);

    const products = await Product.find(productFilter)
      .sort({ [sort as string]: order as mongoose.SortOrder })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate("seller", "firstName lastName profilePicture _id")
      .populate({
        path: "sold.to",
        select: "firstName lastName profilePicture _id",
      });

    res.json({
      success: 1,
      message: "Purchased products retrieved successfully",
      data: {
        products,
        page: Number(page),
        limit: Number(limit),
        totalPurchasedProducts,
        totalPages: Math.ceil(totalPurchasedProducts / Number(limit)),
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
