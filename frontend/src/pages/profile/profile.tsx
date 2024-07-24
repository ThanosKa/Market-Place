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
import { RouteProp, useFocusEffect } from "@react-navigation/native";
import {
  MainStackParamList,
  RootStackParamList,
} from "../../interfaces/auth/navigation";
import { colors } from "../../colors/colors";
import UserInfo from "../../components/UserInfo/userInfo";
import TabSelector from "../../components/TabSelector/tabSelector";
import ListingsTab from "../../components/TabSelector/listingTab";
import ProfileTab from "../../components/TabSelector/profileTab";
import { User } from "../../interfaces/user";
import ReviewsTab from "../../components/TabSelector/reviewTab";
import { useQuery } from "react-query";
import {
  getUserDetails,
  getUserProducts,
  getUserReviews,
} from "../../services/user";

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
    data: userDetails,
    isLoading: userLoading,
    refetch: refetchUserDetails,
  } = useQuery("userDetails", getUserDetails);

  const {
    data: userProducts,
    isLoading: productsLoading,
    refetch: refetchUserProducts,
  } = useQuery(
    ["userProducts", searchQuery],
    () => getUserProducts(searchQuery ? { search: searchQuery } : {}),
    { enabled: activeTab === "listings" }
  );

  const {
    data: userReviews,
    isLoading: reviewsLoading,
    refetch: refetchUserReviews,
  } = useQuery("userReviews", () => getUserReviews(), {
    enabled: activeTab === "reviews",
  });

  useFocusEffect(
    useCallback(() => {
      refetchUserDetails();
      setActiveTab("profile");
    }, [refetchUserDetails])
  );

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetchUserDetails();
    if (activeTab === "listings") {
      await refetchUserProducts();
    } else if (activeTab === "reviews") {
      await refetchUserReviews();
    }
    setIsRefreshing(false);
  }, [activeTab, refetchUserDetails, refetchUserProducts, refetchUserReviews]);

  useEffect(() => {
    if (route.params?.refreshProfile) {
      onRefresh();
    }
  }, [route.params?.refreshProfile, onRefresh]);

  const handleSearch = useCallback(() => {
    if (activeTab === "listings") {
      refetchUserProducts();
    }
  }, [activeTab, refetchUserProducts]);

  const renderContent = () => {
    if (userLoading && !userDetails) {
      return <ActivityIndicator size="small" color={colors.secondary} />;
    }

    if (!userDetails) {
      return <Text>Error loading user data</Text>;
    }

    const user: User = userDetails.data.user;
    const totalProducts = userDetails.data.totalProducts;
    const tabs = [
      { key: "profile", label: t("profile") },
      { key: "listings", label: t("listings") },
      { key: "reviews", label: t("reviews") },
    ];

    return (
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        <UserInfo user={user} totalProducts={totalProducts} />
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
            products={userProducts?.data?.products || []}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSearch={handleSearch}
            isLoading={productsLoading}
          />
        )}
        {activeTab === "reviews" && (
          <ReviewsTab
            user
            reviews={userReviews?.data?.reviews || []}
            isLoading={reviewsLoading}
          />
        )}
      </ScrollView>
    );
  };

  return <View style={styles.container}>{renderContent()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});

export default ProfileScreen;
