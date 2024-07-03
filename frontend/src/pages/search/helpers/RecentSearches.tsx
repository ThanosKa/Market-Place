// RecentSearches.tsx
import React from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useTranslation } from "react-i18next";
import { EvilIcons } from "@expo/vector-icons";
import { RecentSearch } from "../../../interfaces/recentSearch";
import { BASE_URL } from "../../../services/axiosConfig";
import { colors } from "../../../colors/colors";

interface RecentSearchesProps {
  recentSearches: RecentSearch[];
  isLoading: boolean;
  onClickRecentSearch: (productId: string) => void;
  onDeleteRecentSearch: (id: string) => void;
  onClearAllRecentSearches: () => void;
}

const RecentSearches: React.FC<RecentSearchesProps> = ({
  recentSearches,
  isLoading,
  onClickRecentSearch,
  onDeleteRecentSearch,
  onClearAllRecentSearches,
}) => {
  const { t } = useTranslation();

  const renderRecentSearch = ({ item }: { item: RecentSearch }) => (
    <TouchableOpacity
      style={styles.recentSearchItem}
      onPress={() => onClickRecentSearch(item.product._id)}
    >
      <Image
        source={{
          uri:
            item.product.images.length > 0
              ? `${BASE_URL}${item.product.images[0]}`
              : undefined,
        }}
        style={styles.recentSearchImage}
      />
      <View style={styles.recentSearchInfo}>
        <Text style={styles.recentSearchTitle}>{item.product.title}</Text>
        <Text style={styles.recentSearchDetails}>
          {`$${item.product.price} • ${item.product.condition}`}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteRecentSearch}
        onPress={() => onDeleteRecentSearch(item._id)}
      >
        <EvilIcons name="close" size={20} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (isLoading) {
    return <ActivityIndicator size="small" color={colors.secondary} />;
  }

  if (recentSearches.length === 0) {
    return <Text style={styles.emptyMessage}>{t("search-for-products")}</Text>;
  }

  return (
    <View style={styles.recentSearchesContainer}>
      <View style={styles.recentSearchesHeader}>
        <Text style={styles.recentSearchesTitle}>{t("recent-searches")}</Text>
        <TouchableOpacity onPress={onClearAllRecentSearches}>
          <Text style={styles.clearAllText}>{t("clear-all")}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={recentSearches}
        renderItem={renderRecentSearch}
        keyExtractor={(item) => item._id}
        style={styles.recentSearchesList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  recentSearchesContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  recentSearchesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  recentSearchesTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  clearAllText: {
    color: colors.primary,
    fontSize: 14,
  },
  recentSearchesList: {
    flex: 1,
  },
  recentSearchItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  recentSearchImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  recentSearchInfo: {
    flex: 1,
  },
  recentSearchTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  recentSearchDetails: {
    fontSize: 14,
    color: "#666",
  },
  deleteRecentSearch: {
    padding: 5,
  },
  emptyMessage: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 14,
    color: colors.secondary,
  },
});

export default RecentSearches;
