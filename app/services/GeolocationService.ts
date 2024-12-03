import * as Location from 'expo-location';

class GeolocationService {
  async requestLocationPermission(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log('Location permission status:', status);
      return status === 'granted';
    } catch (error) {
      console.error('Location permission error', error);
      return false;
    }
  }

  async getCurrentLocation(): Promise<{latitude: number, longitude: number}> {
    try {
      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) {
        throw new Error('Location permission not granted');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Low,
        timeout: 5000
      });
      const { latitude, longitude } = location.coords;
      console.log('Current location:', { latitude, longitude });
      return { latitude, longitude };
    } catch (error) {
      console.error('Get location error', error);
      return this.getFallbackLocation();
    }
  }

  async getFallbackLocation(): Promise<{latitude: number, longitude: number}> {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      return { latitude: data.latitude, longitude: data.longitude };
    } catch (error) {
      console.error('Fallback location error', error);
      throw new Error('Failed to get fallback location');
    }
  }
}

export default new GeolocationService();
