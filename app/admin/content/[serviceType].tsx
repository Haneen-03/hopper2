// app/admin/content/[serviceType].tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert,
  ActivityIndicator,
  ImageBackground,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { collection, query, getDocs, doc, setDoc, deleteDoc, addDoc, where } from 'firebase/firestore';
import { db } from '../../../firebase';
import AdminProtectedRoute from '../../../components/AdminProtectedRoute';

// Define interface for content items
interface ContentItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  price?: string;
  [key: string]: any;
}

function ServiceContentManagement() {
  const router = useRouter();
  const { serviceType } = useLocalSearchParams();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState<ContentItem>({ id: '', title: '', description: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [serviceTitle, setServiceTitle] = useState('');
  const [serviceDocId, setServiceDocId] = useState('');

  // Convert serviceType param to readable title
  useEffect(() => {
    if (typeof serviceType === 'string') {
      // Convert 'hotels' to 'Hotels', etc.
      setServiceTitle(serviceType.charAt(0).toUpperCase() + serviceType.slice(1));
    }
  }, [serviceType]);

  // Find the actual Firestore document ID for this service type
  useEffect(() => {
    const findServiceDocId = async () => {
      if (!serviceType) return;

      try {
        console.log(`Finding document ID for service type: ${serviceType}`);
        
        // First try to find the service by its 'id' field
        const servicesCollection = collection(db, 'services');
        const servicesQuery = query(servicesCollection, where('id', '==', serviceType));
        const serviceSnapshot = await getDocs(servicesQuery);
        
        if (!serviceSnapshot.empty) {
          const docId = serviceSnapshot.docs[0].id;
          console.log(`Found service document ID by 'id' field: ${docId}`);
          setServiceDocId(docId);
        } else {
          // If not found by 'id', try finding by serviceType directly
          console.log(`No service found with id field: ${serviceType}, trying direct document ID`);
          
          // Check all services to find a match
          const allServicesSnapshot = await getDocs(servicesCollection);
          let found = false;
          
          allServicesSnapshot.forEach(doc => {
            console.log(`Checking service: ${doc.id}`, doc.data());
            
            // Check various fields for a match
            const data = doc.data();
            if (
              doc.id === serviceType || 
              data.id === serviceType || 
              data.name?.toLowerCase() === String(serviceType).toLowerCase()
            ) {
              console.log(`Found matching service: ${doc.id}`);
              setServiceDocId(doc.id);
              found = true;
            }
          });
          
          if (!found) {
            // Use serviceType as the document ID as a fallback
            console.log(`No matching service found, using serviceType as document ID: ${serviceType}`);
            setServiceDocId(String(serviceType));
          }
        }
      } catch (error) {
        console.error('Error finding service document ID:', error);
      }
    };

    findServiceDocId();
  }, [serviceType]);

  // Fetch content items for this service type
  useEffect(() => {
    if (serviceDocId) {
      fetchItems();
    }
  }, [serviceDocId]);

  const fetchItems = async () => {
    if (!serviceType || !serviceDocId) return;
    
    setLoading(true);
    try {
      console.log(`Fetching items for service type: ${serviceType} with doc ID: ${serviceDocId}`);
      
      // Create a reference to the subcollection for this service
      const itemsRef = collection(db, 'services', serviceDocId, 'items');
      const snapshot = await getDocs(itemsRef);
      
      console.log(`Found ${snapshot.size} items`);
      
      if (snapshot.empty) {
        setItems([]);
      } else {
        const itemsData = snapshot.docs.map(doc => {
          console.log(`Item: ${doc.id}`, doc.data());
          return {
            id: doc.id,
            ...doc.data()
          };
        }) as ContentItem[];
        
        setItems(itemsData);
      }
    } catch (error) {
      console.error(`Error fetching ${serviceType} items:`, error);
      Alert.alert('Error', `Failed to load ${serviceType} content: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveItem = async () => {
    if (!currentItem.title || !currentItem.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
  
    try {
      console.log(`Attempting to save item for service type: ${serviceType}`);
      
      // Step 1: Find the actual Firestore document ID for this service type
      const servicesCollection = collection(db, 'services');
      const servicesQuery = query(servicesCollection, where('id', '==', serviceType));
      const serviceSnapshot = await getDocs(servicesQuery);
      
      if (serviceSnapshot.empty) {
        console.error(`No service found with id: ${serviceType}`);
        Alert.alert('Error', `Service "${serviceType}" not found in database`);
        return;
      }
      
      const serviceDocId = serviceSnapshot.docs[0].id;
      console.log(`Found service document ID: ${serviceDocId}`);
  
      if (isEditing) {
        // Update existing item
        console.log(`Updating item: ${currentItem.id}`);
        const itemRef = doc(db, 'services', serviceDocId, 'items', currentItem.id);
        await setDoc(itemRef, {
          ...currentItem,
          updatedAt: new Date().toISOString()
        }, { merge: true });
        
        // Update local state
        setItems(items.map(item => 
          item.id === currentItem.id ? currentItem : item
        ));
        
        Alert.alert('Success', 'Item updated successfully');
      } else {
        // Add new item
        console.log(`Adding new item`);
        const itemsRef = collection(db, 'services', serviceDocId, 'items');
        const newItemRef = await addDoc(itemsRef, {
          ...currentItem,
          createdAt: new Date().toISOString()
        });
        
        console.log(`New item added with ID: ${newItemRef.id}`);
        
        // Add to local state
        setItems([...items, { ...currentItem, id: newItemRef.id }]);
        Alert.alert('Success', 'Item added successfully');
      }
      
      // Reset and close modal
      setModalVisible(false);
      setCurrentItem({ id: '', title: '', description: '' });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving item:', error);
      Alert.alert('Error', 'Failed to save item: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!serviceDocId) {
      Alert.alert('Error', 'Service not found in database');
      return;
    }

    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const itemRef = doc(db, 'services', serviceDocId, 'items', itemId);
              await deleteDoc(itemRef);
              setItems(items.filter(item => item.id !== itemId));
              Alert.alert('Success', 'Item deleted successfully');
            } catch (error) {
              console.error('Error deleting item:', error);
              Alert.alert('Error', 'Failed to delete item: ' + (error instanceof Error ? error.message : 'Unknown error'));
            }
          }
        }
      ]
    );
  };

  const openEditModal = (item: ContentItem) => {
    setCurrentItem(item);
    setIsEditing(true);
    setModalVisible(true);
  };

  const openAddModal = () => {
    setCurrentItem({ id: '', title: '', description: '' });
    setIsEditing(false);
    setModalVisible(true);
  };

  // Render different form fields based on service type
  const renderFormFields = () => {
    return (
      <>
        <TextInput
          style={styles.input}
          placeholder="Title"
          value={currentItem.title}
          onChangeText={(text) => setCurrentItem({...currentItem, title: text})}
        />
        
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description"
          value={currentItem.description}
          onChangeText={(text) => setCurrentItem({...currentItem, description: text})}
          multiline
        />
        
        {/* Additional fields based on service type */}
        {serviceType === 'hotels' && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Price per night"
              value={currentItem.price}
              onChangeText={(text) => setCurrentItem({...currentItem, price: text})}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Location"
              value={currentItem.location}
              onChangeText={(text) => setCurrentItem({...currentItem, location: text})}
            />
          </>
        )}
        
        {serviceType === 'restaurants' && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Cuisine Type"
              value={currentItem.cuisineType}
              onChangeText={(text) => setCurrentItem({...currentItem, cuisineType: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="Price Range (e.g., $$$)"
              value={currentItem.priceRange}
              onChangeText={(text) => setCurrentItem({...currentItem, priceRange: text})}
            />
          </>
        )}
        
        {serviceType === 'simCards' && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Provider"
              value={currentItem.provider}
              onChangeText={(text) => setCurrentItem({...currentItem, provider: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="Data Amount"
              value={currentItem.dataAmount}
              onChangeText={(text) => setCurrentItem({...currentItem, dataAmount: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="Price"
              value={currentItem.price}
              onChangeText={(text) => setCurrentItem({...currentItem, price: text})}
              keyboardType="numeric"
            />
          </>
        )}
        
        <TextInput
          style={styles.input}
          placeholder="Image URL"
          value={currentItem.imageUrl}
          onChangeText={(text) => setCurrentItem({...currentItem, imageUrl: text})}
        />
      </>
    );
  };

  return (
    <ImageBackground
      source={require("../../../assets/images/thefillbac.png")}
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push("/admin/services")}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Manage {serviceTitle}</Text>
          <TouchableOpacity onPress={openAddModal}>
            <Ionicons name="add-circle" size={24} color="#0a2463" />
          </TouchableOpacity>
        </View>

        {/* Service ID Display for Debugging */}
        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>Service Document ID: {serviceDocId || 'Not found'}</Text>
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0a2463" />
          </View>
        ) : (
          <ScrollView style={styles.scrollView}>
            {items.length > 0 ? (
              items.map((item) => (
                <View key={item.id} style={styles.itemCard}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemDescription}>
                      {item.description.length > 100 
                        ? item.description.substring(0, 100) + '...' 
                        : item.description}
                    </Text>
                    
                    {/* Display additional info based on service type */}
                    {item.price && (
                      <Text style={styles.itemDetail}>Price: {item.price}</Text>
                    )}
                    {item.location && (
                      <Text style={styles.itemDetail}>Location: {item.location}</Text>
                    )}
                    {item.cuisineType && (
                      <Text style={styles.itemDetail}>Cuisine: {item.cuisineType}</Text>
                    )}
                  </View>
                  <View style={styles.itemActions}>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.editButton]}
                      onPress={() => openEditModal(item)}
                    >
                      <Ionicons name="create-outline" size={20} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDeleteItem(item.id)}
                    >
                      <Ionicons name="trash-outline" size={20} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  No {serviceTitle} items found. Click the + button to add some.
                </Text>
              </View>
            )}
          </ScrollView>
        )}
        
        {/* Item Edit/Add Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {isEditing ? `Edit ${serviceTitle} Item` : `Add New ${serviceTitle} Item`}
              </Text>
              
              <ScrollView style={styles.formScrollView}>
                {renderFormFields()}
              </ScrollView>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleSaveItem}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

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
          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => router.push("/services/googleMaps")}
          >
            <Ionicons name="map-outline" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => router.push("/services/translation")}
          >
            <Ionicons name="chatbubbles-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

export default function ServiceContentManagementScreen() {
  return (
    <AdminProtectedRoute>
      <ServiceContentManagement />
    </AdminProtectedRoute>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0a2463',
  },
  debugContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  debugText: {
    fontSize: 12,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  formScrollView: {
    maxHeight: 400,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  itemCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
    marginBottom: 10,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0a2463',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  itemDetail: {
    fontSize: 14,
    color: '#333',
    marginTop: 2,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingTop: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: '#0a2463',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#0a2463',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: '#0a2463',
  },
  modalButtonText: {
    fontWeight: '500',
    color: '#333',
  },
  saveButtonText: {
    fontWeight: '500',
    color: 'white',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#0a2463',
    height: 60,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  navItem: {
    padding: 8,
  },
});