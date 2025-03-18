// import React from "react";
// import {
//   View,
//   TouchableOpacity,
//   Text,
//   StyleSheet,
//   ImageBackground,
//   ScrollView,
// } from "react-native";
// import { useNavigation } from "@react-navigation/native";
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// // Define your app's navigation structure
// type RootStackParamList = {
//   index: undefined;
//   explore: undefined;
//   // Add other routes as needed
// };

// // Create a typed navigation hook
// type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// const Login: React.FC = () => {
//   const navigation = useNavigation<LoginScreenNavigationProp>();

//   return (
//     <ImageBackground
//       source={require("../../assets/images/thefillbac.png")}
//       style={styles.container}
//     >
//       <ScrollView contentContainerStyle={styles.innerContainer}>
//         <View style={styles.formWrapper}>
//           <View style={styles.formContainer}>
//             <TouchableOpacity
//               style={styles.button}
//               onPress={() => navigation.navigate("index")}
//             >
//               <Text style={styles.buttonText}>SIGN IN</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.button}
//               onPress={() => navigation.navigate("explore")}
//             >
//               <Text style={styles.buttonText}>SIGN UP</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </ScrollView>
//     </ImageBackground>
//   );
// };

// const styles = StyleSheet.create({
//   // Your styles remain the same
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   innerContainer: {
//     width: "100%",
//     maxWidth: 500,
//     flexGrow: 1,
//     justifyContent: "flex-start",
//     alignItems: "center",
//     padding: 20,
//   },
//   formWrapper: {
//     flex: 1,
//     justifyContent: "flex-start",
//     alignItems: "center",
//     width: "100%",
//     paddingTop: 400,
//   },
//   formContainer: {
//     width: "100%",
//     maxWidth: 400,
//     backgroundColor: "rgba(255, 255, 255, 0.7)",
//     padding: 20,
//     borderRadius: 10,
//     elevation: 5,
//   },
//   button: {
//     backgroundColor: "#001D75",
//     paddingVertical: 18,
//     paddingHorizontal: 65,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 20,
//   },
//   buttonText: {
//     color: "#fff",
//     fontSize: 20,
//     fontWeight: "bold",
//   },
// });

// export default Login;

import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ImageBackground 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function Dashboard() {
  const router = useRouter();
  
  // Array of service blocks (just placeholders for now)
  const serviceBlocks = Array(8).fill('Service');
  
  return (
    <ImageBackground
      source={require("../assets/images/thefillbac.png")}
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={{uri: 'https://via.placeholder.com/40'}}
              style={styles.logoImage}
            />
            <Text style={styles.logoText}>HOPPER</Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/")}>
            <Ionicons name="log-out-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="gray" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="gray"
          />
        </View>
        
        {/* Service Blocks Grid */}
        <ScrollView style={styles.scrollView}>
          <View style={styles.gridContainer}>
            {serviceBlocks.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={styles.serviceBlock}
                onPress={() => console.log(`Service ${index + 1} clicked`)}
              >
                {/* Empty for now, will be filled with actual service info later */}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

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
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 40,
    height: 40,
    marginRight: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    marginHorizontal: 16,
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
  scrollView: {
    flex: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  serviceBlock: {
    width: '48%',
    height: 120,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginBottom: 16,
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
