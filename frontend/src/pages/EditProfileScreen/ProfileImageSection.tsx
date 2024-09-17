import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../colors/colors";
import * as ImagePicker from "expo-image-picker";
import UndefProfPicture from "../../components/UndefProfPicture/UndefProfPicture";
import ActionSheet, { ActionSheetRef } from "react-native-actions-sheet";
import Toast from "react-native-toast-message";

type Props = {
  profilePicture: string | null;
  setProfilePicture: (uri: string | null) => void;
  actionSheetRef: React.RefObject<ActionSheetRef>;
  setIsCameraOpen: (isOpen: boolean) => void;
};

const ProfileImageSection: React.FC<Props> = ({
  profilePicture,
  setProfilePicture,
  actionSheetRef,
  setIsCameraOpen,
}) => {
  const { t } = useTranslation();

  const openActionSheet = () => {
    actionSheetRef.current?.show();
  };

  const openCamera = () => {
    setIsCameraOpen(true);
    actionSheetRef.current?.hide();
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setProfilePicture(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: t("gallery-error"),
        position: "bottom",
        bottomOffset: 110,
      });
    }
    actionSheetRef.current?.hide();
  };

  const removePhoto = () => {
    setProfilePicture(null);
    actionSheetRef.current?.hide();
  };

  return (
    <View style={styles.profileImageContainer}>
      {profilePicture ? (
        <Image source={{ uri: profilePicture }} style={styles.profileImage} />
      ) : (
        <UndefProfPicture size={120} iconSize={60} />
      )}
      <TouchableOpacity style={styles.imageButton} onPress={openActionSheet}>
        <Text style={styles.imageButtonText}>{t("edit-profile-picture")}</Text>
      </TouchableOpacity>

      <ActionSheet ref={actionSheetRef}>
        <View style={styles.actionSheetContainer}>
          <TouchableOpacity
            style={styles.actionSheetButton}
            onPress={openCamera}
          >
            <Ionicons name="camera" size={24} color={colors.primary} />
            <Text style={styles.actionSheetButtonText}>
              {t("take-picture")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionSheetButton}
            onPress={pickImage}
          >
            <Ionicons name="images" size={24} color={colors.primary} />
            <Text style={styles.actionSheetButtonText}>
              {t("choose-from-gallery")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionSheetButton,
              !profilePicture && styles.disabledButton,
            ]}
            onPress={removePhoto}
            disabled={!profilePicture}
          >
            <Ionicons name="trash" size={24} color={colors.danger} />
            <Text style={styles.actionSheetButtonTextDEL}>
              {t("remove-photo")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionSheetCancelButton}
            onPress={() => actionSheetRef.current?.hide()}
          >
            <Text style={styles.actionSheetCancelButtonText}>
              {t("cancel")}
            </Text>
          </TouchableOpacity>
        </View>
      </ActionSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  profileImageContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  imageButton: {
    marginTop: 10,
  },
  imageButtonText: {
    fontWeight: "bold",
    color: colors.customBlue,
    fontSize: 16,
  },
  actionSheetContainer: {
    padding: 16,
  },
  actionSheetButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  actionSheetButtonText: {
    marginLeft: 16,
    fontSize: 16,
    color: colors.primary,
  },
  actionSheetButtonTextDEL: {
    marginLeft: 16,
    fontSize: 16,
    color: colors.danger,
  },
  actionSheetCancelButton: {
    paddingVertical: 16,
    alignItems: "center",
  },
  actionSheetCancelButtonText: {
    fontSize: 16,
    // fontWeight: "bold",
    color: colors.secondary,
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default ProfileImageSection;
