import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import { MainStackParamList } from "../../interfaces/auth/navigation";
import UndefProfPicture from "../../components/UndefProfPicture/UndefProfPicture";
import { BASE_URL } from "../../services/axiosConfig";
import { colors } from "../../colors/colors";
import { getUserId } from "../../services/authStorage";
import { getProductById } from "../../services/product";
import Swiper from "react-native-swiper";
import { Product } from "../../interfaces/product";
import ImageViewerModal from "../../utils/imageClick";
import { useMutation, useQueryClient } from "react-query";
import { createChat } from "../../services/chat";
import { getUserChats } from "../../services/chat";
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
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const createChatMutation = useMutation(createChat);
  const {
    data: product,
    isLoading,
    error,
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

    // Check if a chat already exists
    const existingChats = await getUserChats();
    const existingChat = existingChats.find(
      (chat) => chat.otherParticipant._id === product.seller._id
    );

    if (existingChat) {
      // If chat exists, navigate to it
      navigation.navigate("Chat", { chatId: existingChat._id });
    } else {
      // If chat doesn't exist, create a new one
      try {
        const newChat = await createChatMutation.mutateAsync(
          product.seller._id
        );
        if (!newChat || !newChat._id) {
          throw new Error("Failed to create chat");
        }
        // Navigate to the new chat
        navigation.navigate("Chat", { chatId: newChat._id });
      } catch (error) {
        console.error("Error creating chat:", error);
        // Handle error (e.g., show an alert to the user)
      }
    }
  }, [product, navigation, createChatMutation]);
  const handleUserPress = async (userId: string) => {
    const loggedUserId = await getUserId();
    if (loggedUserId === userId) {
      navigation.navigate("MainTabs");
      navigation.navigate("Profile", { refreshProfile: Date.now() });
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

  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error loading product</Text>;
  if (!product) return <Text>Product not found</Text>;

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
              <TouchableOpacity
                key={index}
                onPress={() => handleImagePress(index)}
              >
                <Image
                  source={{ uri: `${BASE_URL}${image}` }}
                  style={styles.productImage}
                />
              </TouchableOpacity>
            ))}
          </Swiper>
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.title}>{product.title}</Text>
          <Text style={styles.price}>${product.price}</Text>
          <Text style={styles.condition}>{t(product.condition)}</Text>
          <Text style={styles.category}>{t(product.category)}</Text>

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
        </View>
      </ScrollView>

      {!isCurrentUserSeller && (
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
  imageContainer: {
    height: 300,
  },
  imageSwiper: {
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
  contentContainer: {
    padding: 20,
    marginTop: 30,
    paddingBottom: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  price: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 10,
  },
  condition: {
    fontSize: 16,
    marginBottom: 10,
  },
  category: {
    fontSize: 16,
    marginBottom: 20,
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
