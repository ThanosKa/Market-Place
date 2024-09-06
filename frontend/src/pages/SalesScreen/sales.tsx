import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { useTranslation } from "react-i18next";

const SalesScreen: React.FC = () => {
  const { t } = useTranslation();

  // Mock data for sales
  const sales = [
    { id: "1", item: "Item A", price: 150, date: "2024-09-03" },
    { id: "2", item: "Item B", price: 250, date: "2024-09-04" },
    // Add more mock data as needed
  ];

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemName}>{item.item}</Text>
      <Text style={styles.itemPrice}>${item.price}</Text>
      <Text style={styles.itemDate}>{item.date}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("sales")}</Text>
      <FlatList
        data={sales}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  itemContainer: {
    backgroundColor: "#f0f0f0",
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  itemPrice: {
    fontSize: 16,
    color: "blue",
  },
  itemDate: {
    fontSize: 14,
    color: "gray",
  },
});

export default SalesScreen;
