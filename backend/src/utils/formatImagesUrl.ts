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
  return {
    ...user.toObject(),
    profilePicture: user.profilePicture
      ? filePathToUrl(user.profilePicture, API_BASE_URL)
      : null,
  };
};

export const formatProductData = (productOrProducts: any) => {
  const formatSingleProduct = (product: any) => {
    const formattedProduct = {
      ...product.toObject(),
      images: product.images.map((image: string) =>
        filePathToUrl(image, API_BASE_URL)
      ),
    };

    if (product.seller) {
      formattedProduct.seller = formatUser(product.seller);
    }

    if (product.sold && product.sold.to) {
      formattedProduct.sold = {
        ...product.sold,
        to: formatUser(product.sold.to),
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
