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
import { useLoggedUser } from "../../hooks/useLoggedUser";

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
  const [initialUserData, setInitialUserData] = useState<User | null>(null);

  const {
    data: userData,
    isLoading: userLoading,
    refetch,
  } = useLoggedUser({
    search: activeTab === "listings" ? searchQuery : undefined,
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
      setActiveTab("profile");
    }, [refetch])
  );

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  useEffect(() => {
    if (route.params?.refreshProfile) {
      onRefresh();
    }
  }, [route.params?.refreshProfile, onRefresh]);

  useEffect(() => {
    if (userData?.data?.user && !initialUserData) {
      setInitialUserData(userData.data.user);
    }
  }, [userData, initialUserData]);

  const user = userData?.data?.user || initialUserData;

  const renderContent = () => {
    if (userLoading && !initialUserData) {
      return <ActivityIndicator size="small" color={colors.secondary} />;
    }

    if (!user) {
      return <Text>Error loading user data</Text>;
    }

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
            onSearch={() => refetch()}
            isLoading={userLoading}
          />
        )}
        {activeTab === "reviews" && <ReviewsTab user reviews={user.reviews} />}
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
