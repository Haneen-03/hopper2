// components/AdminProtectedRoute.js
import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

const AdminProtectedRoute = ({ children }) => {
  const { currentUser, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!currentUser) {
        // User is not authenticated, redirect to login
        router.replace('/');
      } else if (!isAdmin) {
        // User is authenticated but not an admin
        Alert.alert(
          'Access Denied', 
          'You do not have permission to access this area.',
          [{ text: 'OK', onPress: () => router.replace('/dashboard') }]
        );
      }
    }
  }, [currentUser, isAdmin, loading, router]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0a2463" />
      </View>
    );
  }

  // Only render children if user is authenticated and admin
  return (currentUser && isAdmin) ? children : null;
};

export default AdminProtectedRoute;