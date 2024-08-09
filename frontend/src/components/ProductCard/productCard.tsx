import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { AntDesign, Feather } from "@expo/vector-icons";
import { colors } from "../../colors/colors";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "../../interfaces/auth/navigation";
import { getUserId } from "../../services/authStorage";

type ProductCardProps = {
  userImage: string | null;
  userName: string;
  userId: string;
  productId: string; // Add this prop
  productImage: string | null;
  title: string;
  price: string;
  condition: string;
  isLiked: boolean;
  onLikeToggle: () => void;
  isDisabled: boolean;
};

const ProductCard: React.FC<ProductCardProps> = ({
  userImage,
  userName,
  userId,
  productId, // Add this prop
  productImage,
  title,
  price,
  condition,
  isLiked,
  onLikeToggle,
  isDisabled,
}) => {
  const navigation = useNavigation<StackNavigationProp<MainStackParamList>>();

  const handleUserPress = async () => {
    if (userId) {
      const loggedUserId = await getUserId();
      if (loggedUserId === userId) {
        navigation.navigate("MainTabs");
        navigation.navigate("Profile", { refreshProfile: Date.now() });
      } else {
        navigation.navigate("UserProfile", { userId });
      }
    } else {
      console.warn("User ID is missing");
    }
  };

  const handleProductPress = () => {
    navigation.navigate("Product", { productId });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleUserPress} style={styles.userInfo}>
        <View style={styles.userImageContainer}>
          {userImage ? (
            <Image source={{ uri: userImage }} style={styles.userImage} />
          ) : (
            <View style={styles.defaultUserImage}>
              <Feather name="user" size={15} color={colors.secondary} />
            </View>
          )}
        </View>
        <Text style={styles.userName}>{userName}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleProductPress}>
        {productImage ? (
          <Image source={{ uri: productImage }} style={styles.productImage} />
        ) : (
          <Text style={styles.noImageText}>No Image Available</Text>
        )}
        <View style={styles.productContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          <Text style={styles.price}>{price}</Text>
          <Text style={styles.condition}>{condition}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onLikeToggle}
        style={styles.likeButton}
        disabled={isDisabled}
      >
        <AntDesign
          name={isLiked ? "heart" : "hearto"}
          size={18}
          color={isLiked ? "red" : "black"}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 160,
    marginBottom: 20,
    padding: 5,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  userImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 5,
  },
  userName: {
    fontSize: 12,
  },
  productContainer: {
    gap: 3,
  },
  productImage: {
    width: 160,
    height: 180,
    borderRadius: 8,
  },
  noImageText: {
    width: 160,
    height: 180,
    borderRadius: 8,
    textAlign: "center",
    textAlignVertical: "center",
    backgroundColor: "#f0f0f0",
    color: "#999",
  },
  userImageContainer: {
    width: 30,
    height: 30,
    marginRight: 8,
  },

  defaultUserImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 5,
    color: colors.primary,
  },
  price: {
    fontSize: 16,
    color: colors.primary,
    marginTop: 2,
  },
  condition: {
    fontSize: 12,
    color: colors.secondary,
    marginTop: 2,
  },
  likeButton: {
    marginTop: 12,
  },
});

export default ProductCard;
