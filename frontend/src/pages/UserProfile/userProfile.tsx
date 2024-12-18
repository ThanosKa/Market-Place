import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  RefreshControl,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
  LayoutChangeEvent,
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
import ReviewsTab from "../../components/TabSelector/reviewTab";
import AboutTab from "../../components/TabSelector/aboutTab";
import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
} from "react-query";
import { getUserById } from "../../services/user";
import { getUserProductsById } from "../../services/product";
import { getReviewsForUser } from "../../services/reviews";
import { toggleLikeUser, getLikedProfiles } from "../../services/likes";
import { AntDesign } from "@expo/vector-icons";
import { User, LikedUser } from "../../interfaces/user";
import { GetUserProductsParams } from "../../interfaces/product";
import FlexibleSkeleton from "../../components/Skeleton/FlexibleSkeleton";

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
  const userId = route.params.userId;

  const [activeTab, setActiveTab] = useState<string>("about");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const [totalProductsCount, setTotalProductsCount] = useState(0);

  const { data: likedProfiles, refetch: refetchLikedProfiles } = useQuery<
    LikedUser[]
  >("likedProfiles", getLikedProfiles);

  const {
    data: userDetails,
    isLoading: userLoading,
    refetch: refetchUserDetails,
  } = useQuery(["userDetails", userId], () => getUserById(userId));
  const {
    data: userProducts,
    isLoading: productsLoading,
    refetch: refetchUserProducts,
    fetchNextPage: fetchNextProductsPage,
    hasNextPage: hasNextProductsPage,
    isFetchingNextPage: isFetchingNextProductsPage,
  } = useInfiniteQuery(
    ["userProducts", userId, searchQuery],
    ({ pageParam = 1 }) =>
      getUserProductsById(userId, {
        search: searchQuery,
        page: pageParam,
        limit: 10,
      } as GetUserProductsParams),
    {
      getNextPageParam: (lastPage) => {
        if (
          lastPage.data.page <
          Math.ceil(lastPage.data.total / lastPage.data.limit)
        ) {
          return lastPage.data.page + 1;
        }
        return undefined;
      },
      enabled: activeTab === "listings" || activeTab === "about",
      onSuccess: (data) => {
        if (!searchQuery) {
          setTotalProductsCount(data.pages[0].data.total);
        }
      },
    }
  );

  const {
    data: userReviews,
    isLoading: reviewsLoading,
    refetch: refetchUserReviews,
    fetchNextPage: fetchNextReviewsPage,
    hasNextPage: hasNextReviewsPage,
    isFetchingNextPage: isFetchingNextReviewsPage,
  } = useInfiniteQuery(
    ["userReviews", userId],
    ({ pageParam = 1 }) =>
      getReviewsForUser(userId, { page: pageParam, limit: 10 }),
    {
      getNextPageParam: (lastPage) => {
        if (lastPage.data.page < lastPage.data.totalPages) {
          return lastPage.data.page + 1;
        }
        return undefined;
      },
      enabled: activeTab === "reviews",
    }
  );

  const toggleUserLikeMutation = useMutation(toggleLikeUser, {
    onSuccess: () => {
      queryClient.invalidateQueries("likedProfiles");
    },
  });

  useEffect(() => {
    setActiveTab("about");
  }, []);

  useFocusEffect(
    useCallback(() => {
      refetchUserDetails();
      refetchLikedProfiles();
    }, [refetchUserDetails, refetchLikedProfiles])
  );

  const allProducts =
    userProducts?.pages?.flatMap((page) => page.data.products) || [];

  const allReviews =
    userReviews?.pages?.flatMap((page) => page.data.reviews) || [];

  const handleToggleLike = useCallback(() => {
    if (userId) {
      toggleUserLikeMutation.mutate(userId);
      setIsLiked((prev) => !prev);
    }
  }, [userId, toggleUserLikeMutation]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetchUserDetails();
    await refetchLikedProfiles();
    if (activeTab === "listings") {
      await refetchUserProducts();
    } else if (activeTab === "reviews") {
      await refetchUserReviews();
    }
    setIsRefreshing(false);
  }, [
    activeTab,
    refetchUserDetails,
    refetchLikedProfiles,
    refetchUserProducts,
    refetchUserReviews,
  ]);

  const handleSearch = useCallback(() => {
    if (activeTab === "listings") {
      refetchUserProducts();
    }
  }, [activeTab, refetchUserProducts]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    if (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    ) {
      if (
        activeTab === "listings" &&
        hasNextProductsPage &&
        !isFetchingNextProductsPage
      ) {
        fetchNextProductsPage();
      } else if (
        activeTab === "reviews" &&
        hasNextReviewsPage &&
        !isFetchingNextReviewsPage
      ) {
        fetchNextReviewsPage();
      }
    }
  };

  useEffect(() => {
    if (likedProfiles && userId) {
      const isUserLiked = likedProfiles.some(
        (likedUser) => likedUser._id === userId
      );
      setIsLiked(isUserLiked);
    }
  }, [likedProfiles, userId]);

  useEffect(() => {
    if (userDetails?.data?.user) {
      navigation.setOptions({
        headerTitle: () => (
          <View>
            <Text style={styles.headerUsername}>
              {userDetails.data.user.username}
            </Text>
          </View>
        ),
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
    }
  }, [navigation, isLiked, handleToggleLike, userDetails]);

  const handleContentLayout = (event: LayoutChangeEvent) => {
    setContentHeight(event.nativeEvent.layout.height);
  };

  if (!userDetails && !userLoading) {
    return (
      <View style={styles.container}>
        <Text> {t("errorLoadingData")}</Text>
      </View>
    );
  }

  const user: User = userDetails?.data.user as User;

  const tabs = [
    { key: "about", label: t("about") },
    { key: "listings", label: t("listings") },
    { key: "reviews", label: t("reviews") },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {userLoading ? (
          <FlexibleSkeleton type="userInfo" itemCount={1} />
        ) : (
          <UserInfo user={user} totalProducts={totalProductsCount} />
        )}

        {userLoading ? (
          <FlexibleSkeleton
            type="line"
            itemCount={1}
            lineWidth="90%"
            lineHeight={14}
          />
        ) : (
          <TabSelector
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === "about" && (
          <>
            {userLoading ? (
              <FlexibleSkeleton type="list" itemCount={2} contentLines={3} />
            ) : (
              <AboutTab user={user} />
            )}
          </>
        )}

        {activeTab === "listings" &&
          (productsLoading && !searchQuery ? (
            <FlexibleSkeleton
              type="grid"
              itemCount={6}
              columns={2}
              hasProfileImage={false}
              contentLines={2}
            />
          ) : (
            <ListingsTab
              products={allProducts}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSearch={handleSearch}
              isLoading={productsLoading}
              loadMore={fetchNextProductsPage}
              hasMore={!!hasNextProductsPage}
              isLoadingMore={isFetchingNextProductsPage}
              onLayout={handleContentLayout}
            />
          ))}

        {activeTab === "reviews" &&
          (reviewsLoading ? (
            <FlexibleSkeleton type="userInfo" itemCount={5} />
          ) : (
            <ReviewsTab
              user={false}
              reviews={allReviews}
              isLoading={reviewsLoading}
              loadMore={fetchNextReviewsPage}
              hasMore={!!hasNextReviewsPage}
              isLoadingMore={isFetchingNextReviewsPage}
              onLayout={handleContentLayout}
              firstName={user.firstName}
              lastName={user.lastName}
            />
          ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
  },
  headerUsername: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.secondary,
  },
});

export default UserProfileScreen;
