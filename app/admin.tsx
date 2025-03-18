// app/admin.tsx
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  Alert,
  ActivityIndicator,
  ImageBackground,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { getAllUsers, updateUserAdminStatus, getAppStatistics } from '../services/databaseService';
import AdminProtectedRoute from '../components/AdminProtectedRoute';

// Define TypeScript interfaces
interface User {
  id: string;
  fullName?: string;
  email?: string;
  isAdmin?: boolean;
  createdAt?: string;
  [key: string]: any; // Allow for additional properties
}

interface Statistics {
  totalUsers: number;
  recentUsers: number;
  [key: string]: any; // Allow for additional statistics
}

export default function AdminScreen() {
  return (
    <AdminProtectedRoute>
      <AdminDashboard />
    </AdminProtectedRoute>
  );
}

function AdminDashboard() {
  const { isAdmin, currentUser } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    // Redirect non-admin users
    if (!isAdmin) {
      Alert.alert('Access Denied', 'You do not have admin privileges.');
      router.replace('/dashboard');
      return;
    }
    
    fetchData();
  }, [isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch users
    const { users: fetchedUsers, error: usersError } = await getAllUsers();
    if (usersError) {
      console.error("Error fetching users:", usersError);
    } else {
      setUsers(fetchedUsers || []);
    }
    
    // Fetch statistics
    const { statistics: fetchedStats, error: statsError } = await getAppStatistics();
    if (statsError) {
      console.error("Error fetching statistics:", statsError);
    } else {
      setStatistics(fetchedStats || { totalUsers: 0, recentUsers: 0 });
    }
    
    setLoading(false);
  };

  const handleToggleAdmin = async (userId: string, currentAdminStatus: boolean) => {
    try {
      await updateUserAdminStatus(userId, !currentAdminStatus);
      // Update local state
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, isAdmin: !currentAdminStatus } 
          : user
      ));
      Alert.alert('Success', 'User admin status updated');
    } catch (error) {
      Alert.alert('Error', 'Failed to update user admin status');
      console.error(error);
    }
  };

  const filteredUsers = searchQuery 
    ? users.filter(user => 
        user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : users;

  return (
    <ImageBackground
      source={require("../assets/images/thefillbac.png")}
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Admin Panel</Text>
          <TouchableOpacity onPress={() => router.push("/dashboard")}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0a2463" />
          </View>
        ) : (
          <ScrollView style={styles.scrollView}>
            {/* Statistics */}
            {statistics && (
              <View style={styles.statsContainer}>
                <Text style={styles.sectionTitle}>App Statistics</Text>
                <View style={styles.statsGrid}>
                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>{statistics.totalUsers}</Text>
                    <Text style={styles.statLabel}>Total Users</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>{statistics.recentUsers}</Text>
                    <Text style={styles.statLabel}>New Users (7d)</Text>
                  </View>
                  {/* Add more stats as needed */}
                </View>
              </View>
            )}
            
            {/* Admin Actions */}
            <View style={styles.actionsContainer}>
              <Text style={styles.sectionTitle}>Admin Actions</Text>
              <TouchableOpacity 
                style={styles.actionCard}
                onPress={() => router.push('/admin/services')}
              >
                <Ionicons name="grid-outline" size={24} color="#0a2463" />
                <Text style={styles.actionText}>Manage Services</Text>
                <Ionicons name="chevron-forward" size={20} color="#0a2463" />
              </TouchableOpacity>
              
              {/* Add more admin actions as needed */}
            </View>
            
            {/* User Management */}
            <View style={styles.usersContainer}>
              <Text style={styles.sectionTitle}>User Management</Text>
              
              {/* Search */}
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="gray" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search users..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholderTextColor="gray"
                />
              </View>
              
              {/* Users List */}
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <View key={user.id} style={styles.userCard}>
                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>{user.fullName || 'Unnamed User'}</Text>
                      <Text style={styles.userEmail}>{user.email || 'No Email'}</Text>
                      <Text style={styles.userRole}>
                        {user.isAdmin ? 'Admin' : 'Regular User'}
                      </Text>
                    </View>
                    <View style={styles.userActions}>
                      {user.id !== currentUser?.uid && (
                        <TouchableOpacity
                          style={[
                            styles.adminToggleButton,
                            { backgroundColor: user.isAdmin ? '#dc3545' : '#28a745' }
                          ]}
                          onPress={() => handleToggleAdmin(user.id, Boolean(user.isAdmin))}
                        >
                          <Text style={styles.adminToggleText}>
                            {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.noResultsText}>No users found</Text>
              )}
            </View>
          </ScrollView>
        )}

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => router.push("/")}
          >
            <Ionicons name="person" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => router.push("/football")}
          >
            <Ionicons name="football" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => router.push("/dashboard")}
          >
            <Ionicons name="home" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0a2463',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    marginHorizontal: 16,
    borderRadius: 10,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  statCard: {
    backgroundColor: '#0a2463',
    borderRadius: 8,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 14,
    color: 'white',
    marginTop: 4,
  },
  actionsContainer: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    marginHorizontal: 16,
    borderRadius: 10,
    marginBottom: 16,
  },
  actionCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0a2463',
    flex: 1,
    marginLeft: 12,
  },
  usersContainer: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    marginHorizontal: 16,
    borderRadius: 10,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#0a2463',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    height: 40,
    flex: 1,
  },
  userCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userInfo: {
    marginBottom: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0a2463',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  userRole: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginTop: 4,
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  adminToggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  adminToggleText: {
    color: 'white',
    fontWeight: '500',
  },
  noResultsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#0a2463',
    height: 60,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    padding: 10,
  },
});