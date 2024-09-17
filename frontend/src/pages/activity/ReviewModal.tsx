import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { colors } from "../../colors/colors";
import { Ionicons } from "@expo/vector-icons";
import { BASE_URL } from "../../services/axiosConfig";
import { useTranslation } from "react-i18next";
import { createReview } from "../../services/reviews";
import { markAllActivitiesAsRead } from "../../services/activity";

const { width } = Dimensions.get("window");
const MODAL_WIDTH = width * 0.9;

interface ReviewModalProps {
  isVisible: boolean;
  onClose: () => void;
  productId?: string;
  productName?: string;
  productImage?: string;
  revieweeId?: string; // Add this prop for the seller's ID
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  isVisible,
  onClose,
  productId,
  productName,
  productImage,
  revieweeId,
}) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = async () => {
    if (!productId || !revieweeId) {
      console.error("Missing productId or revieweeId");
      return;
    }
    console.log(productId, revieweeId);
    setIsSubmitting(true);
    try {
      await createReview({
        revieweeId,
        productId,
        rating,
        comment: review,
      });
      onClose();
      await markAllActivitiesAsRead();
    } catch (error) {
      console.error("Error submitting review:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.secondary} />
          </TouchableOpacity>

          <Image
            source={{ uri: `${BASE_URL}${productImage}` }}
            style={styles.productImage}
          />

          <Text style={styles.productName}>{productName}</Text>

          <Text style={styles.ratingLabel}>{t("your-rating")}</Text>
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <Ionicons
                  name={rating >= star ? "star" : "star-outline"}
                  size={32}
                  color={
                    rating >= star ? colors.starYellow : colors.senderBubble
                  }
                />
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.input}
            placeholder={t("share-thoughts-placeholder")}
            multiline
            numberOfLines={4}
            onChangeText={setReview}
            value={review}
          />

          <TouchableOpacity
            style={[
              styles.submitButton,
              !rating && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!rating || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>{t("submit-review")}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    width: MODAL_WIDTH,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    position: "absolute",
    right: 15,
    top: 15,
    zIndex: 1,
  },
  productImage: {
    width: MODAL_WIDTH * 0.5,
    height: MODAL_WIDTH * 0.5,
    borderRadius: 10,
    marginBottom: 15,
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    color: colors.primary,
  },
  ratingLabel: {
    fontSize: 16,
    marginBottom: 10,
    color: colors.secondary,
  },
  ratingContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  input: {
    height: 100,
    width: MODAL_WIDTH * 0.8,
    borderColor: colors.senderBubble,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 20,
    padding: 10,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: colors.customBlue,
    padding: 15,
    borderRadius: 25,
    width: MODAL_WIDTH * 0.8,
  },
  submitButtonDisabled: {
    backgroundColor: colors.lightGray,
  },
  submitButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
});

export default ReviewModal;
