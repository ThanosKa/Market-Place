import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Animated,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useMutation } from "react-query";
import { useTranslation } from "react-i18next";
import { Product } from "../../interfaces/product";
import { toggleLikeProduct } from "../../services/likes";
import { BASE_URL } from "../../services/axiosConfig";
import { colors } from "../../colors/colors";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import { MainStackParamList } from "../../interfaces/auth/navigation";

type Props = {
  likedProductsData: Product[] | undefined;
  queryClient: any;
};

const RenderLikedProducts: React.FC<Props> = ({
  likedProductsData,
  queryClient,
}) => {
  const { t } = useTranslation();
  const [removingProducts, setRemovingProducts] = useState<string[]>([]);
  const fadeAnims = useRef<{ [key: string]: Animated.Value }>({});
  const navigation = useNavigation<StackNavigationProp<MainStackParamList>>();
  const toggleProductLikeMutation = useMutation(toggleLikeProduct, {
    onSuccess: () => {
      queryClient.invalidateQueries("likedProducts");
    },
  });
  const handleProductPress = useCallback(
    (productId: string) => {
      navigation.navigate("Product", { productId });
    },
    [navigation]
  );
  const handleToggleProductLike = useCallback(
    (productId: string) => {
      setRemovingProducts((prev) => [...prev, productId]);
      if (!fadeAnims.current[productId]) {
        fadeAnims.current[productId] = new Animated.Value(1);
      }
      Animated.timing(fadeAnims.current[productId], {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        queryClient.setQueryData("likedProducts", (oldData: Product[]) => {
          return oldData.filter((p) => p._id !== productId);
        });

        setRemovingProducts((prev) => prev.filter((id) => id !== productId));
      });

      toggleProductLikeMutation.mutate(productId, {
        onError: () => {
          setRemovingProducts((prev) => prev.filter((id) => id !== productId));
          if (fadeAnims.current[productId]) {
            fadeAnims.current[productId].setValue(1);
          }
          queryClient.invalidateQueries("likedProducts");
        },
      });
    },
    [toggleProductLikeMutation, queryClient]
  );

  const renderProductItem = useCallback(
    ({ item }: { item: Product }) => {
      const isRemoving = removingProducts.includes(item._id);

      if (!fadeAnims.current[item._id]) {
        fadeAnims.current[item._id] = new Animated.Value(1);
      }

      return (
        <Animated.View
          style={[styles.productItem, { opacity: fadeAnims.current[item._id] }]}
        >
          <TouchableOpacity onPress={() => handleProductPress(item._id)}>
            <Image
              source={{ uri: `${item.images[0]}` }}
              style={styles.productImage}
            />
          </TouchableOpacity>
          <View style={styles.productInfo}>
            <Text style={styles.productPrice}>${item.price}</Text>
            <TouchableOpacity
              onPress={() => handleToggleProductLike(item._id)}
              disabled={isRemoving}
            >
              <AntDesign name="heart" size={18} color="red" />
            </TouchableOpacity>
          </View>
          <Text style={styles.productTitle} numberOfLines={1}>
            {item.title}
          </Text>
        </Animated.View>
      );
    },
    [handleToggleProductLike, removingProducts]
  );

  return likedProductsData && likedProductsData.length > 0 ? (
    <FlatList
      data={likedProductsData}
      renderItem={renderProductItem}
      keyExtractor={(item) => item._id}
      numColumns={2}
      columnWrapperStyle={styles.productRow}
    />
  ) : (
    <Text style={styles.emptyMessage}>{t("noLikedProducts")}</Text>
  );
};

const styles = StyleSheet.create({
  productRow: {
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  productItem: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3,
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    aspectRatio: 1,
    resizeMode: "cover",
  },
  productInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 5,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
  },
  productTitle: {
    fontSize: 14,
    paddingHorizontal: 5,
    paddingBottom: 5,
  },
  emptyMessage: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
    color: colors.secondary,
    padding: 20,
  },
});

export default RenderLikedProducts;
