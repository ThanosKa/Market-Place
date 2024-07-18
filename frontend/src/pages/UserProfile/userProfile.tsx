import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
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
import { User } from "../../interfaces/user";
import ReviewsTab from "../../components/TabSelector/reviewTab";
import AboutTab from "../../components/TabSelector/aboutTab";
import { useUserById } from "../../hooks/useUserById";
import { useLoggedUser } from "../../hooks/useLoggedUser";
import { useMutation, useQueryClient } from "react-query";
import { toggleLikeUser } from "../../services/likes";
import { AntDesign } from "@expo/vector-icons";

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
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<string>("about");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const userId = route.params.userId;
  const {
    data: userData,
    isLoading: userLoading,
    refetch,
  } = useUserById(userId, {
    search: activeTab === "listings" ? searchQuery : undefined,
  });
  const { data: loggedUserData } = useLoggedUser();

  const toggleUserLikeMutation = useMutation(toggleLikeUser, {
    onSuccess: () => {
      queryClient.invalidateQueries("loggedUser");
    },
  });

  const user = userData?.data?.user;

  const userName = useMemo(() => {
    return user ? { firstName: user.firstName, lastName: user.lastName } : null;
  }, [user]);

  const handleToggleLike = useCallback(() => {
    if (userId) {
      toggleUserLikeMutation.mutate(userId);
      setIsLiked((prev) => !prev);
    }
  }, [userId, toggleUserLikeMutation]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  useEffect(() => {
    if (loggedUserData?.data?.user && userId) {
      const isUserLiked = loggedUserData.data.user.likedUsers.some(
        (likedUser: any) => likedUser._id === userId
      );
      setIsLiked(isUserLiked);
    }
  }, [loggedUserData, userId]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={handleToggleLike}
          style={{ marginRight: 15 }}
        >
          <AntDesign
            name={isLiked ? "heart" : "hearto"}
            size={24}
            color={isLiked ? "red" : colors.primary}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, isLiked, handleToggleLike]);

  useEffect(() => {
    if (userName) {
      navigation.setParams(userName);
    }
  }, [navigation, userName]);

  useFocusEffect(
    useCallback(() => {
      refetch();
      setActiveTab("about");
    }, [refetch])
  );

  const renderContent = () => {
    if (userLoading && !user) {
      return <ActivityIndicator size="small" color={colors.secondary} />;
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
