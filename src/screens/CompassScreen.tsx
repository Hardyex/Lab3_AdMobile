import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  NativeEventEmitter,
  ScrollView,
  StatusBar,
} from 'react-native';
import NativeCompassModule from '../modules/NativeCompassModule';
import CompassView from '../components/CompassView';

interface CompassData {
  heading: number;
  direction: string;
}

const compassEmitter = new NativeEventEmitter(NativeCompassModule);

const CompassScreen: React.FC = () => {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [heading, setHeading] = useState<number>(0);
  const [direction, setDirection] = useState<string>('N');
  const [statusMessage, setStatusMessage] = useState<string>('Calibrating sensors...');

  useEffect(() => {
    NativeCompassModule.isSupported()
      .then(supported => {
        setIsSupported(supported);
        if (supported) {
          setStatusMessage('Sensors active');
          NativeCompassModule.startCompass();
        } else {
          setStatusMessage('Device lacks Accelerometer or Magnetometer');
        }
      })
      .catch(() => {
        setIsSupported(false);
        setStatusMessage('Error checking compass sensors');
      });

    const updateSub = compassEmitter.addListener(
      'onCompassUpdate',
      (data: any) => {
        const compassData = data as CompassData;
        setHeading(compassData.heading);
        setDirection(compassData.direction);
      },
    );

    const errorSub = compassEmitter.addListener(
      'onCompassError',
      (err: any) => {
        setStatusMessage(err.error || 'Compass sensor error');
      },
    );

    return () => {
      updateSub.remove();
      errorSub.remove();
      NativeCompassModule.stopCompass();
    };
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.title}>Compass</Text>
      <Text style={styles.subtitle}>Turbo Module - Magnetometer Sensor</Text>

      {/* Sensor Support Badge */}
      <View style={styles.statusBadge}>
        <View
          style={[
            styles.statusDot,
            {backgroundColor: isSupported ? '#4caf50' : '#f44336'},
          ]}
        />
        <Text style={styles.statusText}>{statusMessage}</Text>
      </View>

      {/* Primary Orientation Info (matching Screen 1 layout in assignment) */}
      <View style={styles.headingHeader}>
        <Text style={styles.degreeMain}>{Math.round(heading)}°</Text>
        <Text style={styles.directionMain}>{direction}</Text>
      </View>

      {/* Compass Interactive UI */}
      <CompassView heading={heading} />

      {/* Sensor Detail Info Cards */}
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>HEADING DEGREE</Text>
          <Text style={styles.cardValue}>{heading.toFixed(1)}°</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>CARDINAL DIRECTION</Text>
          <Text style={styles.cardValue}>{direction}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>SENSOR FUSION</Text>
          <Text style={styles.sensorNote}>
            Sensor.TYPE_ACCELEROMETER + Sensor.TYPE_MAGNETIC_FIELD with Low-Pass Filter
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#a0a0b0',
    marginBottom: 16,
    textAlign: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#0f3460',
    marginBottom: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    color: '#a0a0b0',
    fontSize: 12,
    fontWeight: '500',
  },
  headingHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginVertical: 4,
  },
  degreeMain: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    fontFamily: 'monospace',
  },
  directionMain: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e94560',
  },
  cardContainer: {
    width: '100%',
    gap: 12,
    marginTop: 12,
  },
  card: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#a0a0b0',
    marginBottom: 4,
    letterSpacing: 1,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4ecca3',
    fontFamily: 'monospace',
  },
  sensorNote: {
    fontSize: 13,
    color: '#4ecca3',
    fontWeight: '500',
    lineHeight: 18,
  },
});

export default CompassScreen;
