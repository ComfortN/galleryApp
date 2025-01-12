import React, { useState, useEffect } from 'react';
import { 
  View, 
  Image, 
  Dimensions, 
  StyleSheet, 
  TouchableOpacity, 
  Text,
  ActivityIndicator,
  Alert
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import DatabaseService from '../DatabaseService';
import colors from '../../constants/colors';

const { width, height } = Dimensions.get('window');

export default function MapViewScreen() {
  const navigation = useNavigation();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [mapType, setMapType] = useState('standard');

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      setLoading(true);
      const storedImages = await DatabaseService.getImages();
      setImages(storedImages);
    } catch (error) {
      console.error('Error loading images', error);
      Alert.alert('Error', 'Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const markers = images.filter(img => img.latitude && img.longitude);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.loadingText}>Loading images...</Text>
      </View>
    );
  }

  if (markers.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="images-outline" size={64} color={colors.text.secondary} />
        <Text style={styles.emptyText}>No images with location data</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('Gallery')}
        >
          <Text style={styles.addButtonText}>Add Images</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        mapType={mapType}
        initialRegion={{
          latitude: markers[0].latitude,
          longitude: markers[0].longitude,
          latitudeDelta: 0.001,
          longitudeDelta: 0.001,
        }}
      >
        {markers.map(img => (
          <Marker
            key={img.id}
            coordinate={{
              latitude: img.latitude,
              longitude: img.longitude
            }}
            onPress={() => setSelectedMarker(img)}
          >
            <View style={styles.markerContainer}>
              <Image 
                source={{ uri: img.uri }} 
                style={styles.markerImage} 
              />
            </View>
            <Callout
              onPress={() => navigation.navigate('FullScreenImage', { image: img })}
            >
              <View style={styles.calloutContainer}>
                <Image 
                  source={{ uri: img.uri }} 
                  style={styles.calloutImage} 
                />
                <Text style={styles.calloutText}>
                  Taken on {new Date(img.timestamp).toLocaleDateString()}
                </Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Map Controls */}
      <View style={styles.mapControls}>
        <TouchableOpacity 
          style={styles.mapTypeButton}
          onPress={() => setMapType(mapType === 'standard' ? 'satellite' : 'standard')}
        >
          <Ionicons 
            name={mapType === 'standard' ? 'map-outline' : 'globe-outline'} 
            size={24} 
            color={colors.primary.main} 
          />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={loadImages}
        >
          <Ionicons 
            name="refresh-outline" 
            size={24} 
            color={colors.primary.main} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background.main 
  },
  map: { 
    width: '100%', 
    height: '100%' 
  },
  markerContainer: {
    backgroundColor: colors.primary.main,
    borderRadius: 25,
    padding: 2,
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  markerImage: { 
    width: 46, 
    height: 46, 
    borderRadius: 23,
  },
  calloutContainer: {
    width: 200,
    height: 200,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
  },
  calloutImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  calloutText: {
    marginTop: 8,
    textAlign: 'center',
    color: colors.text.primary,
  },
  mapControls: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mapTypeButton: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  refreshButton: {
    padding: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.main,
  },
  loadingText: {
    marginTop: 10,
    color: colors.text.primary,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.main,
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    color: colors.text.secondary,
    fontSize: 18,
    textAlign: 'center',
  },
  addButton: {
    marginTop: 20,
    backgroundColor: colors.primary.main,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});