import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView
} from "react-native";
import { WebSocketService } from "../services/WebSocketService";
import { format } from "date-fns";
import { backendBaseUrl } from "../services/WebSocketService";
import { useAuth } from "../context/AuthContext";
import { useRoute } from "@react-navigation/native";

const ChatScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const { isAuthenticated, activeUser, getToken } = useAuth();
  const route = useRoute();
  const { friendId } = route.params;

  useEffect(() => {
    if (!isAuthenticated) {
      navigation.navigate("Login");
    }
  }, [isAuthenticated, navigation]);

  useEffect(() => {
    let socket;

    const connectWebSocket = async () => {
      const token = await getToken();
      if (token) {
        socket = WebSocketService(token);

        socket.on("connect", () => {
          console.log("Connected to WebSocket");
        });

        socket.on("message:create", (message) => {
          setMessages((prevMessages) => [...prevMessages, message.data]);
        });
      }
    };

    fetchMessages();
    connectWebSocket();

    return () => {
      if (socket) {
        socket.off("message:create");
        socket.disconnect();
      }
    };
  }, []);

  const fetchMessages = async () => {
    const token = await getToken();
    try {
      const response = await fetch(
        `${backendBaseUrl}/api/messages?populate=*&filters[$or][0][sender][id][$eq]=${friendId}&filters[$or][0][recipient][id][$eq]=${activeUser.id}&filters[$or][1][sender][id][$eq]=${activeUser.id}&filters[$or][1][recipient][id][$eq]=${friendId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const responseData = await response.json();
      setMessages(responseData.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = async () => {
    if (messageInput.trim() === "") return;
    const newMessage = {
      data: {
        content: messageInput,
        sender: activeUser.id,
        recipient: friendId,
        timestamp: formattedDate(),
      },
    };

    try {
      const token = await getToken();
      await fetch(`${backendBaseUrl}/api/messages?populate=*`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newMessage),
      });

      setMessageInput("");
    } catch (error) {
      console.error("Error sending messages:", error);
    }
  };
  const formattedDate = () => {
    const currentDate = new Date();
    return format(currentDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.messageContainer}>
        {messages.map((item, index) => (
          <View
            key={item.id.toString()}
            style={[
              styles.message,
              item?.attributes?.sender?.data?.id === activeUser.id
                ? styles.sentMessage
                : styles.receivedMessage,
            ]}
          >
            <Text style={styles.messageText}>{item.attributes.content}</Text>
            <Text style={styles.timestamp}>{item.attributes.timestamp}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={messageInput}
          onChangeText={(text) => {
            setMessageInput(text);
          }}
          placeholder="Type a message..."
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  messageContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  message: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    marginVertical: 8,
    maxWidth: "80%",
  },
  sentMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#0084ff",
    color: "#fff",
  },
  receivedMessage: {
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
    color: "#333",
  },
  sendButton: {
    backgroundColor: "#0084ff",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginLeft: 8,
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default ChatScreen;
