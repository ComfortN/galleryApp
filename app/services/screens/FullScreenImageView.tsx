import React, { useState } from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import { useRoute, useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const FullScreenImageView = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { image } = route.params;
  const [showInfo, setShowInfo] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const translateY = new Animated.Value(0);

  const toggleInfo = () => {
    setShowInfo(!showInfo);
  };

  const toggleMap = () => {
    Animated.timing(translateY, {
      toValue: mapVisible ? 0 : -height / 2,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setMapVisible(!mapVisible);
  };
  console.log('Image URI:', image.uri);

  return (
    <View style={styles.fullScreenImageContainer}>
      <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
        <Ionicons name="close" size={30} color="white" />
      </TouchableOpacity>
      <TouchableOpacity onPress={toggleInfo}>
        <Image source={{ uri: image.uri }} style={styles.fullScreenImage} />
      </TouchableOpacity>
      {showInfo && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Date: {image.date}</Text>
          <Text style={styles.infoText}>Time: {image.time}</Text>
        </View>
      )}
      <Animated.View style={[styles.mapContainer, { transform: [{ translateY }] }]}>
        <TouchableOpacity style={styles.mapToggle} onPress={toggleMap}>
          <Ionicons name={mapVisible ? "arrow-down" : "arrow-up"} size={30} color="white" />
        </TouchableOpacity>
        {mapVisible && (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: image.latitude,
              longitude: image.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            <Marker
              coordinate={{
                latitude: image.latitude,
                longitude: image.longitude,
              }}
              title="Image Location"
            />
          </MapView>
        )}
      </Animated.View>
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => console.log('Edit')}>
          <Ionicons name="create-outline" size={30} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => console.log('Share')}>
          <Ionicons name="share-outline" size={30} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => console.log('Delete')}>
          <Ionicons name="trash-outline" size={30} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenImageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
  },
  infoContainer: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 10,
  },
  infoText: {
    color: 'white',
    fontSize: 16,
  },
  mapContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height / 3,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  map: {
    flex: 1,
  },
  mapToggle: {
    position: 'absolute',
    top: 10,
    left: 20,
    zIndex: 1,
  },
  bottomNav: {
    position: 'absolute',
    padding: 20,
    borderRadius: 10,
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primary.main
  },
});

export default FullScreenImageView;