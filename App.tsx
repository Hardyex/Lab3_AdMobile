import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import NfcScreen from './src/screens/NfcScreen';
import CompassScreen from './src/screens/CompassScreen';

export type RootStackParamList = {
  Home: undefined;
  NFC: undefined;
  Compass: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {backgroundColor: '#16213e'},
          headerTintColor: '#ffffff',
          headerTitleStyle: {fontWeight: 'bold'},
          contentStyle: {backgroundColor: '#1a1a2e'},
        }}>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="NFC"
          component={NfcScreen}
          options={{title: 'NFC Reader'}}
        />
        <Stack.Screen
          name="Compass"
          component={CompassScreen}
          options={{title: 'Compass'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
