import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { colors } from "../../colors/colors";
import { editUser, getUserDetails } from "../../services/user";
import { BASE_URL } from "../../services/axiosConfig";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "../../interfaces/auth/navigation";
import Toast from "react-native-toast-message";
import ActionSheet, { ActionSheetRef } from "react-native-actions-sheet";
import ProfileImageSection from "./ProfileImageSection";
import SecuritySection from "./SecuritySection";
import CameraComponent from "../sell/CameraComponent";
import { Ionicons } from "@expo/vector-icons";

type EditProfileScreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  "EditProfile"
>;

type Props = {
  navigation: EditProfileScreenNavigationProp;
};

const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const firstNameRef = useRef<TextInput>(null);
  const lastNameRef = useRef<TextInput>(null);
  const bioRef = useRef<TextInput>(null);
  const actionSheetRef = useRef<ActionSheetRef>(null);

  const {
    data: userData,
    isLoading: userLoading,
    refetch: refetchUserDetails,
  } = useQuery("userDetails", getUserDetails);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [isProfileChanged, setIsProfileChanged] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const [initialUserData, setInitialUserData] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    profilePicture: null as string | null,
  });

  const updateNavigationOptions = useCallback(() => {
    navigation.setOptions({
      headerShown: !isCameraOpen,
      headerTitle: t("edit-profile"),
      headerTitleAlign: "center" as const,
      headerLeft: () =>
        isCameraOpen ? null : (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginLeft: 15 }}
          >
            <Ionicons
              name="chevron-back-sharp"
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>
        ),
      headerBackTitle: " ",
      headerStyle: {
        backgroundColor: "white",
      },
      headerTintColor: colors.primary,
      headerTitleStyle: {
        fontWeight: "bold",
      },
    });
  }, [navigation, isCameraOpen, t]);

  useEffect(() => {
    updateNavigationOptions();
  }, [updateNavigationOptions]);

  useEffect(() => {
    if (userData?.data.user) {
      const user = userData.data.user;
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setBio(user.bio || "");
      setProfilePicture(
        user.profilePicture ? `${BASE_URL}/${user.profilePicture}` : null
      );

      setInitialUserData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        bio: user.bio || "",
        profilePicture: user.profilePicture
          ? `${BASE_URL}/${user.profilePicture}`
          : null,
      });
    }
  }, [userData]);

  useEffect(() => {
    const isChanged =
      firstName !== initialUserData.firstName ||
      lastName !== initialUserData.lastName ||
      bio !== initialUserData.bio ||
      profilePicture !== initialUserData.profilePicture;

    setIsProfileChanged(isChanged);
  }, [firstName, lastName, bio, profilePicture, initialUserData]);

  const editUserMutation = useMutation(editUser, {
    onSuccess: () => {
      queryClient.invalidateQueries("userDetails");
      firstNameRef.current?.blur();
      lastNameRef.current?.blur();
      bioRef.current?.blur();
      Keyboard.dismiss();
      setIsProfileChanged(false);

      setInitialUserData({
        firstName,
        lastName,
        bio,
        profilePicture,
      });

      Toast.show({
        type: "success",
        text1: t("success"),
        text2: t("profile-updated"),
        position: "bottom",
        bottomOffset: 110,
      });
    },
    onError: () => {
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: t("update-failed"),
        position: "bottom",
        bottomOffset: 110,
      });
    },
  });

  const handleUpdateProfile = () => {
    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("bio", bio);

    if (profilePicture) {
      if (profilePicture.startsWith("file://")) {
        formData.append("profilePicture", {
          uri: profilePicture,
          type: "image/jpeg",
          name: "profile.jpg",
        } as any);
      }
    } else if (initialUserData.profilePicture && !profilePicture) {
      formData.append("removeProfilePicture", "true");
    }

    editUserMutation.mutate(formData);
  };

  const handleCaptureImage = (uri: string) => {
    setProfilePicture(uri);
    setIsCameraOpen(false);
  };

  const handleCloseCameraComponent = () => {
    setIsCameraOpen(false);
  };

  if (userLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" />
      </View>
    );
  }

  if (isCameraOpen) {
    return (
      <CameraComponent
        onCapture={handleCaptureImage}
        onClose={handleCloseCameraComponent}
        showGallery={false}
        onPickImages={() => {}}
        currentImageCount={0}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <ScrollView style={styles.scrollView}>
        <ProfileImageSection
          profilePicture={profilePicture}
          setProfilePicture={setProfilePicture}
          actionSheetRef={actionSheetRef}
          setIsCameraOpen={setIsCameraOpen}
        />

        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t("first-name")}</Text>
          <TextInput
            ref={firstNameRef}
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder={t("enter-first-name")}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t("last-name")}</Text>
          <TextInput
            ref={lastNameRef}
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder={t("enter-last-name")}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t("bio")}</Text>
          <TextInput
            ref={bioRef}
            style={styles.input}
            value={bio}
            onChangeText={setBio}
            placeholder={t("enter-bio")}
            multiline
          />
        </View>

        <SecuritySection navigation={navigation} />
      </ScrollView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            (!isProfileChanged || editUserMutation.isLoading) &&
              styles.disabledButton,
          ]}
          onPress={handleUpdateProfile}
          disabled={!isProfileChanged || editUserMutation.isLoading}
        >
          {editUserMutation.isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.saveButtonText}>{t("save")}</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: colors.secondary,
    flex: 1,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
    padding: 8,
    fontSize: 16,
    flex: 2,
  },
  buttonContainer: {
    padding: 16,
    marginBottom: 35,
    backgroundColor: colors.background,
  },
  saveButton: {
    backgroundColor: colors.customBlueDarker,
    padding: 12,
    borderRadius: 25,
    alignItems: "center",
    width: "100%",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default EditProfileScreen;
