import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { MainStackParamList } from "../interfaces/auth/navigation";
import MainTabs from "./MainTabs";
import UserProfile from "../components/UserProfile/index";
import ChatScreen from "../components/Chat/chat";
import LikesPage from "../components/LikePage/likePage";
import MessageScreen from "../components/Messages/messageScreen";

const MainStack = createStackNavigator<MainStackParamList>();

const MainNavigator = () => (
  <MainStack.Navigator screenOptions={{ headerShown: false }}>
    <MainStack.Screen name="MainTabs" component={MainTabs} />
    <MainStack.Screen name="UserProfile" component={UserProfile} />
    <MainStack.Screen name="Chat" component={ChatScreen} />
    <MainStack.Screen name="Likes" component={LikesPage} />
    <MainStack.Screen name="Messages" component={MessageScreen} />
  </MainStack.Navigator>
);

export default MainNavigator;
