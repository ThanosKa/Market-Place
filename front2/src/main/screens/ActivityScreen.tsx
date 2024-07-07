// src/main/screens/ActivityScreen.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";

const ActivityScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text>Hello from Activity Screen</Text>
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

export default ActivityScreen;
