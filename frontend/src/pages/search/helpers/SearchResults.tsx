import React from "react";
import {
  FlatList,
  Image,
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Product } from "../../../interfaces/product";
import { colors } from "../../../colors/colors";

interface SearchResultsProps {
  products: Product[];
  onClickSearchedProduct: (productId: string) => void;
  loadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  products,
  onClickSearchedProduct,
  loadMore,
  hasMore,
  isLoadingMore,
}) => {
  const renderSearchResult = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => onClickSearchedProduct(item._id)}
    >
      <Image
        source={{
          uri: item.images.length > 0 ? `${item.images[0]}` : undefined,
        }}
        style={styles.resultImage}
      />
      <View style={styles.resultInfo}>
        <Text style={styles.resultTitle}>{item.title}</Text>
        <Text style={styles.resultOwner}>
          {`${item.seller.firstName} ${item.seller.lastName}`}
        </Text>
      </View>
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

  return (
    <FlatList
      data={products}
      renderItem={renderSearchResult}
      keyExtractor={(item) => item._id}
      style={styles.searchResults}
      onEndReached={() => {
        if (hasMore) {
          loadMore();
        }
      }}
      onEndReachedThreshold={0.1}
      ListFooterComponent={renderFooter}
    />
  );
};

const styles = StyleSheet.create({
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
  footerContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
});

export default SearchResults;
