import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Text,
} from "react-native";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "../../interfaces/auth/navigation";
import { useQuery, useQueryClient } from "react-query";
import { useTranslation } from "react-i18next";
import { colors } from "../../colors/colors";
import TabSelector from "../../components/TabSelector/tabSelector";
import { getLikedProducts, getLikedProfiles } from "../../services/likes";
import RenderLikedProducts from "./products";
import RenderLikedProfiles from "./profiles";
import FlexibleSkeleton from "../../components/Skeleton/FlexibleSkeleton";

type LikesPageProp = RouteProp<MainStackParamList, "Likes">;
type LikesPagePropScreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  "Likes"
>;

type Props = {
  route: LikesPageProp;
  navigation: LikesPagePropScreenNavigationProp;
};

const LikesPage: React.FC<Props> = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<
    "liked-products" | "liked-profiles"
  >("liked-products");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const queryClient = useQueryClient();

  const {
    data: likedProductsData,
    isLoading: isLoadingProducts,
    refetch: refetchProducts,
    error: productsError,
  } = useQuery(["likedProducts"], () => getLikedProducts(), {
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
  });
  const {
    data: likedProfilesData,
    isLoading: isLoadingProfiles,
    refetch: refetchProfiles,
    error: profilesError,
  } = useQuery(["likedProfiles"], () => getLikedProfiles(), {
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
  });
  useEffect(() => {
    refetchProducts();
    refetchProfiles();
  }, [refetchProducts, refetchProfiles]);
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    if (activeTab === "liked-products") {
      await refetchProducts();
    } else {
      await refetchProfiles();
    }
    setIsRefreshing(false);
  }, [activeTab, refetchProducts, refetchProfiles]);

  const renderContent = () => {
    if (activeTab === "liked-products") {
      if (isLoadingProducts) {
        return (
          <FlexibleSkeleton
            type="grid"
            itemCount={6}
            columns={2}
            profileImagePosition="bottom"
            contentLines={2}
          />
        );
      }

      if (productsError) {
        return <Text style={styles.errorText}>{t("errorLoadingData")}</Text>;
      }

      return (
        <RenderLikedProducts
          likedProductsData={likedProductsData}
          queryClient={queryClient}
        />
      );
    } else {
      if (isLoadingProfiles) {
        return (
          <FlexibleSkeleton
            type="grid"
            itemCount={6}
            columns={2}
            hasProfileImage={true}
            profileImagePosition="bottom"
            contentLines={1}
          />
        );
      }

      if (profilesError) {
        return <Text style={styles.errorText}>{t("errorLoadingData")}</Text>;
      }

      return (
        <RenderLikedProfiles
          likedProfilesData={likedProfilesData || []}
          queryClient={queryClient}
        />
      );
    }
  };

  return (
    <View style={styles.container}>
      <TabSelector
        tabs={[
          { key: "liked-products", label: t("liked-products") },
          { key: "liked-profiles", label: t("liked-profiles") },
        ]}
        activeTab={activeTab}
        setActiveTab={setActiveTab as (tab: string) => void}
      />
      <View style={styles.headerMargin} />
      <FlatList
        data={[{ key: "content" }]}
        renderItem={() => renderContent()}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerMargin: {
    marginTop: 10,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
    color: colors.error,
    padding: 20,
  },
});

export default LikesPage;
