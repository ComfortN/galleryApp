import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Index from './index';

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Index />
    </NavigationContainer>
  );
};

export default App;
