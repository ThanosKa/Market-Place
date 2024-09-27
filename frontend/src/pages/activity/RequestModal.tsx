import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { colors } from "../../colors/colors";
import UndefProfPicture from "../../components/UndefProfPicture/UndefProfPicture";
import {
  acceptPurchaseRequest,
  cancelPurchaseRequest,
} from "../../services/payment";

interface RequestModalProps {
  isVisible: boolean;
  onClose: () => void;
  buyer: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture: string;
  };
  product: {
    _id: string;
    title: string;
    images: string[];
  };
  onAccept: () => void;
  onDecline: () => void;
}

const RequestModal: React.FC<RequestModalProps> = ({
  isVisible,
  onClose,
  buyer,
  product,
  onAccept,
  onDecline,
}) => {
  const { t } = useTranslation();
  const [isAcceptLoading, setIsAcceptLoading] = useState(false);
  const [isDeclineLoading, setIsDeclineLoading] = useState(false);

  const handleAccept = async () => {
    setIsAcceptLoading(true);
    try {
      await acceptPurchaseRequest(product._id);
      onAccept();
    } catch (error) {
      console.error("Error accepting purchase request:", error);
    } finally {
      setIsAcceptLoading(false);
    }
  };

  const handleDecline = async () => {
    setIsDeclineLoading(true);
    try {
      await cancelPurchaseRequest(product._id);
      onDecline();
    } catch (error) {
      console.error("Error declining purchase request:", error);
    } finally {
      setIsDeclineLoading(false);
    }
  };

  return (
    <Modal visible={isVisible} transparent={true} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.primary} />
          </TouchableOpacity>

          <View style={styles.buyerInfo}>
            {buyer.profilePicture ? (
              <Image
                source={{ uri: buyer.profilePicture }}
                style={styles.buyerImage}
              />
            ) : (
              <UndefProfPicture size={80} iconSize={40} />
            )}
            <Text
              style={styles.buyerName}
            >{`${buyer.firstName} ${buyer.lastName}`}</Text>
          </View>

          <Text style={styles.requestText}>
            {t("wants-to-buy-your-product")}
          </Text>

          <Image
            source={{ uri: product.images[0] }}
            style={styles.productImage}
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.acceptButton,
                (isAcceptLoading || isDeclineLoading) && styles.disabledButton,
              ]}
              onPress={handleAccept}
              disabled={isAcceptLoading || isDeclineLoading}
            >
              {isAcceptLoading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.buttonText}>{t("accept")}</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.declineButton,
                (isAcceptLoading || isDeclineLoading) && styles.disabledButton,
              ]}
              onPress={handleDecline}
              disabled={isAcceptLoading || isDeclineLoading}
            >
              {isDeclineLoading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.buttonText}>{t("decline")}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    width: "80%",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  buyerInfo: {
    alignItems: "center",
    marginBottom: 20,
  },
  buyerImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  buyerName: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
  },
  requestText: {
    fontSize: 16,
    color: colors.secondary,
    marginBottom: 20,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },

  acceptButton: {
    backgroundColor: colors.customBlue,
  },
  declineButton: {
    backgroundColor: colors.danger,
  },

  disabledButton: {
    opacity: 0.5,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 100,
  },
  buttonText: {
    color: colors.white,
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default RequestModal;
