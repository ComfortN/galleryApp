import React, { useEffect, useState } from 'react';
import { 
  View, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  Dimensions, 
  StyleSheet, 
  Text,
  Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import MapView, { Marker } from 'react-native-maps';
import DatabaseService from '../DatabaseService';
import GeolocationService from '../GeolocationService';

const { width } = Dimensions.get('window');

export default function GalleryScreen() {
  const [activeTab, setActiveTab] = useState('gallery');
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const storedImages = await DatabaseService.getImages();
      setImages(storedImages);
    } catch (error) {
      console.error('Error loading images', error);
      Alert.alert('Error', 'Failed to load images');
    }
  };

  const pickImage = async () => {
    try {
      // Request permissions
      const { status: cameraRollStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();

      if (cameraRollStatus !== 'granted' || cameraStatus !== 'granted') {
        Alert.alert('Permissions Needed', 'Sorry, we need camera roll and camera permissions');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (result.canceled) return;

      const uri = result.assets[0].uri;

      // Get current location
      let location;
      try {
        location = await GeolocationService.getCurrentLocation();
      } catch (locationError) {
        console.error('Error getting location:', locationError.message);
        Alert.alert('Location Error', `Failed to get current location. Image will be saved without location data.`);
        location = { latitude: null, longitude: null };
      }

      // Save image to database with location
      await DatabaseService.addImage(
        uri, 
        location.latitude, 
        location.longitude
      );

      // Refresh images
      loadImages();
    } catch (error) {
      console.error('Image pick error', error);
      Alert.alert('Error', 'Failed to pick or save image');
    }
  };

  const takePicture = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera permission is required.');
        return;
      }
  
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });
  
      if (!result.canceled) {
        await DatabaseService.addImage(result.assets[0].uri);
      }
      loadImages();
    } catch (error) {
      console.error('Camera error', error);
      Alert.alert('Error', 'Failed to take picture.');
    }
  };

  const deleteImage = async (id) => {
    try {
      await DatabaseService.deleteImage(id);
      loadImages();
    } catch (error) {
      console.error('Delete image error', error);
      Alert.alert('Error', 'Failed to delete image');
    }
  };

  const renderMapView = () => {
    const markers = images.filter(img => img.latitude && img.longitude);

    if (markers.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>No images with location data</Text>
        </View>
      );
    }

    return (
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
    );
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'gallery':
        return (
          <FlatList
            data={images}
            numColumns={3}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setSelectedImage(item)}
                onLongPress={() => deleteImage(item.id)}
              >
                <Image source={{ uri: item.uri }} style={styles.thumbnail} />
              </TouchableOpacity>
            )}
          />
        );
      case 'map':
        return renderMapView();
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Main Content */}
      {renderContent()}
      
      {selectedImage && (
        <View style={styles.fullScreenImageContainer}>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => { 
              setSelectedImage(null)
              setShowInfo(false);
            }}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.fullScreenImageTouchable} 
            onPress={() => setShowInfo(!showInfo)}
            activeOpacity={1}
          >
            <Image 
              source={{ uri: selectedImage.uri }} 
              style={styles.fullScreenImage} 
              resizeMode="contain" 
            />
          </TouchableOpacity>

          {showInfo && (
            <View style={styles.imageInfoContainer}>
              <Text style={styles.imageInfoText}>
                Location: {selectedImage.latitude && selectedImage.longitude 
                  ? `${selectedImage.latitude.toFixed(4)}, ${selectedImage.longitude.toFixed(4)}` 
                  : 'No location data'}
              </Text>
              <Text style={styles.imageInfoText}>
                Captured: {selectedImage.timestamp 
                  ? new Date(selectedImage.timestamp).toLocaleString() 
                  : 'Unknown date'}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Bottom Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setActiveTab('gallery')}
        >
          <Ionicons
            name="images-outline"
            size={30}
            color={activeTab === 'gallery' ? colors.primary.main : colors.text.secondary}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            Alert.alert(
              'Add Image',
              'Choose an option',
              [
                { text: 'Take Picture', onPress: takePicture },
                { text: 'Pick from Gallery', onPress: pickImage },
                { text: 'Cancel', style: 'cancel' },
              ],
              { cancelable: true }
            )
          }
        >
          <Ionicons name="add" size={40} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setActiveTab('map')}
        >
          <Ionicons
            name="map-outline"
            size={30}
            color={activeTab === 'map' ? colors.primary.main : colors.text.secondary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  tabBar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    height: 70,
    backgroundColor: colors.primary.main,
    borderRadius: 35,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tabButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 70,
    height: 70,
    backgroundColor: colors.background.main,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    top: -20,
  },
  map: {
    flex: 1,
  },
  thumbnail: {
    width: width / 3 - 4,
    height: width / 3 - 4,
    margin: 2,
  },
  fullScreenImageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center'
  },
  fullScreenImage: { 
    width: '90%', 
    height: '80%' 
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18
  },
  markerImage: { 
    width: 50, 
    height: 50, 
    borderRadius: 25 
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    color: colors.text.secondary,
    fontSize: 18,
  },
  
  fullScreenImageTouchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 15,
  },
  imageInfoText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 5,
  }
});