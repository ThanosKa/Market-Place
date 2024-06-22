// components/ProductCard/ProductCard.tsx
import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { colors } from "../../colors/colors";

import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "../../interfaces/auth/navigation";

type ProductCardProps = {
  userImage: string;
  userName: string;
  userId: string;
  productImage: string;
  title: string;
  price: string;
  condition: string;
  isLiked: boolean;
  onLikeToggle: () => void;
};

const ProductCard: React.FC<ProductCardProps> = ({
  userImage,
  userName,
  userId,
  productImage,
  title,
  price,
  condition,
  isLiked,
  onLikeToggle,
}) => {
  const navigation = useNavigation<StackNavigationProp<MainStackParamList>>();

  const handleUserPress = () => {
    navigation.navigate("UserProfile", { userId: userId });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleUserPress} style={styles.userInfo}>
        <Image source={{ uri: userImage }} style={styles.userImage} />
        <Text style={styles.userName}>{userName}</Text>
      </TouchableOpacity>
      <Image source={{ uri: productImage }} style={styles.productImage} />
      <View style={styles.productContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.price}>{price}</Text>
        <Text style={styles.condition}>{condition}</Text>
      </View>
      <TouchableOpacity onPress={onLikeToggle} style={styles.likeButton}>
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
