import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
} from "react-native";
import { useTranslation } from "react-i18next";
import { StackNavigationProp } from "@react-navigation/stack";
import {
  MainStackParamList,
  RootStackParamList,
} from "../../interfaces/auth/navigation";
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
import { removeAuthToken } from "../../services/authStorage";

type CombinedParamList = RootStackParamList & MainStackParamList;

type ProfileScreenNavigationProp = StackNavigationProp<CombinedParamList>;

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

  const handleSignOut = async () => {
    try {
      await removeAuthToken();
      navigation.reset({
        index: 0,
        routes: [{ name: "AuthLoading" }],
      });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
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
  signOutButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  signOutText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ProfileScreen;
