import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

const SplashScreenComponent: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  useEffect(() => {
    const prepare = async () => {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Simulate a delay
      await SplashScreen.hideAsync();
      onFinish();
    };

    prepare();
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/images/splash.png')}
        style={styles.image}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  image: {
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
  },
});

export default SplashScreenComponent;
