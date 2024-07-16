import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { colors } from "../../colors/colors";
import * as ImagePicker from "expo-image-picker";
import { editUser, getLoggedUser } from "../../services/user";
import { BASE_URL } from "../../services/axiosConfig";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "../../interfaces/auth/navigation";
import Toast from "react-native-toast-message";
import { useLoggedUser } from "../../hooks/useLoggedUser";

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
  const { data: userData, isLoading: userLoading, refetch } = useLoggedUser();
  console.log(userData?.data.user.email);
  const [firstName, setFirstName] = useState(
    userData?.data.user.firstName || ""
  );
  const [lastName, setLastName] = useState(userData?.data.user.lastName || "");
  const [bio, setBio] = useState(userData?.data.user.bio || "");
  const [profilePicture, setProfilePicture] = useState(
    userData?.data.user.profilePicture
      ? `${BASE_URL}/${userData.data.user.profilePicture}`
      : null
  );

  const [isProfileChanged, setIsProfileChanged] = useState(false);
  useEffect(() => {
    if (userData?.data.user) {
      const isChanged =
        (firstName !== userData.data.user.firstName ||
          lastName !== userData.data.user.lastName ||
          bio !== userData.data.user.bio ||
          (profilePicture &&
            userData.data.user.profilePicture &&
            !profilePicture.startsWith(
              `${BASE_URL}/${userData.data.user.profilePicture}`
            ))) &&
        firstName.trim() !== "" &&
        lastName.trim() !== "";

      setIsProfileChanged(Boolean(isChanged));
    }
  }, [firstName, lastName, bio, profilePicture, userData]);

  const editUserMutation = useMutation(editUser, {
    onSuccess: () => {
      queryClient.invalidateQueries("loggedUser");
      firstNameRef.current?.blur();
      lastNameRef.current?.blur();
      bioRef.current?.blur();
      Keyboard.dismiss();
      setIsProfileChanged(false);
      Toast.show({
        type: "success",
        text1: t("success"),
        text2: t("profile-updated"),
        position: "bottom",
        bottomOffset: 110,
      });
      // navigation.goBack();
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

    if (profilePicture && !profilePicture.startsWith(BASE_URL)) {
      formData.append("profilePicture", {
        uri: profilePicture,
        type: "image/jpeg",
        name: "profile.jpg",
      });
    }
    editUserMutation.mutate(formData);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfilePicture(result.assets[0].uri);
    }
  };

  if (userLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.profileImageContainer}>
          {profilePicture ? (
            <Image
              source={{ uri: profilePicture }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="person" size={60} color={colors.lightGray} />
            </View>
          )}
          <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
            <Text style={styles.imageButtonText}>
              {t("edit-profile-picture")}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t("first-name")}</Text>
          <TextInput
            // ref={firstNameRef}
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder={t("enter-first-name")}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t("last-name")}</Text>
          <TextInput
            // ref={lastName}
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder={t("enter-last-name")}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t("bio")}</Text>
          <TextInput
            // ref={bio}
            style={styles.input}
            value={bio}
            onChangeText={setBio}
            placeholder={t("enter-bio")}
            multiline
          />
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{t("account-privacy")}</Text>
          <TouchableOpacity
            style={styles.securityButton}
            onPress={() => navigation.navigate("ChangeEmailScreen")}
          >
            <Text style={styles.securityButtonText}>{t("change-email")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.securityButton}
            onPress={() => navigation.navigate("ChangePasswordScreen")}
          >
            <Text style={styles.securityButtonText}>
              {t("change-password")}
            </Text>
          </TouchableOpacity>
        </View>
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
  profileImageContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
  },
  imageButton: {
    marginTop: 10,
  },
  imageButtonText: {
    fontWeight: "bold",
    color: colors.customBlue,
    fontSize: 16,
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
  sectionContainer: {
    paddingTop: 20,
    borderTopWidth: 10,
    borderTopColor: colors.lightGray,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.secondary,
    marginBottom: 10,
    height: 40,
    padding: 8,
  },
  securityButton: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  securityButtonText: {
    color: colors.customBlue,
    fontSize: 16,
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
