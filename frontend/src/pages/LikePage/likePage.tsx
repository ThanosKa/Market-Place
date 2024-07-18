import React, { useState, useCallback } from "react";
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
import { useQueryClient } from "react-query";
import { useTranslation } from "react-i18next";
import { colors } from "../../colors/colors";
import Header from "../../components/UserProfile/header";
import TabSelector from "../../components/TabSelector/tabSelector";
import { useLoggedUser } from "../../hooks/useLoggedUser";
import RenderLikedProducts from "./products";
import RenderLikedProfiles from "./profiles";

type LikesPageProp = RouteProp<MainStackParamList, "Likes">;
type LikesPagePropScreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  "Likes"
>;
type Props = {
  route: LikesPageProp;
  navigation: LikesPagePropScreenNavigationProp;
};

const LikesPage: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<
    "liked-products" | "liked-profiles"
  >("liked-products");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const queryClient = useQueryClient();
  const { data: userData, isLoading, refetch, error } = useLoggedUser();

  const handleBackPress = () => navigation.goBack();

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  const renderContent = () => {
    if (isLoading) {
      return <ActivityIndicator size="small" color={colors.primary} />;
    }

    if (error) {
      return <Text style={styles.errorText}>{t("errorLoadingData")}</Text>;
    }

    if (activeTab === "liked-products") {
      return (
        <RenderLikedProducts userData={userData} queryClient={queryClient} />
      );
    } else {
      return (
        <RenderLikedProfiles userData={userData} queryClient={queryClient} />
      );
    }
  };

  return (
    <View style={styles.container}>
      <Header onBackPress={handleBackPress} />
      <TabSelector
        tabs={[
          { key: "liked-products", label: t("liked-products") },
          { key: "liked-profiles", label: t("liked-profiles") },
        ]}
        activeTab={activeTab}
        setActiveTab={setActiveTab as (tab: string) => void}
      />
      <View style={styles.headerMargin} />
      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <FlatList
          data={[{ key: "content" }]}
          renderItem={() => renderContent()}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
          }
        />
      )}
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
