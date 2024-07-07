// src/main/screens/SellScreen.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";

const SellScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text>Hello from Sell Screen</Text>
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

export default SellScreen;
