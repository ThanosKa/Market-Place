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
import FilterModal from "./filtermodal"; // You'll need to create this component
import FilterChip from "./filterchip"; // You'll need to create this component

type HomeScreenRouteProp = RouteProp<MainStackParamList, "Home">;

interface HomeScreenProps {
  route: HomeScreenRouteProp;
}
interface Filters {
  minPrice: string;
  maxPrice: string;
  order: "" | "asc" | "desc";
  condition: string;
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
    order: "",
    condition: "",
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

  const removeFilter = (filterKey: keyof Filters) => {
    setFilters((prev) => ({ ...prev, [filterKey]: "" }));
    queryClient.invalidateQueries(["products"]);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <DummySearchBar placeholder={searchQuery || t("search")} />
        <View style={styles.filterSection}>
          <TouchableOpacity
            style={styles.filterChip}
            onPress={() => setFilterModalVisible(true)}
          >
            <Text>{t("filter")}</Text>
          </TouchableOpacity>
          {(Object.keys(filters) as Array<keyof Filters>).map(
            (key) =>
              filters[key] && (
                <FilterChip
                  key={key}
                  label={`${t(key)}: ${filters[key]}`}
                  onRemove={() => removeFilter(key)}
                />
              )
          )}
        </View>
        <Text style={styles.sectionTitle}>{t("explore-categories")}</Text>
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

        <FilterModal
          visible={isFilterModalVisible}
          onClose={() => setFilterModalVisible(false)}
          onApply={handleFilterChange}
          initialFilters={filters}
          conditions={conditions}
        />
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
    marginLeft: 10,
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },
  filterSection: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    padding: 10,
  },
  filterChip: {
    backgroundColor: colors.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
});

export default HomeScreen;
