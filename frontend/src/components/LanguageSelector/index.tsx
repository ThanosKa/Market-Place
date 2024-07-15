import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { SvgProps } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import GreekFlag from "../../../assets/flags/greekFlag.svg";
import UkFlag from "../../../assets/flags/ukFlag.svg";
import { colors } from "../../colors/colors";

interface Language {
  code: string;
  name: string;
  Flag: React.FC<SvgProps>;
}

const LanguageSelector: React.FC = () => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const { i18n, t } = useTranslation();

  const languages: Language[] = [
    { code: "en", name: "English", Flag: UkFlag },
    { code: "gr", name: "Ελληνικά", Flag: GreekFlag },
  ];

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Text>{i18n.language === "en" ? "English" : "Ελληνικά"}</Text>
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalView}>
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={styles.languageOption}
              onPress={() => changeLanguage(lang.code)}
            >
              <lang.Flag width={30} height={20} />
              <Text style={styles.languageName}>{lang.name}</Text>
              {i18n.language === lang.code && (
                <Ionicons name="checkmark" size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
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
  languageOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  languageName: {
    marginLeft: 10,
    fontSize: 16,
  },
});

export default LanguageSelector;
