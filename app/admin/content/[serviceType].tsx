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
import { collection, query, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, addDoc, where } from 'firebase/firestore';
import { db } from '../../../firebase';
import AdminProtectedRoute from '../../../components/AdminProtectedRoute';

// Define interface for content items
interface ContentItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  price?: string;
  location?: string;
  cuisineType?: string;
  priceRange?: string;
  provider?: string;
  dataAmount?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any; // Allow for any additional properties
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
          // If not found by 'id', try direct document ID
          const directDocRef = doc(db, 'services', String(serviceType));
          const directDocSnap = await getDoc(directDocRef);
          
          if (directDocSnap.exists()) {
            console.log(`Found service document directly: ${serviceType}`);
            setServiceDocId(String(serviceType));
          } else {
            // Create the service if it doesn't exist
            console.log(`No service found, creating with ID: ${serviceType}`);
            const newServiceRef = doc(db, 'services', String(serviceType));
            await setDoc(newServiceRef, {
              id: String(serviceType),
              name: serviceTitle || String(serviceType),
              createdAt: new Date().toISOString()
            });
            setServiceDocId(String(serviceType));
          }
        }
      } catch (error) {
        console.error('Error finding service document ID:', error);
        Alert.alert('Error', `Failed to find service: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    findServiceDocId();
  }, [serviceType, serviceTitle]);

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
          console.log(`Item: ${doc.id}, Title: ${doc.data().title || 'No title'}`);
          return {
            id: doc.id,
            ...doc.data()
          } as ContentItem;
        });
        
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

  // Open edit modal function
  const openEditModal = (item: ContentItem): void => {
    console.log("EDIT: Opening edit modal for item:", item.id, item.title);
    
    // Make a deep copy of the item to avoid reference issues
    const itemCopy: ContentItem = {
      id: item.id,
      title: item.title || "",
      description: item.description || "",
      price: item.price || "",
      location: item.location || "",
      imageUrl: item.imageUrl || "",
      cuisineType: item.cuisineType || "",
      priceRange: item.priceRange || "",
      provider: item.provider || "",
      dataAmount: item.dataAmount || ""
    };
    
    console.log("EDIT: Setting current item with ID:", itemCopy.id);
    setIsEditing(true);
    setCurrentItem(itemCopy);
    setModalVisible(true);
  };

  // Save function with proper TypeScript typing
  const handleSaveItem = async (): Promise<void> => {
    if (!currentItem.title || !currentItem.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
  
    if (!serviceDocId) {
      Alert.alert('Error', 'Service not found in database');
      return;
    }
  
    try {
      if (isEditing && currentItem.id) {
        console.log(`SAVE: Updating existing item: ${currentItem.id}`);
        
        // Create update data with proper typing
        const updateData: Partial<ContentItem> = {
          title: currentItem.title,
          description: currentItem.description,
          updatedAt: new Date().toISOString()
        };
        
        // Add service-specific fields
        if (currentItem.price) updateData.price = currentItem.price;
        if (currentItem.location) updateData.location = currentItem.location;
        if (currentItem.imageUrl) updateData.imageUrl = currentItem.imageUrl;
        if (currentItem.cuisineType) updateData.cuisineType = currentItem.cuisineType;
        if (currentItem.priceRange) updateData.priceRange = currentItem.priceRange;
        if (currentItem.provider) updateData.provider = currentItem.provider;
        if (currentItem.dataAmount) updateData.dataAmount = currentItem.dataAmount;
        
        console.log(`SAVE: Update data:`, updateData);
        console.log(`SAVE: Path: services/${serviceDocId}/items/${currentItem.id}`);
        
        // Get document reference and update
        const docRef = doc(db, 'services', serviceDocId, 'items', currentItem.id);
        await updateDoc(docRef, updateData);
        
        console.log(`SAVE: Document updated successfully`);
        
        // Update local state with type safety
        setItems(prevItems => 
          prevItems.map(item => 
            item.id === currentItem.id 
              ? { ...item, ...updateData } 
              : item
          )
        );
        
        Alert.alert('Success', 'Item updated successfully');
      } else {
        console.log(`SAVE: Creating new item`);
        
        // Prepare new item data with proper typing
        const newItemData: Partial<ContentItem> = {
          title: currentItem.title,
          description: currentItem.description,
          createdAt: new Date().toISOString()
        };
        
        // Add service-specific fields
        if (currentItem.price) newItemData.price = currentItem.price;
        if (currentItem.location) newItemData.location = currentItem.location;
        if (currentItem.imageUrl) newItemData.imageUrl = currentItem.imageUrl;
        if (currentItem.cuisineType) newItemData.cuisineType = currentItem.cuisineType;
        if (currentItem.priceRange) newItemData.priceRange = currentItem.priceRange;
        if (currentItem.provider) newItemData.provider = currentItem.provider;
        if (currentItem.dataAmount) newItemData.dataAmount = currentItem.dataAmount;
        
        console.log(`SAVE: New item data:`, newItemData);
        
        // Create reference and add document
        const itemsCollRef = collection(db, 'services', serviceDocId, 'items');
        const newItemRef = await addDoc(itemsCollRef, newItemData);
        
        console.log(`SAVE: New item added with ID: ${newItemRef.id}`);
        
        // Add to local state with type assertion
        const newItemWithId: ContentItem = { 
          ...newItemData, 
          id: newItemRef.id 
        } as ContentItem;
        
        setItems(prevItems => [...prevItems, newItemWithId]);
        
        Alert.alert('Success', 'Item added successfully');
      }
      
      // Close modal and reset form regardless of operation
      setModalVisible(false);
      setCurrentItem({ id: '', title: '', description: '' });
      setIsEditing(false);
    } catch (error: unknown) {
      console.error('Error saving item:', error);
      
      // Properly handle unknown error type
      let errorMessage = "Unknown error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
      
      Alert.alert('Error', 'Failed to save item: ' + errorMessage);
    }
  };

  // Delete function with proper TypeScript typing
  const handleDeleteItem = async (itemId: string): Promise<void> => {
    console.log(`DELETE: Button pressed for item ID: ${itemId}`);
    
    // Check if we have a valid ID
    if (!itemId || typeof itemId !== 'string') {
      console.error(`DELETE: Invalid item ID provided: ${itemId}, type: ${typeof itemId}`);
      Alert.alert("Error", "Cannot delete item: Invalid ID");
      return;
    }
    
    // Check if service ID is available
    if (!serviceDocId) {
      console.error(`DELETE: No service document ID available`);
      Alert.alert("Error", "Cannot delete: Service not found");
      return;
    }
    
    // Look up the item to be deleted
    const itemToDelete = items.find(item => item.id === itemId);
    console.log(`DELETE: Found item to delete:`, itemToDelete);
    
    // Create the confirmation alert
    Alert.alert(
      "Delete Confirmation",
      `Are you sure you want to delete ${itemToDelete?.title || 'this item'}?`,
      [
        { 
          text: "Cancel", 
          style: "cancel",
          onPress: () => console.log("DELETE: User cancelled deletion")
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              console.log(`DELETE: User confirmed. Deleting item at path: services/${serviceDocId}/items/${itemId}`);
              
              // Use a direct approach to delete
              const db_ref = doc(db, 'services', serviceDocId, 'items', itemId);
              await deleteDoc(db_ref);
              console.log(`DELETE: Document successfully deleted from Firestore`);
              
              // Update local state
              setItems(items.filter(item => item.id !== itemId));
              console.log(`DELETE: Local state updated, removed item: ${itemId}`);
              
              // Show success message
              Alert.alert("Success", "Item deleted successfully");
            } catch (error: unknown) {
              console.error("DELETE ERROR:", error);
              let errorMessage = "Unknown error";
              
              if (error instanceof Error) {
                errorMessage = error.message;
                console.error("Error details:", {
                  name: error.name,
                  message: error.message,
                  stack: error.stack
                });
              }
              
              Alert.alert("Error", `Failed to delete item: ${errorMessage}`);
            }
          }
        }
      ],
      { cancelable: true }
    );
  };

  const openAddModal = () => {
    console.log("Opening add modal");
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
                      {item.description && item.description.length > 100 
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
                    
                    {/* Show ID for debugging */}
                    <Text style={styles.itemIdText}>ID: {item.id}</Text>
                  </View>
                  <View style={styles.itemActions}>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.editButton]}
                      onPress={() => {
                        console.log("Edit button pressed for:", item.id);
                        openEditModal(item);
                      }}
                    >
                      <Ionicons name="create-outline" size={20} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => {
                        console.log("Delete button pressed for:", item.id);
                        handleDeleteItem(item.id);
                      }}
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
              
              {/* Show item ID in edit mode */}
              {isEditing && currentItem.id && (
                <Text style={styles.itemIdText}>Editing Item ID: {currentItem.id}</Text>
              )}
              
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
                  <Text style={styles.saveButtonText}>
                    {isEditing ? 'Update' : 'Save'}
                  </Text>
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
    paddingVertical: 4,
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
  itemIdText: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
    fontStyle: 'italic',
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