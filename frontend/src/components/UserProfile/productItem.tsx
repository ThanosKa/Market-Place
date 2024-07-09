// components/ProductItem.tsx
import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { colors } from "../../colors/colors";
import { Product } from "../../interfaces/product";
import { BASE_URL } from "../../services/axiosConfig";

type Props = {
  product: Product;
  onLikeToggle: (productId: string) => void;
  isDisabled: boolean;
};

const ProductItem: React.FC<Props> = ({
  product,
  onLikeToggle,
  isDisabled,
}) => {
  const imageUrl =
    product.images.length > 0 ? `${BASE_URL}${product.images[0]}` : undefined;

  return (
    <View style={styles.productItem}>
      {imageUrl && (
        <Image source={{ uri: imageUrl }} style={styles.productImage} />
      )}
      <Text style={styles.productTitle} numberOfLines={2}>
        {product.title}
      </Text>
      <View style={styles.productFooter}>
        <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
        <TouchableOpacity
          onPress={() => onLikeToggle(product._id)}
          disabled={isDisabled}
        >
          <AntDesign
            name={product.likes.length > 0 ? "heart" : "hearto"}
            size={18}
            color={product.likes.length > 0 ? "red" : "black"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  productItem: {
    width: "48%",
    marginBottom: 16,
  },
  productImage: {
    width: "100%",
    height: 180,
    borderRadius: 8,
  },
  productTitle: {
    fontSize: 14,
    marginTop: 8,
    color: colors.primary,
  },
  productFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
  },
});

export default ProductItem;
