// SearchScreen.tsx
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  Keyboard,
  Text,
} from "react-native";
import { useTranslation } from "react-i18next";
import { colors } from "../../colors/colors";
import SearchBar from "../../components/SearchBarComponenet";

// Mock data for products
const mockProducts = Array.from({ length: 20 }, (_, i) => ({
  id: i.toString(),
  image: `https://picsum.photos/200/200?random=${i}`,
  title: `Product ${i + 1}`,
  owner: {
    firstName: `John`,
    lastName: `Doe ${i + 1}`,
  },
}));

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const cancelSearch = () => {
    setSearchQuery("");
    setIsFocused(false);
    Keyboard.dismiss();
  };

  const renderProductGrid = ({ item }: { item: (typeof mockProducts)[0] }) => (
    <View style={styles.gridItemContainer}>
      <Image source={{ uri: item.image }} style={styles.gridImage} />
    </View>
  );
  const renderSearchResult = ({ item }: { item: (typeof mockProducts)[0] }) => (
    <View style={styles.searchResultItem}>
      <Image source={{ uri: item.image }} style={styles.resultImage} />
      <View style={styles.resultInfo}>
        <Text style={styles.resultTitle}>{item.title}</Text>
        <Text
          style={styles.resultOwner}
        >{`${item.owner.firstName} ${item.owner.lastName}`}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={handleSearch}
        isFocused={isFocused}
        setIsFocused={setIsFocused}
        clearSearch={clearSearch}
        cancelSearch={cancelSearch}
      />

      {!isFocused && searchQuery.length === 0 && (
        <FlatList
          data={mockProducts}
          renderItem={renderProductGrid}
          keyExtractor={(item) => item.id}
          numColumns={3}
          style={styles.productGrid}
          key="grid"
        />
      )}

      {(isFocused || searchQuery.length > 0) && (
        <FlatList
          data={mockProducts.filter((p) =>
            p.title.toLowerCase().includes(searchQuery.toLowerCase())
          )}
          renderItem={renderSearchResult}
          keyExtractor={(item) => item.id}
          style={styles.searchResults}
          key="list"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 10,
  },
  productGrid: {
    flex: 1,
  },
  gridItemContainer: {
    width: "33.33%",
    aspectRatio: 1,
    padding: 0.5,
    backgroundColor: "#fff",
  },
  gridImage: {
    flex: 1,
    backgroundColor: "#e0e0e0",
  },
  searchResults: {
    flex: 1,
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  resultImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  resultOwner: {
    fontSize: 14,
    color: "#666",
  },
});

export default SearchScreen;
