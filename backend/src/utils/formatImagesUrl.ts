import mongoose from "mongoose";
import { API_BASE_URL } from "../server";
import { filePathToUrl } from "./filterToUrl";

export const formatProductImages = (product: any) => {
  return {
    ...product.toObject(),
    images: product.images.map((image: string) =>
      filePathToUrl(image, API_BASE_URL)
    ),
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
    firstName: userObject.firstName,
    lastName: userObject.lastName,
    email: userObject.email,
    profilePicture: userObject.profilePicture
      ? filePathToUrl(userObject.profilePicture, API_BASE_URL)
      : null,
  };
};

export const formatProductData = (productOrProducts: any) => {
  const formatSingleProduct = (product: any) => {
    const productObject = product.toObject ? product.toObject() : product;
    const formattedProduct = {
      ...productObject,
      images: productObject.images.map((image: string) =>
        filePathToUrl(image, API_BASE_URL)
      ),
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
    return productOrProducts.map(formatSingleProduct);
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
      ? messageObject.images.map((image: string) =>
          filePathToUrl(image, API_BASE_URL)
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
    participants: chatObject.participants.map(formatUser),
    messages: chatObject.messages.map(formatChatMessage),
    otherParticipant: formatUser(chatObject.otherParticipant),
  };
};
