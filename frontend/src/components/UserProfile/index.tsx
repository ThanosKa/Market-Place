// UserProfile.tsx
import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { useTranslation } from "react-i18next";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "../../interfaces/auth/navigation";
import { colors } from "../../colors/colors";
import { dummyUser, dummyProducts, dummyReviews } from "./dummyData";
import { Product, Review, User } from "./types";
import Header from "./header";
import UserInfo from "./userInfo";
import TabSelector from "../TabSelector/tabSelector";
import ListingsTab from "../TabSelector/listingTab";
import ReviewsTab from "../TabSelector/reviewTab";

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
  const handleMessagePress = () => {
    navigation.navigate("Chat", { userId: userId });
  };
  return (
    <View style={styles.container}>
      <ScrollView>
        <Header
          onBackPress={handleBackPress}
          onSharePress={handleSharePress}
          onLikePress={handleLikeUserPress}
        />
        <UserInfo user={user} />
        <TabSelector
          tabs={["listings", "reviews"]}
          activeTab={activeTab}
          setActiveTab={setActiveTab as (tab: string) => void}
        />
        {/* <TabSelector activeTab={activeTab} setActiveTab={setActiveTab} /> */}
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
      <TouchableOpacity
        style={styles.messageButton}
        onPress={handleMessagePress}
      >
        <Text style={styles.messageButtonText}>Message</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  messageButton: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    zIndex: 1000,
  },
  messageButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default UserProfile;
