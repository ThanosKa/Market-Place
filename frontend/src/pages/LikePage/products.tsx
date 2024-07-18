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

type Props = {
  userData: any;
  queryClient: any;
};

const RenderLikedProducts: React.FC<Props> = ({ userData, queryClient }) => {
  const { t } = useTranslation();
  const [removingProducts, setRemovingProducts] = useState<string[]>([]);
  const fadeAnims = useRef<{ [key: string]: Animated.Value }>({});

  const toggleProductLikeMutation = useMutation(toggleLikeProduct, {
    onSuccess: () => {
      queryClient.invalidateQueries("loggedUser");
    },
  });

  const handleToggleProductLike = useCallback(
    (productId: string) => {
      if (!userData?.data?.user) return;

      setRemovingProducts((prev) => [...prev, productId]);
      if (!fadeAnims.current[productId]) {
        fadeAnims.current[productId] = new Animated.Value(1);
      }
      Animated.timing(fadeAnims.current[productId], {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        queryClient.setQueryData("loggedUser", (oldData: any) => {
          if (!oldData || !oldData.data || !oldData.data.user) {
            return oldData;
          }
          return {
            ...oldData,
            data: {
              ...oldData.data,
              user: {
                ...oldData.data.user,
                likedProducts: oldData.data.user.likedProducts.filter(
                  (p: Product) => p._id !== productId
                ),
              },
            },
          };
        });

        setRemovingProducts((prev) => prev.filter((id) => id !== productId));
      });

      toggleProductLikeMutation.mutate(productId, {
        onError: () => {
          setRemovingProducts((prev) => prev.filter((id) => id !== productId));
          if (fadeAnims.current[productId]) {
            fadeAnims.current[productId].setValue(1);
          }
          queryClient.invalidateQueries("loggedUser");
        },
      });
    },
    [toggleProductLikeMutation, queryClient, userData]
  );

  const renderProductItem = useCallback(
    ({ item }: { item: Product }) => {
      const isLiked =
        item.likes?.includes(userData?.data?.user?.id || "") || false;
      const isRemoving = removingProducts.includes(item._id);

      if (!fadeAnims.current[item._id]) {
        fadeAnims.current[item._id] = new Animated.Value(1);
      }

      return (
        <Animated.View
          style={[styles.productItem, { opacity: fadeAnims.current[item._id] }]}
        >
          <Image
            source={{ uri: `${BASE_URL}${item.images[0]}` }}
            style={styles.productImage}
          />
          <View style={styles.productInfo}>
            <Text style={styles.productPrice}>${item.price}</Text>
            <TouchableOpacity
              onPress={() => handleToggleProductLike(item._id)}
              disabled={isRemoving}
            >
              <AntDesign
                name={isLiked ? "heart" : "hearto"}
                size={18}
                color={isLiked ? "red" : "black"}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.productTitle} numberOfLines={1}>
            {item.title}
          </Text>
        </Animated.View>
      );
    },
    [userData, handleToggleProductLike, removingProducts]
  );

  const likedProducts = userData?.data?.user?.likedProducts || [];

  return likedProducts.length > 0 ? (
    <FlatList
      data={likedProducts}
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
