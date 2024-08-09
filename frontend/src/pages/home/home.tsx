// HomeScreen.tsx
import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "react-query";
import DummySearchBar from "../../components/DummySearchBar/DummySearchBar";
import CategoryIcon from "../../components/CategoryIcons/categoryIcons";
import { categories } from "../../interfaces/exploreCategories/iconsCategory";
import ProductGrid from "../../components/ProductGrid/productGrid";
import { colors } from "../../colors/colors";

import { RouteProp, useRoute } from "@react-navigation/native";
import { MainStackParamList } from "../../interfaces/auth/navigation";
import { useLoggedUser } from "../../hooks/useLoggedUser";

type HomeScreenRouteProp = RouteProp<MainStackParamList, "Home">;

interface HomeScreenProps {
  route: HomeScreenRouteProp;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ route: propRoute }) => {
  // Add this line to use the useRoute hook
  const route = useRoute<HomeScreenRouteProp>();
  const searchQuery = route.params?.searchQuery || "";
  const { refetch: refetchUser } = useLoggedUser();

  useEffect(() => {
    if (searchQuery) {
      // Perform search with the received query
      queryClient.invalidateQueries(["products", { search: searchQuery }]);
    }
  }, [searchQuery]);
  useEffect(() => {
    if (route.params?.refreshHome) {
      onRefresh();
    }
  }, [route.params?.refreshHome]);
  const handleRefreshComplete = () => {
    setRefreshing(false);
  };

  const { t } = useTranslation();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
    // Reset the page when categories change
    queryClient.resetQueries(["products"]);
  };
  // const { refetch: refetchUser } = useLoggedUser(undefined, { staleTime: 0 });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    queryClient.invalidateQueries("products", {
      refetchActive: true,
    });
    refetchUser();
  }, [queryClient, refetchUser]);

  const selectedCategoryValues = selectedCategories
    .map((id) => categories.find((cat) => cat.id === id)?.value)
    .filter(Boolean) as string[];

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <DummySearchBar placeholder={searchQuery || t("Search")} />

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
});

export default HomeScreen;
