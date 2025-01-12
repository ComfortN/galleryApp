import React, { useRef, useState } from 'react';
import {
  View,
  Image,
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  StatusBar,
  Alert,
  Share,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/app/constants/colors';
import DatabaseService from '../DatabaseService';

const { height } = Dimensions.get('window');

const FullScreenImageView = ({ route, navigation }) => {
  const { image, onImageUpdated } = route.params;
  const translateY = useRef(new Animated.Value(0)).current;
  const [mapVisible, setMapVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [newName, setNewName] = useState(image.name || '');

  // PanResponder for handling swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) =>
        Math.abs(gestureState.dy) > 10,
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy < 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy < -100) {
          showMap();
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  const showMap = () => {
    Animated.timing(translateY, {
      toValue: -height / 2,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setMapVisible(true));
  };

  const resetPosition = () => {
    Animated.timing(translateY, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setMapVisible(false));
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        url: image.uri,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share image');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Image',
      'Are you sure you want to delete this image? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          onPress: async () => {
            try {
              await DatabaseService.deleteImage(image.id);
              // Call the callback before navigating back
              if (route.params.onImageDeleted) {
                route.params.onImageDeleted();
              }
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete image');
            }
          },
          style: 'destructive' 
        },
      ]
    );
  };

  const handleEdit = () => {
    setIsEditModalVisible(true);
  };

  const handleSaveName = async () => {
    try {
      // Update the image name in the database
      await DatabaseService.updateImageName(image.id, newName);
      
      // Update the local state if needed
      if (onImageUpdated) {
        onImageUpdated({
          ...image,
          name: newName
        });
      }
      
      setIsEditModalVisible(false);
      
      // Show success message
      Alert.alert('Success', 'Image name updated successfully');
    } catch (error) {
      console.log(error)
      Alert.alert('Error', 'Failed to update image name');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.background.main}
      />
      
      {/* Edit Name Modal */}
      <Modal
        visible={isEditModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Image Name</Text>
            <TextInput
              style={styles.input}
              value={newName}
              onChangeText={setNewName}
              placeholder="Enter new name"
              placeholderTextColor="#666"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setIsEditModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={handleSaveName}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Rest of your existing components */}
      <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
        <Ionicons name="close" size={30} color="white" />
      </TouchableOpacity>

      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.imageContainer, { transform: [{ translateY }] }]}
      >
        <Image source={{ uri: image.uri }} style={styles.fullScreenImage} />
      </Animated.View>

      <Animated.View style={[styles.mapContainer, { transform: [{ translateY }] }]}>
        {mapVisible && (
          <View style={styles.mapWrapper}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: image.latitude,
                longitude: image.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
            >
              <Marker
                coordinate={{
                  latitude: image.latitude,
                  longitude: image.longitude,
                }}
                title={image.name}
              >
                <Image 
                  source={{ uri: image.uri }} 
                  style={styles.markerImage}
                />
              </Marker>
            </MapView>
            <View style={styles.mapOverlay}>
              <Text style={styles.mapTitle}>{image.name}</Text>
              <Text style={styles.mapMetadata}>
                Taken on {image.date} at {image.timestamp}
              </Text>
              <Text style={styles.mapLocation}>
                {`${image.latitude.toFixed(6)}, ${image.longitude.toFixed(6)}`}
              </Text>
            </View>
          </View>
        )}
      </Animated.View>

      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={handleEdit}>
          <Ionicons name="create-outline" size={30} color={colors.background.main} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleShare}>
          <Ionicons name="share-outline" size={30} color={colors.background.main} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete}>
          <Ionicons name="trash-outline" size={30} color={colors.background.main} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.background.main,
    borderRadius: 15,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  input: {
    width: '100%',
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 12,
    color: 'white',
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  saveButton: {
    backgroundColor: colors.primary.main,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  imageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height,
    zIndex: 0,
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  mapContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height / 3,
    backgroundColor: colors.background.main,
  },
  mapWrapper: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 15,
    borderRadius: 10,
  },
  mapTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  mapMetadata: {
    color: 'white',
    fontSize: 14,
    marginBottom: 5,
  },
  mapLocation: {
    color: 'white',
    fontSize: 14,
    fontStyle: 'italic',
  },
  markerImage: {
    width: 100,
    height: 100,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 2,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primary.main,
    padding: 15,
    borderRadius: 35,
  },
});

export default FullScreenImageView;