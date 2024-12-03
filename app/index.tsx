import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet } from 'react-native';
import SplashScreenComponent from './services/screens/SplashScreen';
import GalleryScreen from './services/screens/GalleryScreen';
import GalleryGridScreen from './services/screens/GalleryScreenScreen';
import colors from './constants/colors';

const Index: React.FC = () => {
  const [isSplashScreenVisible, setIsSplashScreenVisible] = useState(true);

  const handleSplashScreenFinish = () => {
    setIsSplashScreenVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      {isSplashScreenVisible ? (
        <SplashScreenComponent onFinish={handleSplashScreenFinish} />
      ) : (
        <GalleryScreen />
      )}
    </SafeAreaView>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
});
