// navigationRef.ts
import {
  NavigationContainerRef,
  ParamListBase,
} from "@react-navigation/native";
import * as React from "react";
import {
  AuthStackParamList,
  MainStackParamList,
  RootStackParamList,
} from "../interfaces/auth/navigation";

type CombinedParamList = AuthStackParamList &
  RootStackParamList &
  MainStackParamList;

export const navigationRef =
  React.createRef<NavigationContainerRef<CombinedParamList>>();

export function navigate<RouteName extends keyof CombinedParamList>(
  name: RouteName,
  params?: CombinedParamList[RouteName]
) {
  if (navigationRef.current) {
    // Use type assertion here
    (navigationRef.current.navigate as any)(name, params);
  } else {
    console.warn("Navigation ref is not set");
  }
}
