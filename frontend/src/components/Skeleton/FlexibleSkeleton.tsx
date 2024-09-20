import React from "react";
import { View, StyleSheet, useWindowDimensions, ViewStyle } from "react-native";
import { Skeleton } from "@rneui/themed";
import { colors } from "../../colors/colors";

// Basic skeleton shapes
const CircleSkeleton: React.FC<{ size: number; style?: ViewStyle }> = ({
  size,
  style,
}) => (
  <Skeleton animation="pulse" width={size} height={size} circle style={style} />
);

const RectangleSkeleton: React.FC<{
  width: number | string;
  height: number;
  style?: ViewStyle;
}> = ({ width, height, style }) => {
  const { width: windowWidth } = useWindowDimensions();

  const getWidth = (): number => {
    if (typeof width === "number") {
      return width;
    }
    // Convert percentage string to number
    if (width.endsWith("%")) {
      const percentage = parseFloat(width) / 100;
      return windowWidth * percentage;
    }
    // Default to full width if invalid input
    return windowWidth;
  };

  return (
    <Skeleton
      animation="pulse"
      width={getWidth()}
      height={height}
      style={style}
    />
  );
};

const LineSkeleton: React.FC<{
  width: number | string;
  height?: number;
  style?: ViewStyle;
}> = ({ width, height = 1, style }) => {
  const { width: windowWidth } = useWindowDimensions();

  const getWidth = (): number => {
    if (typeof width === "number") {
      return width;
    }
    // Convert percentage string to number
    if (width.endsWith("%")) {
      const percentage = parseFloat(width) / 100;
      return windowWidth * percentage;
    }
    // Default to full width if invalid input
    return windowWidth;
  };

  return (
    <Skeleton
      animation="pulse"
      width={getWidth()}
      height={height}
      style={[styles.lineSkeleton, style]}
    />
  );
};

// Compound components
const ProfileSkeleton: React.FC<{
  size: number;
  nameWidth: number;
  contentLines?: number;
}> = ({ size, nameWidth, contentLines = 0 }) => (
  <View style={styles.profileContainer}>
    <CircleSkeleton size={size} style={styles.profileImage} />
    <View>
      <RectangleSkeleton
        width={nameWidth}
        height={size / 3}
        style={styles.nameRect}
      />
      {[...Array(contentLines)].map((_, index) => (
        <RectangleSkeleton
          key={index}
          width={nameWidth * 0.8}
          height={size / 4}
          style={styles.nameRect}
        />
      ))}
    </View>
  </View>
);

const ContentSkeleton: React.FC<{ width: number; lines: number }> = ({
  width,
  lines,
}) => (
  <View>
    {[...Array(lines)].map((_, index) => (
      <RectangleSkeleton
        key={index}
        width={width * (1 - 0.1 * index)}
        height={12}
        style={styles.contentLine}
      />
    ))}
  </View>
);

interface FlexibleSkeletonProps {
  type: "grid" | "list" | "search" | "userInfo" | "line" | "tabs";
  itemCount?: number;
  columns?: number;
  hasProfileImage?: boolean;
  profileImagePosition?: "top" | "bottom" | "left";
  contentLines?: number;
  lineWidth?: number | string;
  lineHeight?: number;
  tabWidth?: number | string;
}

