import React from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';

interface CompassViewProps {
  heading: number;
}

const CompassView: React.FC<CompassViewProps> = ({heading}) => {
  // Rotate compass dial in reverse so that North is always pointed correctly
  const rotation = `${-heading}deg`;

  return (
    <View style={styles.compassContainer}>
      {/* Outer Rim */}
      <View style={styles.outerRim}>
        {/* Fixed Red Direction Pointer at Top */}
        <View style={styles.fixedPointer} />

        {/* Rotating Compass Dial */}
        <View style={[styles.dial, {transform: [{rotate: rotation}]}]}>
          {/* North */}
          <View style={[styles.cardinalContainer, styles.northPos]}>
            <Text style={[styles.cardinalText, styles.northText]}>N</Text>
          </View>

          {/* East */}
          <View style={[styles.cardinalContainer, styles.eastPos]}>
            <Text style={styles.cardinalText}>E</Text>
          </View>

          {/* South */}
          <View style={[styles.cardinalContainer, styles.southPos]}>
            <Text style={styles.cardinalText}>S</Text>
          </View>

          {/* West */}
          <View style={[styles.cardinalContainer, styles.westPos]}>
            <Text style={styles.cardinalText}>W</Text>
          </View>

          {/* Dial Needle/Crosshair */}
          <View style={styles.needleNorth} />
          <View style={styles.needleSouth} />
          <View style={styles.needleCenter} />

          {/* Degree Ticks */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => (
            <View
              key={deg}
              style={[
                styles.tickContainer,
                {transform: [{rotate: `${deg}deg`}]},
              ]}>
              <View
                style={[
                  styles.tick,
                  deg % 90 === 0 ? styles.majorTick : styles.minorTick,
                ]}
              />
            </View>
          ))}
        </View>

        {/* Center Heading Display (Screen 1 style in đề bài) */}
        <View style={styles.centerDisplay}>
          <Text style={styles.centerHeadingText}>{Math.round(heading)}°</Text>
        </View>
      </View>
    </View>
  );
};

const DIAL_SIZE = 280;

const styles = StyleSheet.create({
  compassContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
  },
  outerRim: {
    width: DIAL_SIZE + 24,
    height: DIAL_SIZE + 24,
    borderRadius: (DIAL_SIZE + 24) / 2,
    borderWidth: 2,
    borderColor: '#0f3460',
    backgroundColor: '#16213e',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  fixedPointer: {
    position: 'absolute',
    top: 2,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 14,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#e94560',
    zIndex: 10,
  },
  dial: {
    width: DIAL_SIZE,
    height: DIAL_SIZE,
    borderRadius: DIAL_SIZE / 2,
    backgroundColor: '#1a1a2e',
    borderWidth: 1.5,
    borderColor: '#0f3460',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardinalContainer: {
    position: 'absolute',
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  northPos: {
    top: 10,
  },
  eastPos: {
    right: 10,
  },
  southPos: {
    bottom: 10,
  },
  westPos: {
    left: 10,
  },
  cardinalText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  northText: {
    color: '#e94560',
    fontWeight: '900',
  },
  needleNorth: {
    position: 'absolute',
    top: 42,
    width: 4,
    height: 70,
    backgroundColor: '#e94560',
    borderRadius: 2,
  },
  needleSouth: {
    position: 'absolute',
    bottom: 42,
    width: 4,
    height: 70,
    backgroundColor: '#a0a0b0',
    borderRadius: 2,
  },
  needleCenter: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e94560',
    zIndex: 5,
  },
  tickContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
  },
  tick: {
    backgroundColor: '#a0a0b0',
  },
  majorTick: {
    width: 2.5,
    height: 12,
    backgroundColor: '#ffffff',
  },
  minorTick: {
    width: 1.5,
    height: 8,
    backgroundColor: '#53354a',
  },
  centerDisplay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(22, 33, 62, 0.85)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#0f3460',
    zIndex: 6,
  },
  centerHeadingText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4ecca3',
    fontFamily: 'monospace',
  },
});

export default CompassView;

