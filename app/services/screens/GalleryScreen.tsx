import React, { useEffect, useState } from 'react';
import { View, FlatList, Image, TouchableOpacity, Dimensions, StyleSheet, Text, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import MapView, { Marker } from 'react-native-maps';
import DatabaseService from '../DatabaseService';
import GeolocationService from '../GeolocationService';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function GalleryScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('gallery');
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
      Alert.alert('Error', 'Failed to load images');
    }
  };

  const pickImage = async () => {
    try {
      const { status: cameraRollStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();

      if (cameraRollStatus !== 'granted' || cameraStatus !== 'granted') {
        Alert.alert('Permissions Needed', 'Sorry, we need camera roll and camera permissions');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (result.canceled) return;

      const uri = result.assets[0].uri;
      const date = new Date().toLocaleDateString();
      const time = new Date().toLocaleTimeString();

      let location;
      try {
        location = await GeolocationService.getCurrentLocation();
      } catch (locationError) {
        console.error('Error getting location:', locationError.message);
        Alert.alert('Location Error', `Failed to get current location. Image will be saved without location data.`);
        location = { latitude: null, longitude: null };
      }

      await DatabaseService.addImage(
        uri,
        location.latitude,
        location.longitude,
        date,
        time
      );

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

      let location;
      try {
        location = await GeolocationService.getCurrentLocation();
      } catch (locationError) {
        console.error('Error getting location:', locationError.message);
        Alert.alert('Location Error', `Failed to get current location. Image will be saved without location data.`);
        location = { latitude: null, longitude: null };
      }

      if (!result.canceled) {
        const date = new Date().toLocaleDateString();
        const time = new Date().toLocaleTimeString();
        await DatabaseService.addImage(
          result.assets[0].uri,
          location.latitude,
          location.longitude,
          date,
          time
        );
      }
      loadImages();
    } catch (error) {
      console.error('Camera error', error);
      Alert.alert('Error', 'Failed to take picture.');
    }
  };

  const confirmDeleteImage = (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => deleteImage(id), style: 'destructive' },
      ],
      { cancelable: true }
    );
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
    switch (activeTab) {
      case 'gallery':
        return (
          <FlatList
            data={images}
            numColumns={3}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  console.log('Selected Image:', item);
                  navigation.navigate('FullScreenImage', {
                    image: {
                      ...item,
                      date: new Date(item.date).toLocaleDateString(),
                      time: new Date(item.date).toLocaleTimeString(),
                    },
                  });
                }}
                onLongPress={() => confirmDeleteImage(item.id)}
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
      {renderContent()}

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
  }
});