import io from "socket.io-client";
import { Platform } from "react-native";

export const backendBaseUrl =
  Platform.OS === "android"
    ? "http://10.0.2.2:1337"
    : "http://localhost:1337";

export const WebSocketService = () => {
  const socket = io(backendBaseUrl);
  return socket;
};