const FlexibleSkeleton: React.FC<FlexibleSkeletonProps> = ({
  type,
  itemCount = 1,
  columns = 2,
  hasProfileImage = false,
  profileImagePosition = "top",
  contentLines = 3,
  lineWidth = "100%",
  lineHeight = 1,
  tabWidth = "28%",
}) => {
  const { width: windowWidth } = useWindowDimensions();
  const containerPadding = 20;
  const itemSpacing = 10;
  const itemWidth =
    type === "grid"
      ? (windowWidth - containerPadding - itemSpacing * (columns - 1)) / columns
      : windowWidth - containerPadding;

  const getWidthValue = (width: number | string): number => {
    if (typeof width === "number") {
      return width;
    }
    if (width.endsWith("%")) {
      return (parseFloat(width) / 100) * windowWidth;
    }
    return windowWidth;
  };

  const renderSkeletonItem = () => (
    <View style={[styles.item, { width: itemWidth }]}>
      {hasProfileImage && profileImagePosition === "top" && (
        <ProfileSkeleton size={30} nameWidth={itemWidth * 0.5} />
      )}
      <RectangleSkeleton
        width={itemWidth}
        height={itemWidth * 0.85}
        style={styles.mainRectangle}
      />
      {hasProfileImage && profileImagePosition === "bottom" && (
        <ProfileSkeleton size={30} nameWidth={itemWidth * 0.5} />
      )}
      <ContentSkeleton width={itemWidth * 0.8} lines={contentLines} />
    </View>
  );
  const renderLineSkeleton = () => (
    <LineSkeleton width={lineWidth} height={lineHeight} />
  );
  const renderSearchItem = () => (
    <View style={styles.searchItem}>
      <ProfileSkeleton
        size={40}
        nameWidth={windowWidth * 0.6}
        contentLines={contentLines}
      />
    </View>
  );

  const renderUserInfoSkeleton = () => (
    <View style={styles.userInfoContainer}>
      <CircleSkeleton size={100} style={styles.profileImageSkeleton} />
      <View style={styles.userInfoDetailsContainer}>
        <RectangleSkeleton
          width="60%"
          height={16}
          style={styles.userInfoNameSkeleton}
        />
        <RectangleSkeleton
          width="40%"
          height={16}
          style={styles.userInfoRatingSkeleton}
        />
        <RectangleSkeleton
          width="30%"
          height={14}
          style={styles.userInfoStatSkeleton}
        />
        <RectangleSkeleton
          width="20%"
          height={14}
          style={styles.userInfoStatSkeleton}
        />
      </View>
    </View>
  );

  const renderTabsSkeleton = () => (
    <View style={styles.tabsContainer}>
      {[...Array(3)].map((_, index) => (
        <Skeleton
          key={index}
          animation="pulse"
          width={getWidthValue(tabWidth)}
          height={15}
          style={styles.tabSkeleton}
        />
      ))}
    </View>
  );
  const renderItems = () => {
    switch (type) {
      case "tabs":
        return renderTabsSkeleton();
      case "line":
        return [...Array(itemCount)].map((_, index) => (
          <React.Fragment key={index}>{renderLineSkeleton()}</React.Fragment>
        ));
      case "userInfo":
        return [...Array(itemCount)].map((_, index) => (
          <React.Fragment key={index}>
            {renderUserInfoSkeleton()}
          </React.Fragment>
        ));
      case "search":
        return [...Array(itemCount)].map((_, index) => (
          <React.Fragment key={index}>{renderSearchItem()}</React.Fragment>
        ));
      case "grid":
        return [...Array(Math.ceil(itemCount / columns))].map((_, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {[...Array(columns)].map((_, colIndex) => {
              if (rowIndex * columns + colIndex < itemCount) {
                return (
                  <React.Fragment key={colIndex}>
                    {renderSkeletonItem()}
                  </React.Fragment>
                );
              }
              return null;
            })}
          </View>
        ));
      default:
        return [...Array(itemCount)].map((_, index) => (
          <React.Fragment key={index}>{renderSkeletonItem()}</React.Fragment>
        ));
    }
  };

  return <View style={styles.container}>{renderItems()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  mainRectangle: {
    marginHorizontal: 10,
    marginBottom: 10,
    alignSelf: "center",
  },
  item: {
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  profileImage: {
    marginRight: 10,
  },
  nameRect: {
    marginLeft: 10,
    marginBottom: 5,
  },
  contentLine: {
    marginBottom: 5,
  },
  searchItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  userInfoContainer: {
    flexDirection: "row",
    padding: 4,
    borderBottomWidth: 0.25,
    borderBottomColor: colors.secondary,
  },
  profileImageSkeleton: {
    marginRight: 8,
    marginBottom: 10,
  },
  userInfoDetailsContainer: {
    flex: 1,
    justifyContent: "center",
  },
  userInfoNameSkeleton: {
    marginBottom: 8,
    borderRadius: 4,
  },
  userInfoRatingSkeleton: {
    marginBottom: 4,
    borderRadius: 4,
  },
  userInfoStatSkeleton: {
    marginBottom: 4,
    borderRadius: 4,
  },
  lineSkeleton: {
    marginBottom: 10,
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 8,
  },
  tabSkeleton: {
    borderRadius: 8,
  },
});

export default FlexibleSkeleton;

// Usage examples:

// 1. Grid layout for liked profiles
// <FlexibleSkeleton
//   type="grid"
//   itemCount={4}
//   columns={2}
//   hasProfileImage={true}
//   profileImagePosition="bottom"
//   contentLines={2}
// />

// 2. List layout for products
// <FlexibleSkeleton
//   type="list"
//   itemCount={5}
//   hasProfileImage={false}
//   contentLines={3}
// />

// 3. Search results layout
// <FlexibleSkeleton
//   type="search"
//   itemCount={5}
//   hasProfileImage={true}
//   profileImagePosition="left"
//   contentLines={1}
// />

// 4. Grid layout for product gallery
// <FlexibleSkeleton
//   type="grid"
//   itemCount={6}
//   columns={3}
//   hasProfileImage={false}
//   contentLines={1}
// />

// 5. List layout for chat messages
// <FlexibleSkeleton
//   type="list"
//   itemCount={10}
//   hasProfileImage={true}
//   profileImagePosition="left"
//   contentLines={2}
// />

// 6. User Info layout
// <FlexibleSkeleton
//   type="userInfo"
//   itemCount={1}
// />

// 7. Line skeleton layout
// <FlexibleSkeleton
//   type="line"
//   itemCount={3}
//   lineWidth="80%"
//   lineHeight={2}
// />
