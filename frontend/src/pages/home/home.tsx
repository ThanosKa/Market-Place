import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  RefreshControl,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useQueryClient, useQuery } from "react-query";
import {
  RouteProp,
  useFocusEffect,
  useRoute,
  useScrollToTop,
} from "@react-navigation/native";
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
import FilterModal, {
  FilterOption,
  FilterOptions,
  Filters,
  SortOption,
} from "../../components/Filters/filtermodal";
import FilterChip from "../../components/Filters/filterchip";

type HomeScreenRouteProp = RouteProp<MainStackParamList, "Home">;

interface HomeScreenProps {
  route: HomeScreenRouteProp;
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
  const flatListRef = useRef<FlatList>(null);
  useScrollToTop(flatListRef);
  const [filters, setFilters] = useState<Filters>({
    minPrice: "",
    maxPrice: "",
    sort: null,
    order: null,
    conditions: [],
  });

  const filterOptions: FilterOptions = {
    conditions: conditions as FilterOption[],
    sortOptions: [
      { id: "price", label: "price" },
      { id: "createdAt", label: "date" },
    ] as SortOption[],
  };

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
      refetchInterval: 60000, // Refetch every minute
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
  }, [queryClient, refetchUnreadChatsCount, refetchActivities]);

  const selectedCategoryValues = selectedCategories
    .map((id) => categories.find((cat) => cat.id === id)?.value)
    .filter(Boolean) as string[];

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
    setFilterModalVisible(false);
    queryClient.invalidateQueries(["products"]);
  };

  const removeFilter = (filterKey: keyof Filters | "price", value?: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev };

      switch (filterKey) {
        case "price":
          newFilters.minPrice = "";
          newFilters.maxPrice = "";
          break;
        case "conditions":
          if (value) {
            newFilters.conditions = prev.conditions.filter((c) => c !== value);
          }
          break;
        case "sort":
        case "order":
          newFilters[filterKey] = null;
          break;
        case "minPrice":
        case "maxPrice":
          newFilters[filterKey] = "";
          break;
        default:
          // This should never happen, but TypeScript requires it
          const exhaustiveCheck: never = filterKey;
          throw new Error(`Unhandled filter key: ${exhaustiveCheck}`);
      }

      return newFilters;
    });

    queryClient.invalidateQueries(["products"]);
  };

  const renderFilterChips = () => (
    <View style={styles.filterChipsContainer}>
      {(filters.minPrice || filters.maxPrice) && (
        <FilterChip
          label=""
          onRemove={() => removeFilter("price")}
          type="price"
          minPrice={filters.minPrice}
          maxPrice={filters.maxPrice}
        />
      )}
      {filters.sort && (
        <FilterChip
          label=""
          onRemove={() => {
            removeFilter("sort");
            removeFilter("order");
          }}
          type="sort"
          sortType={filters.sort}
          sortOrder={filters.order}
        />
      )}
      {filters.conditions.map((condition) => (
        <FilterChip
          key={condition}
          label={condition}
          onRemove={() => removeFilter("conditions", condition)}
          type="condition"
        />
      ))}
    </View>
  );

  const renderHeader = () => (
    <>
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
      {renderFilterChips()}
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
    </>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <FlatList
          ref={flatListRef}
          ListHeaderComponent={renderHeader}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          data={[{ key: "productGrid" }]}
          renderItem={() => (
            <ProductGrid
              onRefreshComplete={handleRefreshComplete}
              selectedCategories={selectedCategoryValues}
              filters={filters}
            />
          )}
          keyExtractor={(item) => item.key}
        />
        <FilterModal
          visible={isFilterModalVisible}
          onClose={() => setFilterModalVisible(false)}
          onApply={handleFilterChange}
          initialFilters={filters}
          filterOptions={filterOptions}
          showPriceFilter={true}
          showSortFilter={true}
          showConditionFilter={true}
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
    marginBottom: 10,
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
