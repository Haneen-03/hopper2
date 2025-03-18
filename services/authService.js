// services/authService.js
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    getIdTokenResult
  } from 'firebase/auth';
  import { doc, setDoc, getDoc } from 'firebase/firestore';
  import { auth, db } from '../firebase';
  
  // Sign up with email and password
  export const signUp = async (email, password, fullName, isAdmin = false) => {
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update user profile with full name
      await updateProfile(user, {
        displayName: fullName
      });
      
      // Create user document in Firestore with admin flag
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: email,
        fullName: fullName,
        isAdmin: isAdmin,
        createdAt: new Date().toISOString(),
      });
      
      return { user };
    } catch (error) {
      return { error };
    }
  };
  
  // Sign in with email and password
  export const signIn = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Get the user's custom claims
      const tokenResult = await getIdTokenResult(userCredential.user);
      
      // Also get the user's Firestore document to check isAdmin
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      const userData = userDoc.data();
      
      return { 
        user: userCredential.user,
        isAdmin: userData?.isAdmin || false
      };
    } catch (error) {
      return { error };
    }
  };
  
  // Sign out
  export const logOut = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { error };
    }
  };
  
  // Get current user
  export const getCurrentUser = () => {
    return auth.currentUser;
  };
  
  // Check if current user is an admin
  export const checkIsAdmin = async () => {
    const user = auth.currentUser;
    if (!user) return { isAdmin: false };
    
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        return { isAdmin: userDoc.data().isAdmin || false };
      }
      return { isAdmin: false };
    } catch (error) {
      console.error("Error checking admin status:", error);
      return { error, isAdmin: false };
    }
  };