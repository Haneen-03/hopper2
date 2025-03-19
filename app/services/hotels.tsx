// app/services/hotels.tsx
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  ImageBackground,
  Image,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { db } from '../../firebase';

interface HotelItem {
  id: string;
  title: string;
  description: string;
  price?: string;
  location?: string;
  imageUrl?: string;
}

export default function HotelsScreen() {
  const router = useRouter();
  const [hotels, setHotels] = useState<HotelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [serviceDocId, setServiceDocId] = useState('');

  // Find the actual Firestore document ID for hotels service
  useEffect(() => {
    const findServiceDocId = async () => {
      try {
        console.log(`Finding document ID for hotels service`);
        
        // First try to find the service by its 'id' field
        const servicesCollection = collection(db, 'services');
        const servicesQuery = query(servicesCollection, where('id', '==', 'hotels'));
        const serviceSnapshot = await getDocs(servicesQuery);
        
        if (!serviceSnapshot.empty) {
          const docId = serviceSnapshot.docs[0].id;
          console.log(`Found service document ID by 'id' field: ${docId}`);
          setServiceDocId(docId);
        } else {
          // If not found by 'id', try finding by name
          console.log(`No service found with id: hotels, trying name field`);
          const nameQuery = query(servicesCollection, where('name', '==', 'Hotels'));
          const nameSnapshot = await getDocs(nameQuery);
          
          if (!nameSnapshot.empty) {
            const docId = nameSnapshot.docs[0].id;
            console.log(`Found service document ID by name: ${docId}`);
            setServiceDocId(docId);
          } else {
            // Check all services to find a match
            console.log(`No service found by name, checking all services`);
            const allServicesSnapshot = await getDocs(servicesCollection);
            let found = false;
            
            allServicesSnapshot.forEach(doc => {
              console.log(`Checking service: ${doc.id}`, doc.data());
              
              // Check various fields for a match
              const data = doc.data();
              if (
                doc.id === 'hotels' || 
                data.id === 'hotels' || 
                data.name?.toLowerCase() === 'hotels'
              ) {
                console.log(`Found matching service: ${doc.id}`);
                setServiceDocId(doc.id);
                found = true;
              }
            });
            
            if (!found) {
              // Use 'hotels' as the document ID as a fallback
              console.log(`No matching service found, using 'hotels' as document ID`);
              setServiceDocId('hotels');
            }
          }
        }
      } catch (error) {
        console.error('Error finding hotel service document ID:', error);
      }
    };

    findServiceDocId();
  }, []);

  // Fetch hotels once we have the service document ID
  useEffect(() => {
    if (serviceDocId) {
      fetchHotels();
    }
  }, [serviceDocId]);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      console.log(`Fetching hotels with service doc ID: ${serviceDocId}`);
      const hotelsRef = collection(db, 'services', serviceDocId, 'items');
      const snapshot = await getDocs(hotelsRef);
      
      console.log(`Found ${snapshot.size} hotels`);
      
      if (snapshot.empty) {
        setHotels([]);
      } else {
        const hotelsData = snapshot.docs.map(doc => {
          console.log(`Hotel: ${doc.id}`, doc.data());
          return {
            id: doc.id,
            ...doc.data()
          };
        }) as HotelItem[];
        
        console.log("Hotels data:", hotelsData);
        setHotels(hotelsData);
      }
    } catch (error) {
      console.error('Error fetching hotels:', error);
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/images/thefillbac.png")}
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hotels</Text>
          <View style={{ width: 24 }} /> {/* Empty view for balance */}
        </View>
        
        {/* Debug info */}
        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>Service ID: {serviceDocId || 'Not found'}</Text>
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0a2463" />
          </View>
        ) : (
          <ScrollView style={styles.scrollView}>
            <View style={styles.content}>
              <Text style={styles.sectionTitle}>Available Hotels</Text>
              
              {hotels.length > 0 ? (
                hotels.map(hotel => (
                  <View key={hotel.id} style={styles.hotelCard}>
                    {hotel.imageUrl && (
                      <Image 
                        source={{ uri: hotel.imageUrl || 'https://via.placeholder.com/400x200?text=No+Image' }} 
                        style={styles.hotelImage}
                      />
                    )}
                    <View style={styles.hotelInfo}>
                      <Text style={styles.hotelTitle}>{hotel.title}</Text>
                      {hotel.location && (
                        <Text style={styles.hotelLocation}>{hotel.location}</Text>
                      )}
                      <Text style={styles.hotelDescription}>{hotel.description}</Text>
                      {hotel.price && (
                        <Text style={styles.hotelPrice}>Price: {hotel.price} per night</Text>
                      )}
                      <TouchableOpacity style={styles.bookButton}>
                        <Text style={styles.bookButtonText}>Book Now</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No hotels available at the moment.</Text>
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

const styles = StyleSheet.create({
    debugContainer: {
        paddingHorizontal: 16,
        paddingVertical: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
      },
      debugText: {
        fontSize: 12,
        color: '#666',
      },
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0a2463',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  hotelCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    marginBottom: 16,
    overflow: 'hidden',
  },
  hotelImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  hotelInfo: {
    padding: 16,
  },
  hotelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0a2463',
    marginBottom: 4,
  },
  hotelLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  hotelDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
  hotelPrice: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0a2463',
    marginBottom: 12,
  },
  bookButton: {
    backgroundColor: '#0a2463',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  bookButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
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