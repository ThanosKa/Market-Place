import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../colors/colors";
import { Product, User } from "../UserProfile/types";
import Header from "../UserProfile/header";
import { RouteProp } from "@react-navigation/native";
import { MainStackParamList } from "../../interfaces/auth/navigation";
import { StackNavigationProp } from "@react-navigation/stack";
import TabSelector from "../UserProfile/tabSelector";

type LikesPageProp = RouteProp<MainStackParamList, "Likes">;
type LikesPagePropScreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  "Likes"
>;
type Props = {
  route: LikesPageProp;
  navigation: LikesPagePropScreenNavigationProp;
};

const LikesPage: React.FC<Props> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<
    "liked-products" | "liked-profiles"
  >("liked-products");

  const mockProducts = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    image: `https://picsum.photos/200/200?random=${i}`,
    title: `Product ${i + 1}`,
    price: `$${(i + 1) * 10}`,
    isLiked: true,
  }));

  const [likedProducts, setLikedProducts] = useState<Product[]>(mockProducts);

  const [likedProfiles, setLikedProfiles] = useState<User[]>([
    {
      firstName: "John",
      lastName: "Doe",
      profileImage: "https://example.com/john.jpg",
      reviews: 4.5,
      sales: 10,
      purchases: 5,
      location: "New York, USA",
      products: mockProducts.slice(0, 1),
    },
    {
      firstName: "Jane",
      lastName: "Smith",
      profileImage: "https://example.com/jane.jpg",
      reviews: 4.7,
      sales: 15,
      purchases: 7,
      location: "Los Angeles, USA",
      products: mockProducts.slice(1, 5),
    },
    {
      firstName: "Emily",
      lastName: "Johnson",
      profileImage: "https://example.com/emily.jpg",
      reviews: 4.2,
      sales: 8,
      purchases: 3,
      location: "Chicago, USA",
      products: mockProducts.slice(5, 10),
    },
    // Add more dummy profile data as needed
  ]);

  const renderProductItem = ({ item }: { item: Product }) => (
    <View style={styles.productItem}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productPrice}>{item.price}</Text>
        <TouchableOpacity onPress={() => toggleProductLike(item.id)}>
          <Ionicons
            name={item.isLiked ? "heart" : "heart-outline"}
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>
      <Text style={styles.productTitle} numberOfLines={1}>
        {item.title}
      </Text>
    </View>
  );

  const renderProfileItem = ({ item }: { item: User }) => {
    const productCount = item.products?.length || 0;

    return (
      <View style={styles.profileItem}>
        {productCount === 1 && item.products ? (
          <Image
            source={{ uri: item.products[0].image }}
            style={styles.profileImage}
          />
        ) : (
          <View style={styles.productGrid}>
            {item.products?.slice(0, 4).map((product: any, index: any) => (
              <View key={index} style={styles.gridItem}>
                <Image
                  source={{ uri: product.image }}
                  style={styles.gridImage}
                />
                {index === 3 && productCount > 4 && (
                  <View style={styles.overlay}>
                    <Text style={styles.overlayText}>+{productCount - 3}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
        <View style={styles.profileInfo}>
          <Text
            style={styles.profileName}
          >{`${item.firstName} ${item.lastName}`}</Text>
          <TouchableOpacity onPress={() => toggleProfileLike(item)}>
            <Ionicons name="heart" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.profileReviews}>{`${item.reviews} Reviews`}</Text>
      </View>
    );
  };

  const toggleProductLike = (productId: number) => {
    setLikedProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === productId
          ? { ...product, isLiked: !product.isLiked }
          : product
      )
    );
  };

  const toggleProfileLike = (user: User) => {
    // Implement profile like/unlike logic here
    console.log(`Toggled like for ${user.firstName} ${user.lastName}`);
  };

  const handleBackPress = () => navigation.goBack();

  return (
    <View style={styles.container}>
      <Header onBackPress={handleBackPress} />
      <TabSelector
        tabs={["liked-products", "liked-profiles"]}
        activeTab={activeTab}
        setActiveTab={setActiveTab as (tab: string) => void}
      />
      <View style={styles.headerMargin}></View>
      {activeTab === "liked-products" ? (
        <FlatList
          data={likedProducts}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.productRow}
        />
      ) : (
        <FlatList
          data={likedProfiles}
          renderItem={renderProfileItem}
          keyExtractor={(item) => `${item.firstName}-${item.lastName}`}
          numColumns={2}
          columnWrapperStyle={styles.profileRow}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerMargin: {
    marginTop: 10,
  },
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
    height: 150,
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
  profileRow: {
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  profileItem: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3,
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
  },
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  gridItem: {
    width: "50%",
    height: 75,
    borderWidth: 1,
    borderColor: "white",
    position: "relative",
  },
  gridImage: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  profileInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  profileReviews: {
    fontSize: 14,
    color: colors.secondary,
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
});

export default LikesPage;
