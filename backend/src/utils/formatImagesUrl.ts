import mongoose from "mongoose";
import { API_BASE_URL } from "../server";
import { filePathToUrl } from "./filterToUrl";

export const formatProductImages = (product: any) => {
  if (!product) return null;
  const productObject = product.toObject ? product.toObject() : product;
  return {
    ...productObject,
    images:
      productObject.images?.map((image: string | null) =>
        image ? filePathToUrl(image, API_BASE_URL) : null
      ) || [],
  };
};

export const formatUser = (user: any) => {
  if (!user) return null;
  if (typeof user === "string" || user instanceof mongoose.Types.ObjectId) {
    return user.toString(); // Return the ID if the user field is not populated
  }
  const userObject = user.toObject ? user.toObject() : user;
  return {
    _id: userObject._id,
    firstName: userObject.firstName || null,
    lastName: userObject.lastName || null,
    email: userObject.email || null,
    profilePicture: userObject.profilePicture
      ? filePathToUrl(userObject.profilePicture, API_BASE_URL)
      : null,
  };
};

export const formatProductData = (productOrProducts: any) => {
  if (!productOrProducts) return null;

  const formatSingleProduct = (product: any) => {
    if (!product) return null;
    const productObject = product.toObject ? product.toObject() : product;
    const formattedProduct: any = {
      ...productObject,
      images:
        productObject.images?.map((image: string | null) =>
          image ? filePathToUrl(image, API_BASE_URL) : null
        ) || [],
    };

    if (productObject.seller) {
      formattedProduct.seller = formatUser(productObject.seller);
    }

    if (productObject.sold && productObject.sold.to) {
      formattedProduct.sold = {
        ...productObject.sold,
        to: formatUser(productObject.sold.to),
      };
    }

    return formattedProduct;
  };

  if (Array.isArray(productOrProducts)) {
    return productOrProducts.map(formatSingleProduct).filter(Boolean);
  } else {
    return formatSingleProduct(productOrProducts);
  }
};

export const formatChatMessage = (message: any) => {
  if (!message) return null;
  const messageObject = message.toObject ? message.toObject() : message;
  return {
    ...messageObject,
    images: messageObject.images
      ? messageObject.images.map((image: string | null) =>
          image ? filePathToUrl(image, API_BASE_URL) : null
        )
      : [],
    sender: formatUser(messageObject.sender),
  };
};

export const formatChat = (chat: any) => {
  if (!chat) return null;
  const chatObject = chat.toObject ? chat.toObject() : chat;
  return {
    ...chatObject,
    participants:
      chatObject.participants?.map(formatUser).filter(Boolean) || [],
    messages: chatObject.messages?.map(formatChatMessage).filter(Boolean) || [],
    otherParticipant: formatUser(chatObject.otherParticipant),
  };
};
