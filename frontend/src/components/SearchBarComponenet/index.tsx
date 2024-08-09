// SearchBar.tsx
import React, { useEffect, useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { colors } from "../../colors/colors";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (text: string) => void;
  isFocused: boolean;
  setIsFocused: (focused: boolean) => void;
  clearSearch: () => void;
  cancelSearch: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  isFocused,
  setIsFocused,
  clearSearch,
  cancelSearch,
}) => {
  const { t } = useTranslation();
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  return (
    <View style={styles.searchBarContainer}>
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color={colors.primary}
          style={styles.searchIcon}
        />
        <TextInput
          ref={inputRef}
          style={styles.searchInput}
          placeholder={t("Search")}
          value={searchQuery}
          onChangeText={setSearchQuery}
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
  );
};

const styles = StyleSheet.create({
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
    paddingHorizontal: 10,
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
    // color: "#007AFF",
    color: colors.primary,
    fontSize: 16,
  },
});

export default SearchBar;
