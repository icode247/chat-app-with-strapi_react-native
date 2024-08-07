// AuthContext.js
import React, { createContext, useContext, useState } from "react";
import { backendBaseUrl } from "../services/WebSocketService";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authError, setAuthError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeUser, setActiveUser] = useState(null);

  const saveToken = async (token) => {
    try {
      await AsyncStorage.setItem("authToken", token);
    } catch (error) {
      console.error("Error saving token:", error);
    }
  };

  const getToken = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      return token;
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  };

  // Clear token
  const clearToken = async () => {
    try {
      await AsyncStorage.removeItem("authToken");
    } catch (error) {
      console.error("Error clearing token:", error);
    }
  };
  const register = (username, email, password) => {
    return fetch(`${backendBaseUrl}/api/auth/local/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        email: email,
        password: password,
      }),
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.jwt) {
          return true;
        } else {
          setAuthError("Invalid details");
          return false;
        }
      })
      .catch((error) => {
        console.error(error);
        setAuthError("Error creating user");
        return false;
      });
  };

  const login = (email, password) => {
    return fetch(`${backendBaseUrl}/api/auth/local/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identifier: email,
        password: password,
      }),
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.jwt) {
          setIsAuthenticated(true);
          saveToken(responseData.jwt);
          setActiveUser(responseData.user);
          return true;
        } else {
          setAuthError("Incorrect email or password");
          return false;
        }
      })
      .catch((error) => {
        console.error(error);
        setAuthError("Error occurred");
        return false;
      });
  };

  const logout = () => {
    saveToken(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        register,
        login,
        logout,
        authError,
        getToken,
        clearToken,
        activeUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
