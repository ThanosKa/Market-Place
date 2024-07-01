// screens/profile/profile.tsx
import React, { useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "../../interfaces/auth/navigation";
import { colors } from "../../colors/colors";
import { Product, Review, User } from "../../components/UserProfile/types";
import {
  dummyProducts,
  dummyReviews,
  dummyUser,
} from "../../components/UserProfile/dummyData";
import UserInfo from "../../components/UserProfile/userInfo";
import TabSelector from "../../components/UserProfile/tabSelector";
import ListingsTab from "../../components/UserProfile/listingTab";
import ReviewsTab from "../../components/UserProfile/reviewTab";
import ProfileTab from "./profileTab";

type ProfileScreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  "Profile"
>;

type Props = {
  navigation: ProfileScreenNavigationProp;
};

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<
    "profile" | "listings" | "reviews"
  >("profile");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // In a real application, you would fetch this data for the current user
  const user: User = dummyUser;
  const products: Product[] = dummyProducts;
  const reviews: Review[] = dummyReviews;

  const handleEditProfile = () => {
    // navigation.navigate("EditProfile");
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <UserInfo user={user} />
        {/* <UserInfo user={user} onEditPress={handleEditProfile} /> */}
        <TabSelector
          tabs={["profile", "listings", "reviews"]}
          activeTab={activeTab}
          setActiveTab={setActiveTab as (tab: string) => void}
        />
        {activeTab === "profile" && <ProfileTab user={user} />}
        {activeTab === "listings" && (
          <ListingsTab
            products={products}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}
        {activeTab === "reviews" && <ReviewsTab reviews={reviews} />}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});

export default ProfileScreen;
