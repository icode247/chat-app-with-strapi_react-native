import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { backendBaseUrl } from "../services/WebSocketService";
import { useAuth } from "../context/AuthContext";

const FriendsScreen = () => {
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const { isAuthenticated, activeUser } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigation.navigate("Login");
    }
  }, [isAuthenticated, navigation]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(
        `${backendBaseUrl}/api/users?filters[id][$ne]=${activeUser.id}`
      );
      const usersData = await response.json();
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    if (activeUser) {
      fetchUsers();
    }
  }, [activeUser]);

  const handleFriendPress = (friendId) => {
    navigation.navigate("Chat", { friendId });
  };

  const renderFriendItem = ({ item }) => {
    return (
      <TouchableOpacity onPress={() => handleFriendPress(item.id)}>
        <View style={{ padding: 16 }}>
          <Text>{item.username}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Friend Lists</Text>
        <FlatList
          data={users}
          renderItem={renderFriendItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.flatList}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    margin: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  flatList: {
    flexGrow: 1,
  },
});

export default FriendsScreen;
