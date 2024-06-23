import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Keyboard,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../colors/colors";

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
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    // Implement search logic here
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const cancelSearch = () => {
    setSearchQuery("");
    setIsFocused(false);
    Keyboard.dismiss();
    inputRef.current?.blur();
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
      <View style={styles.searchBarContainer}>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#999"
            style={styles.searchIcon}
          />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder={t("Search")}
            value={searchQuery}
            onChangeText={handleSearch}
            onFocus={() => setIsFocused(true)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
        {isFocused && (
          <TouchableOpacity onPress={cancelSearch} style={styles.cancelButton}>
            <Text style={styles.cancelText}>{t("Cancel")}</Text>
          </TouchableOpacity>
        )}
      </View>

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
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 40,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 15,
    flex: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  clearButton: {
    padding: 5,
  },
  cancelButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 10,
  },
  cancelText: {
    color: colors.primary,
    fontSize: 16,
  },
  productGrid: {
    flex: 1,
  },
  // gridImage: {
  //   width: "33.33%",
  //   aspectRatio: 1,
  // },
  searchResults: {
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
