import React, { useState, useEffect } from 'react';
import { View, Image, Dimensions, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import DatabaseService from '../DatabaseService';
import colors from '../../constants/colors';

const { width } = Dimensions.get('window');

export default function MapViewScreen() {
  const [images, setImages] = useState([]);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const storedImages = await DatabaseService.getImages();
      setImages(storedImages);
    } catch (error) {
      console.error('Error loading images', error);
    }
  };

  const markers = images.filter(img => img.latitude && img.longitude);

  return (
    <View style={styles.container}>
      {markers.length > 0 && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: markers[0].latitude,
            longitude: markers[0].longitude,
            latitudeDelta: 10,
            longitudeDelta: 10,
          }}
        >
          {markers.map(img => (
            <Marker
              key={img.id}
              coordinate={{
                latitude: img.latitude,
                longitude: img.longitude
              }}
              title="Image Location"
            >
              <Image 
                source={{ uri: img.uri }} 
                style={styles.markerImage} 
              />
            </Marker>
          ))}
        </MapView>
      )}
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
  markerImage: { 
    width: 50, 
    height: 50, 
    borderRadius: 25 
  }
});