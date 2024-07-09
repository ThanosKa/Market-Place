import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useTranslation } from "react-i18next";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import {
  MainStackParamList,
  RootStackParamList,
} from "../../interfaces/auth/navigation";
import { colors } from "../../colors/colors";
import UserInfo from "../../components/UserProfile/userInfo";
import TabSelector from "../../components/UserProfile/tabSelector";
import ListingsTab from "../../components/UserProfile/listingTab";
import ReviewsTab from "../../components/UserProfile/reviewTab";
import ProfileTab from "./profileTab";
import { useQuery } from "react-query";
import { getLoggedUser } from "../../services/user";
import { User } from "../../interfaces/user";

type CombinedParamList = RootStackParamList & MainStackParamList;

type ProfileScreenNavigationProp = StackNavigationProp<
  CombinedParamList,
  "Profile"
>;
type ProfileScreenRouteProp = RouteProp<CombinedParamList, "Profile">;

type Props = {
  navigation: ProfileScreenNavigationProp;
  route: ProfileScreenRouteProp;
};

const ProfileScreen: React.FC<Props> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>("profile");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data: userData,
    isLoading: userLoading,
    refetch,
  } = useQuery("loggedUser", getLoggedUser);

  useEffect(() => {
    setActiveTab("profile");
  }, []);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  // Handle refresh triggered by double-tap on tab bar
  useEffect(() => {
    if (route.params?.refreshProfile) {
      onRefresh();
    }
  }, [route.params?.refreshProfile, onRefresh]);

  if (userLoading && !isRefreshing) {
    return <ActivityIndicator size="large" color={colors.primary} />;
  }

  const user: User | undefined = userData?.data?.user;

  if (!user) {
    return <Text>Error loading user data</Text>;
  }

  const tabs = [
    { key: "profile", label: t("profile") },
    { key: "listings", label: t("listings") },
    { key: "reviews", label: t("reviews") },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        <UserInfo user={user} />
        <TabSelector
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
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
        {activeTab === "reviews" && <ReviewsTab reviews={user.reviews} />}
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
