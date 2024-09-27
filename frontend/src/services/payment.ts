import axiosInstance from "./axiosConfig";

export const purchaseProduct = async (productId: string): Promise<any> => {
  const response = await axiosInstance.post(`/products/${productId}/purchase`);
  return response.data;
};

export const purchaseInPersonRequest = async (
  productId: string
): Promise<any> => {
  const response = await axiosInstance.post(
    `/products/${productId}/purchase-request`
  );
  return response.data;
};

export const acceptPurchaseRequest = async (
  productId: string
): Promise<any> => {
  const response = await axiosInstance.post(
    `/products/${productId}/accept-purchase-request`
  );
  return response.data;
};

export const cancelPurchaseRequest = async (
  productId: string
): Promise<any> => {
  const response = await axiosInstance.post(
    `/products/${productId}/cancel-purchase-request`
  );
  return response.data;
};
