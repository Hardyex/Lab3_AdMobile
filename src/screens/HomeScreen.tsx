import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../App';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

const HomeScreen: React.FC<HomeScreenProps> = ({navigation}) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.title}>Lab 3 - Sensors</Text>
      <Text style={styles.subtitle}>Turbo Native Modules</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.nfcButton]}
          onPress={() => navigation.navigate('NFC')}>
          <Text style={styles.buttonIcon}>📡</Text>
          <Text style={styles.buttonText}>Exercise 1: NFC Reader</Text>
          <Text style={styles.buttonDesc}>Read data from NFC tags</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.compassButton]}
          onPress={() => navigation.navigate('Compass')}>
          <Text style={styles.buttonIcon}>🧭</Text>
          <Text style={styles.buttonText}>Exercise 2: Compass</Text>
          <Text style={styles.buttonDesc}>Magnetometer sensor</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#a0a0b0',
    marginBottom: 40,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  button: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  nfcButton: {
    backgroundColor: '#16213e',
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  compassButton: {
    backgroundColor: '#16213e',
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  buttonIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  buttonDesc: {
    fontSize: 14,
    color: '#a0a0b0',
  },
});

export default HomeScreen;
