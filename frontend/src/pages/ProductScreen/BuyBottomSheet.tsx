import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { BottomSheet } from "@rneui/themed";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { colors } from "../../colors/colors";
import { Product } from "../../interfaces/product";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import { useMutation, useQueryClient } from "react-query";
import { purchaseProduct } from "../../services/payment";

interface BuyBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  product: Product;
  onContinue: (paymentMethod: "inPerson" | "card", option: string) => void;
}

const RadioButton = ({ selected }: { selected: boolean }) => (
  <View
    style={[
      styles.radioButtonOuter,
      selected && styles.radioButtonOuterSelected,
    ]}
  >
    {selected && <View style={styles.radioButtonInner} />}
  </View>
);

const PaymentOption = ({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) => (
  <TouchableOpacity style={styles.paymentOption} onPress={onSelect}>
    <RadioButton selected={selected} />
    <Text
      style={[
        styles.paymentOptionText,
        selected && styles.paymentOptionTextSelected,
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

const PayInPersonRoute = ({
  selectedOption,
  onSelectOption,
}: {
  selectedOption: string;
  onSelectOption: (option: string) => void;
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.tabContent}>
      <PaymentOption
        label={t("pay-with-balance")}
        selected={selectedOption === "balance"}
        onSelect={() => onSelectOption("balance")}
      />
      <PaymentOption
        label={t("you-will-meet-and-pay")}
        selected={selectedOption === "meet"}
        onSelect={() => onSelectOption("meet")}
      />
    </View>
  );
};

const PayByCardRoute = ({
  selectedOption,
  onSelectOption,
}: {
  selectedOption: string;
  onSelectOption: (option: string) => void;
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.tabContent}>
      <PaymentOption
        label={t("pay-with-your-phone-cards")}
        selected={selectedOption === "nfc"}
        onSelect={() => onSelectOption("nfc")}
      />
      <PaymentOption
        label={t("pay-with-paypal")}
        selected={selectedOption === "paypal"}
        onSelect={() => onSelectOption("paypal")}
      />
    </View>
  );
};

const BuyBottomSheet: React.FC<BuyBottomSheetProps> = ({
  isVisible,
  onClose,
  product,
  onContinue,
}) => {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "payInPerson", title: "pay-in-person" },
    { key: "payByCard", title: "pay-by-card" },
  ]);
  const [selectedOption, setSelectedOption] = useState("balance");
  const { t } = useTranslation();

  // Reset state when the sheet is closed
  useEffect(() => {
    if (!isVisible) {
      setIndex(0);
      setSelectedOption("balance");
    }
  }, [isVisible]);

  const handleSelectOption = (option: string) => {
    setSelectedOption(option);
  };

  const renderScene = SceneMap({
    payInPerson: () => (
      <PayInPersonRoute
        selectedOption={selectedOption}
        onSelectOption={handleSelectOption}
      />
    ),
    payByCard: () => (
      <PayByCardRoute
        selectedOption={selectedOption}
        onSelectOption={handleSelectOption}
      />
    ),
  });

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      indicatorStyle={styles.tabIndicator}
      style={styles.tabBar}
      labelStyle={styles.tabLabel}
      activeColor={colors.primary}
      inactiveColor={colors.secondary}
      renderLabel={({ route, focused }) => (
        <Text
          style={[
            styles.tabLabel,
            { color: focused ? colors.primary : colors.secondary },
          ]}
        >
          {t(route.title || "")}
        </Text>
      )}
    />
  );

  const queryClient = useQueryClient();

  const purchaseMutation = useMutation(() => purchaseProduct(product._id), {
    onSuccess: () => {
      onClose();
      Toast.show({
        type: "success",
        text1: t("purchase-successful"),
        position: "bottom",
        visibilityTime: 3000,
      });
      queryClient.invalidateQueries(["product", product._id]);
      onContinue("inPerson", selectedOption);
    },

    onError: (error) => {
      console.error("Purchase failed:", error);
      Toast.show({
        type: "error",
        text1: t("purchase-failed"),
        text2: t("please-try-again"),
        position: "bottom",
        bottomOffset: 130,
        visibilityTime: 3000,
      });
    },
  });

  const handleContinue = () => {
    if (index === 0 && selectedOption === "meet") {
      purchaseMutation.mutate();
    } else {
      onClose();
      Toast.show({
        type: "info",
        text1: t("feature-not-available"),
        text2: t("coming-soon"),
        position: "bottom",
        bottomOffset: 130,
        visibilityTime: 3000,
      });
      onContinue(index === 0 ? "inPerson" : "card", selectedOption);
    }
  };

  return (
    <BottomSheet isVisible={isVisible} onBackdropPress={onClose}>
      <View style={styles.bottomSheetContent}>
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={(newIndex) => {
            setIndex(newIndex);
            setSelectedOption(newIndex === 0 ? "balance" : "nfc");
          }}
          initialLayout={{ width: Dimensions.get("window").width }}
          renderTabBar={renderTabBar}
          style={styles.tabView}
        />
        <View style={styles.productSummary}>
          <Image
            source={{ uri: `${product.images[0]}` }}
            style={styles.productImage}
          />
          <View style={styles.productInfo}>
            <Text style={styles.productTitle} numberOfLines={1}>
              {product.title}
            </Text>
            <Text style={styles.productPrice}>
              {t("total")}: ${product.price}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[
            styles.continueButton,
            purchaseMutation.isLoading && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={purchaseMutation.isLoading}
        >
          {purchaseMutation.isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.continueButtonText}>{t("continue")}</Text>
          )}
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  bottomSheetContent: {
    backgroundColor: "white",
    padding: 20,
    height: 550, // Increased height
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  tabView: {
    flex: 1,
  },
  tabBar: {
    backgroundColor: "white",
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 0,
  },
  tabLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  tabIndicator: {
    backgroundColor: colors.primary,
    height: 3,
  },
  tabContent: {
    flex: 1,
    justifyContent: "center", // Changed from flex-start to center
    alignItems: "stretch", // Changed from flex-start to stretch
    paddingHorizontal: 10,
  },
  paymentTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  paymentOptionText: {
    fontSize: 16,
    marginLeft: 15,
    color: colors.secondary,
  },
  radioButtonOuter: {
    height: 24,
    width: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  radioButtonInner: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  productSummary: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 24,
    backgroundColor: colors.lightGray,
    padding: 16,
    borderRadius: 12,
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
    marginLeft: 16,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
  },
  productPrice: {
    fontSize: 16,
    color: colors.primary,
    marginTop: 8,
  },
  continueButton: {
    backgroundColor: colors.primary,
    padding: 18,
    alignItems: "center",
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 36,
  },
  continueButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

  radioButtonOuterSelected: {
    borderColor: colors.primary,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },

  paymentOptionTextSelected: {
    color: colors.primary,
  },
});

export default BuyBottomSheet;
