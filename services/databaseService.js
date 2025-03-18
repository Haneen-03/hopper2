// services/databaseService.js
import { 
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    getDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where,
    orderBy,
    limit
  } from 'firebase/firestore';
  import { db } from '../firebase';
  
  // Add data to a collection
  export const addData = async (collectionName, data) => {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: new Date().toISOString(),
      });
      return { id: docRef.id };
    } catch (error) {
      return { error };
    }
  };
  
  // Get all documents from a collection
  export const getData = async (collectionName) => {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return { data };
    } catch (error) {
      return { error };
    }
  };
  
  // Get a specific document by ID
  export const getDocumentById = async (collectionName, documentId) => {
    try {
      const docRef = doc(db, collectionName, documentId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { data: { id: docSnap.id, ...docSnap.data() } };
      } else {
        return { error: "Document not found" };
      }
    } catch (error) {
      return { error };
    }
  };
  
  // Update a document
  export const updateData = async (collectionName, documentId, data) => {
    try {
      const docRef = doc(db, collectionName, documentId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      return { error };
    }
  };
  
  // Delete a document
  export const deleteData = async (collectionName, documentId) => {
    try {
      await deleteDoc(doc(db, collectionName, documentId));
      return { success: true };
    } catch (error) {
      return { error };
    }
  };
  
  // Query documents
  export const queryData = async (collectionName, field, operator, value) => {
    try {
      const q = query(collection(db, collectionName), where(field, operator, value));
      const querySnapshot = await getDocs(q);
      
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return { data };
    } catch (error) {
      return { error };
    }
  };
  
  // ADMIN SPECIFIC FUNCTIONS
  
  // Get all users (admin only)
  export const getAllUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const users = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return { users };
    } catch (error) {
      return { error };
    }
  };
  
  // Update user admin status (admin only)
  export const updateUserAdminStatus = async (userId, isAdmin) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        isAdmin: isAdmin,
        updatedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      return { error };
    }
  };
  
  // Get app statistics (admin only)
  export const getAppStatistics = async () => {
    try {
      // Get total number of users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const totalUsers = usersSnapshot.size;
      
      // Get recent users (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentUsersQuery = query(
        collection(db, 'users'), 
        where('createdAt', '>=', sevenDaysAgo.toISOString())
      );
      const recentUsersSnapshot = await getDocs(recentUsersQuery);
      const recentUsers = recentUsersSnapshot.size;
      
      // Get any other statistics you need
      
      return { 
        statistics: {
          totalUsers,
          recentUsers,
          // Add other statistics
        }
      };
    } catch (error) {
      return { error };
    }
  };