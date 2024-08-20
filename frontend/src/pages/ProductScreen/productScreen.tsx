import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { MainStackParamList } from "../../interfaces/auth/navigation";
import UndefProfPicture from "../../components/UndefProfPicture/UndefProfPicture";
import { BASE_URL } from "../../services/axiosConfig";
import { colors } from "../../colors/colors";
import { getUserId } from "../../services/authStorage";
import {
  getProductById,
  deleteProduct,
  updateProduct,
} from "../../services/product";
import Swiper from "react-native-swiper";
import { Product } from "../../interfaces/product";
import ImageViewerModal from "../../utils/imageClick";
import { createChat, getUserChats } from "../../services/chat";
import { Feather } from "@expo/vector-icons";
import { useActionSheet } from "@expo/react-native-action-sheet";
import EditProductForm from "./EditProductForm";

type ProductScreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  "Product"
>;
type ProductScreenRouteProp = RouteProp<MainStackParamList, "Product">;

interface ProductScreenProps {
  navigation: ProductScreenNavigationProp;
  route: ProductScreenRouteProp;
}

const { width } = Dimensions.get("window");

const ProductScreen: React.FC<ProductScreenProps> = ({ navigation, route }) => {
  const { productId } = route.params;
  const [isCurrentUserSeller, setIsCurrentUserSeller] = useState(false);
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { showActionSheetWithOptions } = useActionSheet();

  const createChatMutation = useMutation(createChat);
  const deleteProductMutation = useMutation(deleteProduct);
  const updateProductMutation = useMutation(updateProduct);

  const {
    data: product,
    isLoading,
    error,
    refetch,
  } = useQuery<Product>(["product", productId], () =>
    getProductById(productId).then((response) => response.data.product)
  );

  useEffect(() => {
    const checkUserSeller = async () => {
      if (product) {
        const userId = await getUserId();
        setIsCurrentUserSeller(userId === product.seller._id);
      }
    };
    checkUserSeller();
  }, [product]);

  const handleChatPress = useCallback(async () => {
    if (!product) return;
    const existingChats = await getUserChats();
    const existingChat = existingChats.find(
      (chat) => chat.otherParticipant._id === product.seller._id
    );
    if (existingChat) {
      navigation.navigate("Chat", { chatId: existingChat._id });
    } else {
      try {
        const newChat = await createChatMutation.mutateAsync(
          product.seller._id
        );
        if (!newChat || !newChat._id) {
          throw new Error("Failed to create chat");
        }
        navigation.navigate("Chat", { chatId: newChat._id });
      } catch (error) {
        console.error("Error creating chat:", error);
      }
    }
  }, [product, navigation, createChatMutation]);

  const handleUserPress = async (userId: string) => {
    const loggedUserId = await getUserId();
    if (loggedUserId === userId) {
      navigation.navigate("MainTabs");
      navigation.navigate("Profile", {});
    } else {
      navigation.navigate("UserProfile", { userId });
    }
  };

  const handleImagePress = (index: number) => {
    setCurrentImageIndex(index);
    setIsImageViewerVisible(true);
  };

  const closeImageModal = () => {
    setIsImageViewerVisible(false);
  };

  const handleMorePress = () => {
    showActionSheetWithOptions(
      {
        options: [t("edit"), t("delete"), t("cancel")],
        cancelButtonIndex: 2,
        destructiveButtonIndex: 1,
      },
      (buttonIndex) => {
        if (buttonIndex === 0) {
          setIsEditing(true);
        } else if (buttonIndex === 1) {
          handleDelete();
        }
      }
    );
  };

  const handleDelete = () => {
    Alert.alert(
      t("delete-product"),
      t("are-you-sure-you-want-to-delete-this-product"),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("delete"),
          style: "destructive",
          onPress: () => {
            deleteProductMutation.mutate(productId, {
              onSuccess: () => {
                queryClient.invalidateQueries(["product", productId]);
                navigation.goBack();
              },
              onError: (error) => {
                console.error("Error deleting product:", error);
                Alert.alert(t("error"), t("failed-to-delete-product"));
              },
            });
          },
        },
      ]
    );
  };

  const handleSave = (editedProduct: Partial<Product>) => {
    updateProductMutation.mutate(
      { productId, ...editedProduct },
      {
        onSuccess: () => {
          setIsEditing(false);
          refetch();
        },
        onError: (error) => {
          console.error("Error updating product:", error);
          Alert.alert(t("error"), t("failed-to-update-product"));
        },
      }
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="small" color={colors.secondary} />
        <Text style={styles.loadingText}>{t("loading")}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{t("error-loading-the-product")}</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{t("product-not-found")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.imageContainer}>
          <Swiper
            style={styles.imageSwiper}
            showsButtons={false}
            loop={false}
            showsPagination={true}
            paginationStyle={styles.pagination}
          >
            {product.images.map((image, index) => (
              <View key={index} style={styles.imageWrapper}>
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => handleImagePress(index)}
                >
                  <Image
                    source={{ uri: `${BASE_URL}${image}` }}
                    style={styles.productImage}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </Swiper>
          {isCurrentUserSeller && !isEditing && (
            <TouchableOpacity
              style={styles.moreButton}
              onPress={handleMorePress}
            >
              <Feather name="more-vertical" size={24} color="white" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.contentContainer}>
          {isEditing ? (
            <>
              <EditProductForm
                product={product}
                onSave={handleSave}
                onCancel={() => setIsEditing(false)}
              />
            </>
          ) : (
            <>
              <Text style={styles.titleText}>{product.title}</Text>
              <Text style={styles.priceText}>${product.price}</Text>
              {product.description && (
                <Text style={styles.descriptionText}>
                  {product.description}
                </Text>
              )}
              <Text style={styles.conditionText}>{t(product.condition)}</Text>
              <Text style={styles.categoryText}>{t(product.category)}</Text>
              {isCurrentUserSeller && (
                <View style={styles.likesContainer}>
                  <Text style={styles.likesText}>
                    {t("total-likes")}: {product.likes.length}
                  </Text>
                </View>
              )}
              <View style={styles.sellerContainer}>
                {!isCurrentUserSeller && (
                  <>
                    {product.seller.profilePicture ? (
                      <Image
                        source={{
                          uri: `${BASE_URL}/${product.seller.profilePicture}`,
                        }}
                        style={styles.sellerImage}
                      />
                    ) : (
                      <UndefProfPicture size={50} iconSize={25} />
                    )}
                  </>
                )}
                <TouchableOpacity
                  onPress={() => handleUserPress(product.seller._id)}
                >
                  {!isCurrentUserSeller && (
                    <Text style={styles.sellerName}>
                      {product.seller.firstName} {product.seller.lastName}
                    </Text>
                  )}
                </TouchableOpacity>
                {!isCurrentUserSeller && (
                  <TouchableOpacity
                    style={styles.chatButton}
                    onPress={handleChatPress}
                  >
                    <Text style={styles.chatButtonText}>{t("chat")}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {!isCurrentUserSeller && !isEditing && (
        <View style={styles.buyButtonContainer}>
          <TouchableOpacity style={styles.buyButton}>
            <Text style={styles.buyButtonText}>{t("buy")}</Text>
          </TouchableOpacity>
        </View>
      )}

      <ImageViewerModal
        images={product.images}
        isVisible={isImageViewerVisible}
        onClose={closeImageModal}
        initialIndex={currentImageIndex}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.primary,
  },
  errorText: {
    fontSize: 18,
    color: colors.danger,
    textAlign: "center",
  },
  imageContainer: {
    height: 300,
  },
  imageSwiper: {
    height: 300,
  },
  imageWrapper: {
    width: Dimensions.get("window").width,
    height: 300,
  },
  productImage: {
    width: "100%",
    height: 300,
    resizeMode: "cover",
  },
  pagination: {
    bottom: -30,
  },
  moreButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 20,
    padding: 8,
  },
  contentContainer: {
    padding: 20,
    marginTop: 20,
    gap: 12,
  },
  titleText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  priceText: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.primary,
  },
  descriptionText: {
    fontSize: 16,
    color: colors.primary,
  },
  conditionText: {
    fontSize: 16,
  },
  categoryText: {
    fontSize: 16,
    color: colors.secondary,
  },
  likesContainer: {
    marginBottom: 20,
  },
  likesText: {
    fontSize: 16,
    color: colors.primary,
  },
  sellerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 8,
  },
  sellerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  chatButton: {
    marginLeft: "auto",
    backgroundColor: colors.info,
    padding: 15,
    borderRadius: 25,
  },
  chatButtonText: {
    color: "white",
  },
  buyButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 55,
    backgroundColor: "white",
  },
  buyButton: {
    backgroundColor: colors.customBlueDarker,
    padding: 15,
    alignItems: "center",
    borderRadius: 10,
  },
  buyButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default ProductScreen;