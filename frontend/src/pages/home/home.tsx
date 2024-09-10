import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useQueryClient, useQuery } from "react-query";
import { RouteProp, useFocusEffect, useRoute } from "@react-navigation/native";
import { MainStackParamList } from "../../interfaces/auth/navigation";
import { getUnreadChatsCount } from "../../services/chat";
import DummySearchBar from "../../components/DummySearchBar/DummySearchBar";
import CategoryIcon from "../../components/CategoryIcons/categoryIcons";
import {
  categories,
  conditions,
} from "../../interfaces/exploreCategories/iconsCategory";
import ProductGrid from "../../components/ProductGrid/productGrid";
import { colors } from "../../colors/colors";
import { useDispatch } from "react-redux";
import { setUnreadChatsCount } from "../../redux/useSlice";
import { getActivities } from "../../services/activity";
import FilterModal from "./filtermodal";
import FilterChip from "./filterchip";

type HomeScreenRouteProp = RouteProp<MainStackParamList, "Home">;

interface HomeScreenProps {
  route: HomeScreenRouteProp;
}

export interface Filters {
  minPrice: string;
  maxPrice: string;
  sort: "price" | "createdAt" | null;
  order: "" | "asc" | "desc";
  conditions: string[];
}

const HomeScreen: React.FC<HomeScreenProps> = ({ route: propRoute }) => {
  const route = useRoute<HomeScreenRouteProp>();
  const searchQuery = route.params?.searchQuery || "";
  const { t } = useTranslation();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    minPrice: "",
    maxPrice: "",
    sort: "createdAt",
    order: "",
    conditions: [],
  });

  const { refetch: refetchUnreadChatsCount } = useQuery(
    "unreadChatsCount",
    getUnreadChatsCount,
    {
      enabled: false,
      onSuccess: (data) => {
        if (data.success && data.data.unreadChatsCount !== undefined) {
          dispatch(setUnreadChatsCount(data.data.unreadChatsCount));
        }
      },
    }
  );

  const { refetch: refetchActivities } = useQuery("activities", getActivities, {
    enabled: false,
  });

  useFocusEffect(
    useCallback(() => {
      refetchUnreadChatsCount();
      refetchActivities();
    }, [refetchUnreadChatsCount, refetchActivities])
  );

  useEffect(() => {
    if (searchQuery) {
      queryClient.invalidateQueries(["products", { search: searchQuery }]);
    }
  }, [searchQuery, queryClient]);

  useEffect(() => {
    if (route.params?.refreshHome) {
      onRefresh();
    }
  }, [route.params?.refreshHome]);

  const handleRefreshComplete = () => {
    setRefreshing(false);
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
    queryClient.resetQueries(["products"]);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    queryClient.invalidateQueries("products", {
      refetchActive: true,
    });
    refetchUnreadChatsCount();
    refetchActivities();
    setTimeout(() => setRefreshing(false), 1000);
  }, [queryClient, refetchUnreadChatsCount, refetchActivities]);

  const selectedCategoryValues = selectedCategories
    .map((id) => categories.find((cat) => cat.id === id)?.value)
    .filter(Boolean) as string[];

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
    setFilterModalVisible(false);
    queryClient.invalidateQueries(["products"]);
  };

  const removeFilter = (filterKey: keyof Filters, value?: string) => {
    if (filterKey === "conditions" && value) {
      setFilters((prev) => ({
        ...prev,
        conditions: prev.conditions.filter((c) => c !== value),
      }));
    } else if (filterKey !== "conditions") {
      setFilters((prev) => ({ ...prev, [filterKey]: "" }));
    }
    queryClient.invalidateQueries(["products"]);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <DummySearchBar placeholder={searchQuery || t("search")} />
          <View style={styles.headerRow}>
            <Text style={styles.sectionTitle}>{t("explore-categories")}</Text>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setFilterModalVisible(true)}
            >
              <Text style={styles.filterButtonText}>{t("filters")}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.filterChipsContainer}>
            {filters.minPrice && (
              <FilterChip
                label={`${t("min-price")}: ${filters.minPrice}`}
                onRemove={() => removeFilter("minPrice")}
              />
            )}
            {filters.maxPrice && (
              <FilterChip
                label={`${t("max-price")}: ${filters.maxPrice}`}
                onRemove={() => removeFilter("maxPrice")}
              />
            )}
            {filters.order && (
              <FilterChip
                label={`order: ${filters.order}`}
                onRemove={() => removeFilter("order")}
              />
            )}
            {filters.conditions.map((condition) => (
              <FilterChip
                key={condition}
                label={condition}
                onRemove={() => removeFilter("conditions", condition)}
              />
            ))}
          </View>
          <View style={styles.categoriesContainer}>
            {categories.map((category, index) => (
              <CategoryIcon
                key={index}
                label={t(category.label)}
                iconName={category.id}
                isSelected={selectedCategories.includes(category.id)}
                onPress={() => toggleCategory(category.id)}
              />
            ))}
          </View>
          <ProductGrid
            onRefreshComplete={handleRefreshComplete}
            selectedCategories={selectedCategoryValues}
            filters={filters}
          />
        </ScrollView>
        <FilterModal
          visible={isFilterModalVisible}
          onClose={() => setFilterModalVisible(false)}
          onApply={handleFilterChange}
          initialFilters={filters}
          conditions={conditions}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  filterButton: {
    borderWidth: 1,
    borderColor: colors.senderBubble,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterButtonText: {
    color: colors.primary,
    fontWeight: "500",
  },
  filterChipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 10,
    marginBottom: 10,
  },
});

export default HomeScreen;
