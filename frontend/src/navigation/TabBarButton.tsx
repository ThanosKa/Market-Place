import React, { useRef, useCallback } from "react";
import { TouchableOpacity, GestureResponderEvent } from "react-native";
import { NavigationProp, ParamListBase } from "@react-navigation/native";

interface TabBarButtonProps {
  props: any;
  navigation: NavigationProp<ParamListBase>;
  routeName: string;
}

const TabBarButton: React.FC<TabBarButtonProps> = ({
  props,
  navigation,
  routeName,
}) => {
  const lastTapTimeRef = useRef<number>(0);

  const handleDoubleTap = useCallback(() => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    if (now - lastTapTimeRef.current < DOUBLE_PRESS_DELAY) {
      navigation.setParams({ [`refresh${routeName}`]: Date.now() });
    }
    lastTapTimeRef.current = now;
  }, [navigation, routeName]);

  return (
    <TouchableOpacity
      {...props}
      onPress={(e: GestureResponderEvent) => {
        handleDoubleTap();
        if (props.onPress) {
          props.onPress(e);
        }
      }}
    />
  );
};

export default TabBarButton;
