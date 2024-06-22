// components/ProductGrid/ProductGrid.tsx
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import ProductCard from "../ProductCard/productCard";
import { useTranslation } from "react-i18next";

// Mock data
const mockProducts = [
  {
    id: "1",
    userImage: "https://randomuser.me/api/portraits/men/1.jpg",
    userName: "John Doe",
    productImage: "https://via.placeholder.com/160x180",
    title: "Product 1",
    price: "$99.99",
    condition: "New",
  },
  {
    id: "2",
    userImage: "https://randomuser.me/api/portraits/men/1.jpg",
    userName: "John Doe",
    productImage: "https://via.placeholder.com/160x180",
    title: "Product 1",
    price: "$99.99",
    condition: "New",
  },
  {
    id: "3",
    userImage: "https://randomuser.me/api/portraits/men/1.jpg",
    userName: "John Doe",
    productImage: "https://via.placeholder.com/160x180",
    title: "Product 1",
    price: "$99.99",
    condition: "New",
  },
  // ... Add more mock products
];

const ProductGrid: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedProducts, setLikedProducts] = useState<string[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProducts(mockProducts);
      setLoading(false);
    }, 2000);
  }, []);

  const toggleLike = (productId: string) => {
    setLikedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const renderProduct = ({ item }: { item: any }) => (
    <ProductCard
      {...item}
      isLiked={likedProducts.includes(item.id)}
      onLikeToggle={() => toggleLike(item.id)}
    />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("your-daily-picks")}</Text>
      <View style={styles.gridContainer}>
        {products.map((product) => (
          <View key={product.id} style={styles.productWrapper}>
            {renderProduct({ item: product })}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  productWrapper: {
    width: "48%",
    marginBottom: 10,
  },
  row: {
    justifyContent: "space-between",
  },
});

export default ProductGrid;
