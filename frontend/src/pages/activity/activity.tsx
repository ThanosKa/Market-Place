import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Swipeable } from "react-native-gesture-handler";
import { colors } from "../../colors/colors";
import { Ionicons } from "@expo/vector-icons";

import { User, Product } from "../../components/UserProfile/types";

interface ActivityItem {
  id: number;
  type: "like_product" | "like_profile" | "message";
  user: User;
  product?: Product;
  timestamp: Date;
}

// Updated mock data
const initialMockActivityData: ActivityItem[] = [
  {
    id: 1,
    type: "like_product",
    user: {
      firstName: "John",
      lastName: "Doe",
      profileImage: "https://randomuser.me/api/portraits/men/1.jpg",
      reviews: 10,
      sales: 5,
      purchases: 3,
      location: "New York",
      products: undefined,
    },
    product: {
      id: 1,
      image: "https://picsum.photos/200",
      title: "Vintage Camera",
      price: "$50",
      isLiked: true,
    },
    timestamp: new Date(2024, 5, 24, 10, 30),
  },
  {
    id: 2,
    type: "message",
    user: {
      firstName: "Jane",
      lastName: "Smith",
      profileImage: "https://randomuser.me/api/portraits/women/1.jpg",
      reviews: 8,
      sales: 3,
      purchases: 7,
      location: "Los Angeles",
      products: undefined,
    },
    timestamp: new Date(2024, 5, 23, 15, 45),
  },
  {
    id: 3,
    type: "like_profile",
    user: {
      firstName: "Mike",
      lastName: "Johnson",
      profileImage: "https://randomuser.me/api/portraits/men/2.jpg",
      reviews: 5,
      sales: 2,
      purchases: 4,
      location: "Chicago",
      products: undefined,
    },
    timestamp: new Date(2024, 5, 20, 9, 15),
  },
  // Add more mock data as needed
];

const ActivityScreen: React.FC = () => {
  const { t } = useTranslation();
  const [activityData, setActivityData] = useState(initialMockActivityData);

  const renderActivityItem = ({ item }: { item: ActivityItem }) => {
    const getActivityMessage = (type: string) => {
      switch (type) {
        case "like_product":
          return t("liked your product");
        case "like_profile":
          return t("liked your profile");
        case "message":
          return t("sent you a message");
        default:
          return "";
      }
    };

    const deleteItem = (id: number) => {
      setActivityData(activityData.filter((activity) => activity.id !== id));
    };

    const renderRightActions = () => {
      return (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteItem(item.id)}
        >
          <Ionicons
            style={styles.deleteButtonIcon}
            name="trash-outline"
            size={24}
            color={colors.white}
          />
          {/* <Text style={styles.deleteButtonText}>{t("Delete")}</Text> */}
        </TouchableOpacity>
      );
    };

    return (
      <Swipeable renderRightActions={renderRightActions}>
        <View style={styles.activityItem}>
          <Image
            source={{ uri: item.user.profileImage }}
            style={styles.profileImage}
          />
          <View style={styles.activityContent}>
            <Text style={styles.userName}>
              {item.user.firstName} {item.user.lastName}
            </Text>
            <Text style={styles.activityMessage}>
              {getActivityMessage(item.type)}
            </Text>
          </View>
          {item.type === "like_product" && item.product && (
            <Image
              source={{ uri: item.product.image }}
              style={styles.productImage}
            />
          )}
        </View>
      </Swipeable>
    );
  };

  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{section.title}</Text>
    </View>
  );

  const groupActivitiesByDate = (activities: ActivityItem[]) => {
    const grouped = activities.reduce((acc, activity) => {
      const date = activity.timestamp;
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let title;
      if (date.toDateString() === today.toDateString()) {
        title = t("Today");
      } else if (date.toDateString() === yesterday.toDateString()) {
        title = t("Yesterday");
      } else if (today.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
        title = t("Last 7 days");
      } else {
        title = t("Last 30 days");
      }

      if (!acc[title]) {
        acc[title] = [];
      }
      acc[title].push(activity);
      return acc;
    }, {} as Record<string, ActivityItem[]>);

    return Object.entries(grouped).map(([title, data]) => ({ title, data }));
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={groupActivitiesByDate(activityData)}
        renderItem={({ item }) => (
          <>
            {renderSectionHeader({ section: { title: item.title } })}
            <FlatList
              data={item.data}
              renderItem={renderActivityItem}
              keyExtractor={(item) => item.id.toString()}
            />
          </>
        )}
        keyExtractor={(item) => item.title}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  sectionHeader: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.lightGray,
    backgroundColor: colors.background,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
  },
  activityMessage: {
    fontSize: 14,
    color: colors.secondary,
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  deleteButton: {
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "flex-end",
    width: 70,
    height: "100%",
  },
  deleteButtonIcon: {
    padding: 20,
  },
});

export default ActivityScreen;
