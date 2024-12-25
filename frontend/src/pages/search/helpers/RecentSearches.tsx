import React, { useState } from "react";
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
import { EvilIcons, Ionicons } from "@expo/vector-icons";
import { RecentSearch } from "../../../interfaces/recentSearch";
import { colors } from "../../../colors/colors";
import { Feather } from "@expo/vector-icons";

interface RecentSearchesProps {
  recentSearches: RecentSearch[];
  isLoading: boolean;
  onClickRecentSearch: (search: RecentSearch) => void;
  onDeleteRecentSearch: (id: string) => void;
  onClearAllRecentSearches: () => void;
  clearingAllRecentSearches: boolean;
  loadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
}

const RecentSearches: React.FC<RecentSearchesProps> = ({
  recentSearches,
  isLoading,
  onClickRecentSearch,
  onDeleteRecentSearch,
  onClearAllRecentSearches,
  clearingAllRecentSearches,
  loadMore,
  hasMore,
  isLoadingMore,
}) => {
  const { t } = useTranslation();
  const [deletingItems, setDeletingItems] = useState<Set<string>>(new Set());
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Ionicons key={i} name="star" size={16} color={colors.starYellow} />
        );
      } else if (i === fullStars && halfStar) {
        stars.push(
          <Ionicons
            key={i}
            name="star-half"
            size={16}
            color={colors.starYellow}
          />
        );
      } else {
        stars.push(
          <Ionicons
            key={i}
            name="star-outline"
            size={16}
            color={colors.starYellow}
          />
        );
      }
    }

    return stars;
  };
  const renderRecentSearch = ({ item }: { item: RecentSearch }) => (
    <TouchableOpacity
      style={[
        styles.recentSearchItem,
        (clearingAllRecentSearches || deletingItems.has(item.id)) &&
          styles.recentSearchItemClearing,
      ]}
      onPress={() => onClickRecentSearch(item)}
      disabled={clearingAllRecentSearches || deletingItems.has(item.id)}
    >
      {item.type === "product" ? (
        item.product.images.length > 0 ? (
          <Image
            source={{ uri: item.product.images[0] }}
            style={styles.recentSearchImage}
          />
        ) : (
          <View style={[styles.recentSearchImage, styles.defaultImage]}>
            <Feather name="image" size={20} color={colors.secondary} />
          </View>
        )
      ) : item.user.profilePicture ? (
        <Image
          source={{ uri: item.user.profilePicture }}
          style={styles.recentSearchImage}
        />
      ) : (
        <View style={[styles.recentSearchImage, styles.defaultImage]}>
          <Feather name="user" size={20} color={colors.secondary} />
        </View>
      )}
      <View style={styles.recentSearchInfo}>
        {item.type === "product" ? (
          <>
            <Text style={styles.recentSearchTitle}>{item.product.title}</Text>
            <Text style={styles.recentSearchDetails}>
              {`$${item.product.price} • ${t(item.product.condition)}`}
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.recentSearchTitle}>
              {`${item.user.firstName} ${item.user.lastName}`}
            </Text>
            <View style={styles.ratingContainer}>
              <View style={styles.starsContainer}>
                {item.user.reviewCount > 0 ? (
                  <>
                    {renderStars(item.user.averageRating)}
                    <Text style={styles.reviewCount}>
                      ({item.user.reviewCount})
                    </Text>
                  </>
                ) : (
                  <Text style={styles.noReviews}>{t("no-reviews")}</Text>
                )}
              </View>
            </View>
          </>
        )}
      </View>
      <TouchableOpacity
        style={styles.deleteRecentSearch}
        onPress={() => {
          setDeletingItems((prev) => new Set(prev).add(item.id));
          onDeleteRecentSearch(item.id);
        }}
        disabled={clearingAllRecentSearches || deletingItems.has(item.id)}
      >
        {deletingItems.has(item.id) ? (
          <ActivityIndicator size="small" color={colors.secondary} />
        ) : (
          <EvilIcons name="close" size={20} />
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerContainer}>
        <ActivityIndicator size="small" color={colors.secondary} />
      </View>
    );
  };

  if (isLoading) {
    return <ActivityIndicator size="small" color={colors.secondary} />;
  }

  if (recentSearches.length === 0) {
    return <Text style={styles.emptyMessage}>{t("no-recent-searches")}</Text>;
  }

  return (
    <View style={styles.recentSearchesContainer}>
      <View style={styles.recentSearchesHeader}>
        <Text style={styles.recentSearchesTitle}>{t("recent-searches")}</Text>
        <TouchableOpacity
          onPress={onClearAllRecentSearches}
          disabled={clearingAllRecentSearches}
        >
          {clearingAllRecentSearches ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={styles.clearAllText}>{t("clear-all")}</Text>
          )}
        </TouchableOpacity>
      </View>
      <FlatList
        data={recentSearches}
        renderItem={renderRecentSearch}
        keyExtractor={(item) => item.id}
        style={styles.recentSearchesList}
        onEndReached={() => {
          if (hasMore) {
            loadMore();
          }
        }}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  recentSearchesContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  footerContainer: {
    paddingVertical: 20,
    alignItems: "center",
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
    color: colors.secondary,
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
  recentSearchItemClearing: {
    opacity: 0.5,
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

  emptyMessage: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 14,
    color: colors.secondary,
  },
  defaultImage: {
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  starsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewCount: {
    marginLeft: 4,
    fontSize: 14,
    color: colors.secondary,
  },
  noReviews: {
    fontSize: 14,
    color: colors.secondary,
  },
  deleteRecentSearch: {
    padding: 5,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default RecentSearches;
