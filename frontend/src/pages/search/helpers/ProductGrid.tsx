import React, { useRef } from "react";
import {
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  View,
} from "react-native";
import { Product } from "../../../interfaces/product";
import { colors } from "../../../colors/colors";
import { useNavigation, useScrollToTop } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "../../../interfaces/auth/navigation";

interface ProductGridProps {
  products: Product[];
  refreshControl?: React.ReactElement;
  loadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  refreshControl,
  loadMore,
  hasMore,
  isLoadingMore,
}) => {
  const navigation = useNavigation<StackNavigationProp<MainStackParamList>>();
  const flatListRef = useRef(null);
  useScrollToTop(flatListRef);

  const handleClickProduct = (product: Product) => {
    navigation.navigate("Product", { productId: product._id });
  };

  const renderProductGrid = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.gridItemContainer}
      onPress={() => handleClickProduct(item)}
    >
      <Image
        source={{
          uri: item.images.length > 0 ? `${item.images[0]}` : undefined,
        }}
        style={styles.gridImage}
      />
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerContainer}>
        <ActivityIndicator size="small" color={colors.secondary} />
      </View>
    );
  };

  return (
    <FlatList
      ref={flatListRef}
      data={products}
      renderItem={renderProductGrid}
      keyExtractor={(item) => item._id}
      numColumns={3}
      style={styles.productGrid}
      refreshControl={refreshControl}
      onEndReached={() => {
        if (hasMore) {
          loadMore();
        }
      }}
      onEndReachedThreshold={0.1}
      ListFooterComponent={renderFooter}
    />
  );
};

const styles = StyleSheet.create({
  productGrid: {
    flex: 1,
  },
  gridItemContainer: {
    width: "33.33%",
    aspectRatio: 1,
    padding: 0.5,
    backgroundColor: "#fff",
  },
  gridImage: {
    flex: 1,
    backgroundColor: "#e0e0e0",
  },
  footerContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
});

export default ProductGrid;
