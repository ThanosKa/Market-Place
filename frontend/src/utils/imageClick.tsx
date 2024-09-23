import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  FlatList,
  SafeAreaView,
  Text,
} from "react-native";
import { Feather } from "@expo/vector-icons";

interface ImageViewerModalProps {
  images: string[];
  isVisible: boolean;
  onClose: () => void;
  initialIndex?: number; // Add this prop
}

const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  images,
  isVisible,
  onClose,
  initialIndex = 0, // Default to 0 if not provided
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(initialIndex);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (isVisible && flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index: initialIndex,
        animated: false,
      });
    }
  }, [isVisible, initialIndex]);

  const renderImageViewerItem = ({ item }: { item: string }) => (
    <View style={styles.imageViewerItem}>
      <Image
        source={{ uri: `${item}` }}
        style={styles.fullScreenImage}
        resizeMode="contain"
      />
    </View>
  );

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Feather name="x" style={styles.closeButtonText} />
        </TouchableOpacity>
        <FlatList
          ref={flatListRef}
          data={images}
          renderItem={renderImageViewerItem}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const contentOffset = event.nativeEvent.contentOffset;
            const viewSize = event.nativeEvent.layoutMeasurement;
            const pageNum = Math.floor(contentOffset.x / viewSize.width);
            setCurrentImageIndex(Math.max(0, pageNum));
          }}
          getItemLayout={(data, index) => ({
            length: Dimensions.get("window").width,
            offset: Dimensions.get("window").width * index,
            index,
          })}
        />
        <View style={styles.imageCounterContainer}>
          <Text style={styles.imageCounter}>
            {currentImageIndex + 1} / {images.length}
          </Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 1,
    padding: 10,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 24,
  },
  imageViewerItem: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenImage: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height - 100,
  },
  imageCounterContainer: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  imageCounter: {
    color: "#fff",
    fontSize: 16,
  },
});

export default ImageViewerModal;
