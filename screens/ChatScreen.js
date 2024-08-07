import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
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
      await fetch(`${backendBaseUrl}/api/messages`, {
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
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.messageContainer}>
            <Text style={styles.sender}>
              {item.attributes.sender?.data?.attributes?.username}
            </Text>
            <Text style={styles.messageText}>{item.attributes.content}</Text>
            <Text style={styles.timestamp}>{item.attributes.timestamp}</Text>
          </View>
        )}
      />
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
    paddingHorizontal: 10,
    paddingBottom: 10,
    margin: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "lightgray",
    color: "white",
    borderRadius: 20,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: "blue",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendButtonText: {
    color: "white",
    fontSize: 16,
  },
  messageContainer: {
    marginVertical: 5,
  },
  sender: {
    fontWeight: "bold",
  },
  messageText: {
    marginVertical: 2,
  },
  timestamp: {
    fontSize: 12,
    color: "gray",
  },
});

export default ChatScreen;
