import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  ActivityIndicator,
  RefreshControl,
  LayoutChangeEvent,
  NativeSyntheticEvent,
  NativeScrollEvent,
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
import { useInfiniteQuery, useQuery } from "react-query";
import { getUserDetails } from "../../services/user";
import { getUserProducts } from "../../services/product";
import { getUserReviews } from "../../services/reviews";
import { GetUserProductsParams } from "../../interfaces/product";
import FlexibleSkeleton from "../../components/Skeleton/FlexibleSkeleton";

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
  const [contentHeight, setContentHeight] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [totalProductsCount, setTotalProductsCount] = useState(0);
  const {
    data: userDetails,
    isLoading: userLoading,
    refetch: refetchUserDetails,
  } = useQuery("userDetails", getUserDetails);

  const {
    data: userProducts,
    isLoading: productsLoading,
    refetch: refetchUserProducts,
    fetchNextPage: fetchNextProductsPage,
    hasNextPage: hasNextProductsPage,
    isFetchingNextPage: isFetchingNextProductsPage,
  } = useInfiniteQuery(
    ["userProducts", searchQuery],
    ({ pageParam = 1 }) =>
      getUserProducts({
        search: searchQuery,
        page: pageParam,
        limit: 10,
      } as GetUserProductsParams),
    {
      getNextPageParam: (lastPage) => {
        if (lastPage.data.page < lastPage.data.total / lastPage.data.limit) {
          return lastPage.data.page + 1;
        }
        return undefined;
      },
      enabled: activeTab === "listings" || activeTab === "profile",
      onSuccess: (data) => {
        // Update total products count only when there's no search query
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
    "userReviews",
    ({ pageParam = 1 }) => getUserReviews({ page: pageParam, limit: 10 }),
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

  const allProducts =
    userProducts?.pages?.flatMap((page) => page.data.products) || [];
  const allReviews =
    userReviews?.pages?.flatMap((page) => page.data.reviews) || [];

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

  const handleContentLayout = (event: LayoutChangeEvent) => {
    setContentHeight(event.nativeEvent.layout.height);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentPosition = event.nativeEvent.contentOffset.y;
    setScrollPosition(currentPosition);

    const scrollViewHeight = event.nativeEvent.layoutMeasurement.height;
    const contentHeight = event.nativeEvent.contentSize.height;
    const isCloseToBottom =
      contentHeight - currentPosition - scrollViewHeight < 200;

    if (isCloseToBottom) {
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
  const tabs = [
    { key: "profile", label: t("profile") },
    { key: "listings", label: t("listings") },
    { key: "reviews", label: t("reviews") },
  ];

  if (!userDetails && !userLoading) {
    return (
      <View style={styles.container}>
        <Text> {t("errorLoadingData")}</Text>
      </View>
    );
  }

  // const user: User = userDetails?.data.user;
  const user: User = userDetails?.data.user as User;
  const totalProducts = userProducts?.pages[0]?.data.total || 0;

  const totalLikes = userDetails?.data.totalLikes;

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
          <UserInfo
            user={user}
            totalProducts={totalProductsCount}
            totalLikes={totalLikes}
          />
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

        {activeTab === "profile" && (
          <>
            {userLoading ? (
              <FlexibleSkeleton type="list" itemCount={2} contentLines={3} />
            ) : (
              <ProfileTab user={user} navigation={navigation} />
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
              user
              reviews={allReviews}
              isLoading={reviewsLoading}
              loadMore={fetchNextReviewsPage}
              hasMore={!!hasNextReviewsPage}
              isLoadingMore={isFetchingNextReviewsPage}
              onLayout={handleContentLayout}
            />
          ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignContent: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
});

export default ProfileScreen;
