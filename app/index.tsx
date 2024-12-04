import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaView, StyleSheet } from 'react-native';
import SplashScreenComponent from './services/screens/SplashScreen';
import GalleryScreen from './services/screens/GalleryScreen';
import FullScreenImageView from './services/screens/FullScreenImageView';
import colors from './constants/colors';

const Stack = createStackNavigator();

const Index: React.FC = () => {
  const [isSplashScreenVisible, setIsSplashScreenVisible] = useState(true);

  const handleSplashScreenFinish = () => {
    setIsSplashScreenVisible(false);
  };

  if (isSplashScreenVisible) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="auto" />
        <SplashScreenComponent onFinish={handleSplashScreenFinish} />
      </SafeAreaView>
    );
  }

  return (
    <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: colors.primary.main,
      },
    }}
    >
      <Stack.Screen
        name="Gallery"
        component={GalleryScreen}
        options={{ title: 'Gallery' }}
      />
      <Stack.Screen
        name="FullScreenImage"
        component={FullScreenImageView}
        options={{ title: 'Full Screen Image' }}
      />
      
    </Stack.Navigator>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
});
