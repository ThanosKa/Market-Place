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
import {
  CommonActions,
  RouteProp,
  useFocusEffect,
} from "@react-navigation/native";
import {
  MainStackParamList,
  RootStackParamList,
} from "../../interfaces/auth/navigation";
import { colors } from "../../colors/colors";
import UserInfo from "../../components/UserInfo/userInfo";
import TabSelector from "../../components/TabSelector/tabSelector";
import ListingsTab from "../../components/TabSelector/listingTab";
import { User } from "../../interfaces/user";
import ReviewsTab from "../../components/TabSelector/reviewTab";
import { getUserId } from "../../services/authStorage";
import { useUserById } from "../../hooks/useUserById";
import AboutTab from "../../components/TabSelector/aboutTab";

type CombinedParamList = RootStackParamList & MainStackParamList;

type UserProfileScreenNavigationProp = StackNavigationProp<
  CombinedParamList,
  "UserProfile"
>;
type UserProfileScreenRouteProp = RouteProp<CombinedParamList, "UserProfile">;

type Props = {
  navigation: UserProfileScreenNavigationProp;
  route: UserProfileScreenRouteProp;
};

const UserProfileScreen: React.FC<Props> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>("about");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [initialUserData, setInitialUserData] = useState<User | null>(null);

  const userId = route.params.userId;

  const {
    data: userData,
    isLoading: userLoading,
    refetch,
  } = useUserById(userId, {
    search: activeTab === "listings" ? searchQuery : undefined,
  });
  const user = userData?.data?.user || initialUserData;
  useFocusEffect(
    useCallback(() => {
      refetch();
      setActiveTab("about");
    }, [refetch])
  );

  useFocusEffect(
    useCallback(() => {
      refetch();
      setActiveTab("about");
    }, [refetch])
  );

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);
  useEffect(() => {
    if (user) {
      navigation.setParams({
        firstName: user.firstName,
        lastName: user.lastName,
      });
    }
  }, [user, navigation]);
  useEffect(() => {
    if (userData?.data?.user && !initialUserData) {
      setInitialUserData(userData.data.user);
    }
  }, [userData, initialUserData]);

  const renderContent = () => {
    if (userLoading && !initialUserData) {
      return <ActivityIndicator size="large" color={colors.primary} />;
    }

    if (!user) {
      return <Text>Error loading user data</Text>;
    }
    const tabs = [
      { key: "about", label: t("about") },
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
        {activeTab === "about" && <AboutTab user={user} />}
        {activeTab === "listings" && (
          <ListingsTab
            products={user.products}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSearch={() => refetch()}
            isLoading={userLoading}
          />
        )}
        {activeTab === "reviews" && (
          <ReviewsTab
            user={false}
            reviews={user.reviews}
            firstName={user.firstName}
            lastName={user.lastName}
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

export default UserProfileScreen;
