// src/main/screens/SearchScreen.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";

const SearchScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text>Hello from Search Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SearchScreen;
