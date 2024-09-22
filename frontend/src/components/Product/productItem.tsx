// components/ProductItem.tsx
// components/ProductItem.tsx
import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { colors } from "../../colors/colors";
import { Product } from "../../interfaces/product";
import { BASE_URL } from "../../services/axiosConfig";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "../../interfaces/auth/navigation";

type Props = {
  product: Product;
  onLikeToggle: (productId: string) => Promise<void>;
  isLiked: boolean; // Add this prop
  productId: string;
};

const ProductItem: React.FC<Props> = ({
  product,
  onLikeToggle,
  productId,
  isLiked: initialIsLiked,
}) => {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<StackNavigationProp<MainStackParamList>>();

  useEffect(() => {
    setIsLiked(initialIsLiked);
  }, [initialIsLiked]);

  const imageUrl =
    product.images.length > 0 ? `${product.images[0]}` : undefined;

  const handleLikeToggle = async () => {
    setIsLoading(true);
    setIsLiked(!isLiked); // Immediately update UI

    try {
      await onLikeToggle(product._id);
    } catch (error) {
      // If the API call fails, revert the UI change
      setIsLiked(isLiked);
      console.error("Failed to toggle like:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductPress = () => {
    navigation.navigate("Product", { productId });
  };
  return (
    <View style={styles.productItem}>
      <TouchableOpacity onPress={handleProductPress}>
        {imageUrl && (
          <Image source={{ uri: imageUrl }} style={styles.productImage} />
        )}
      </TouchableOpacity>
      <Text style={styles.productTitle} numberOfLines={2}>
        {product.title}
      </Text>
      <View style={styles.productFooter}>
        <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
        <TouchableOpacity
          onPress={handleLikeToggle}
          disabled={isLoading}
          style={styles.likeButton}
        >
          <AntDesign
            name={isLiked ? "heart" : "hearto"}
            size={18}
            color={isLiked ? "red" : "black"}
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
  likeButton: {
    opacity: 1,
  },
});

export default ProductItem;
