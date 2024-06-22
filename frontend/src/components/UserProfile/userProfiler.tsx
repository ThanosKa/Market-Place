// UserProfile.tsx
import React, { useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "../../interfaces/auth/navigation";
import { colors } from "../../colors/colors";
import { dummyUser, dummyProducts, dummyReviews } from "./dummyData";
import { Product, Review, User } from "./types";
import Header from "./header";
import UserInfo from "./userInfo";
import TabSelector from "./tabSelector";
import ListingsTab from "./listingTab";
import ReviewsTab from "./reviewTab";

type UserProfileScreenRouteProp = RouteProp<MainStackParamList, "UserProfile">;
type UserProfileScreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  "UserProfile"
>;

type Props = {
  route: UserProfileScreenRouteProp;
  navigation: UserProfileScreenNavigationProp;
};

const UserProfile: React.FC<Props> = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { userId } = route.params;
  const [activeTab, setActiveTab] = useState<"listings" | "reviews">(
    "listings"
  );
  const [searchQuery, setSearchQuery] = useState<string>("");

  // In a real application, you would fetch this data based on the userId
  const user: User = dummyUser;
  const products: Product[] = dummyProducts;
  const reviews: Review[] = dummyReviews;

  const handleBackPress = () => navigation.goBack();
  const handleSharePress = () => {
    // Implement share functionality
  };
  const handleLikeUserPress = () => {
    // Implement like user functionality
  };

  return (
    <ScrollView style={styles.container}>
      <Header
        onBackPress={handleBackPress}
        onSharePress={handleSharePress}
        onLikePress={handleLikeUserPress}
      />
      <UserInfo user={user} />
      <TabSelector activeTab={activeTab} setActiveTab={setActiveTab} />
      {activeTab === "listings" ? (
        <ListingsTab
          products={products}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      ) : (
        <ReviewsTab reviews={reviews} />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});

export default UserProfile;
