// screens/ProfileScreen.tsx
import React, { useState } from "react";
import { View, ScrollView, StyleSheet, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { StackNavigationProp } from "@react-navigation/stack";
import { useQuery } from "react-query";
import {
  MainStackParamList,
  RootStackParamList,
} from "../../interfaces/auth/navigation";
import { getLoggedUser } from "../../services/user";
import UserInfo from "../../components/UserProfile/userInfo";
import TabSelector from "../../components/UserProfile/tabSelector";
import ListingsTab from "../../components/UserProfile/listingTab";
import ReviewsTab from "../../components/UserProfile/reviewTab";
import ProfileTab from "./profileTab";
import { User } from "../../interfaces/user";

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

  const { data, isLoading, error } = useQuery("loggedUser", getLoggedUser);

  if (isLoading) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View>
        <Text>Error loading user data</Text>
      </View>
    );
  }

  if (!data || !data.data || !data.data.user) {
    return (
      <View>
        <Text>No user data available</Text>
      </View>
    );
  }

  const user: User = data.data.user;
  console.log("user products", user.products);

  return (
    <View style={styles.container}>
      <ScrollView>
        <UserInfo user={user} />
        <TabSelector
          tabs={["profile", "listings", "reviews"]}
          activeTab={activeTab}
          setActiveTab={setActiveTab as (tab: string) => void}
        />
        {activeTab === "profile" && (
          <ProfileTab user={user} navigation={navigation} />
        )}
        {activeTab === "listings" && (
          <ListingsTab
            products={user.products}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}
        {activeTab === "reviews" && (
          <ReviewsTab
            reviews={[]} // reviewCount={5}
            // averageRating={3}
          />
        )}
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
