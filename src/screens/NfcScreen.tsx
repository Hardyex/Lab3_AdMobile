import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  NativeEventEmitter,
  Alert,
} from 'react-native';
import NativeNfcModule from '../modules/NativeNfcModule';

interface NdefRecord {
  tnf: string;
  type: string;
  payload: string;
}

interface NfcTagData {
  id: string;
  techList: string[];
  ndefRecords: NdefRecord[];
}

const nfcEmitter = new NativeEventEmitter(NativeNfcModule);

const NfcScreen: React.FC = () => {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Press button to start scanning');
  const [tagData, setTagData] = useState<NfcTagData | null>(null);

  useEffect(() => {
    NativeNfcModule.isSupported()
      .then(supported => {
        setIsSupported(supported);
        if (!supported) {
          setStatusMessage('NFC is not supported on this device');
        }
      })
      .catch(() => {
        setIsSupported(false);
        setStatusMessage('Could not check NFC status');
      });

    const tagSub = nfcEmitter.addListener('onNfcTagDiscovered', (data: any) => {
      setTagData(data as NfcTagData);
      setStatusMessage('Tag detected successfully!');
    });

    const statusSub = nfcEmitter.addListener('onNfcStatus', (event: any) => {
      setStatusMessage(event.message);
      setScanning(event.status === 'scanning');
    });

    const errorSub = nfcEmitter.addListener('onNfcError', (event: any) => {
      setStatusMessage(event.error);
      setScanning(false);
      Alert.alert('NFC Error', event.error);
    });

    return () => {
      tagSub.remove();
      statusSub.remove();
      errorSub.remove();
      NativeNfcModule.stopScan();
    };
  }, []);

  const handleToggleScan = useCallback(() => {
    if (scanning) {
      NativeNfcModule.stopScan();
      setScanning(false);
    } else {
      setTagData(null);
      NativeNfcModule.startScan();
    }
  }, [scanning]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>NFC Reader</Text>
      <Text style={styles.subtitle}>Turbo Native Module</Text>

      {/* Support Status */}
      <View style={[styles.card, styles.statusCard]}>
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusDot,
              {backgroundColor: isSupported ? '#4caf50' : '#f44336'},
            ]}
          />
          <Text style={styles.statusLabel}>
            {isSupported === null
              ? 'Checking NFC...'
              : isSupported
              ? 'NFC Supported'
              : 'NFC Not Supported'}
          </Text>
        </View>
        <Text style={styles.statusDetail}>{statusMessage}</Text>
      </View>

      {/* Scan Button */}
      <TouchableOpacity
        style={[
          styles.scanButton,
          scanning ? styles.scanButtonActive : styles.scanButtonInactive,
          !isSupported && styles.buttonDisabled,
        ]}
        onPress={handleToggleScan}
        disabled={!isSupported}>
        <Text style={styles.scanButtonIcon}>{scanning ? '📡' : '📱'}</Text>
        <Text style={styles.scanButtonText}>
          {scanning ? 'Stop Scanning' : 'Start NFC Scan'}
        </Text>
      </TouchableOpacity>

      {/* Simulator Button for Emulator Testing */}
      <TouchableOpacity
        style={styles.simButton}
        onPress={() => {
          const fakeTag: NfcTagData = {
            id: '04:8A:2B:F1:C9:60:80',
            techList: ['IsoDep', 'NfcA', 'Ndef'],
            ndefRecords: [
              {
                tnf: 'WELL_KNOWN',
                type: 'T',
                payload: 'Hello from EIU NFC Tag - Student ID: CSW434',
              },
              {
                tnf: 'WELL_KNOWN',
                type: 'U',
                payload: 'https://eiu.edu.vn',
              },
            ],
          };
          setTagData(fakeTag);
          setStatusMessage('Tag detected successfully! (Simulated)');
        }}>
        <Text style={styles.simButtonText}>🧪 Simulate NFC Tag (For Emulator)</Text>
      </TouchableOpacity>

      {/* Scanning Animation Indicator */}
      {scanning && (
        <View style={styles.scanningIndicator}>
          <Text style={styles.scanningText}>
            Hold an NFC tag near the back of your phone...
          </Text>
        </View>
      )}

      {/* Tag Data Display */}
      {tagData && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultHeader}>Tag Information</Text>

          {/* Tag ID */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>TAG ID (HEX)</Text>
            <Text style={styles.cardValue}>{tagData.id || 'Unknown'}</Text>
          </View>

          {/* Tech List */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>TECHNOLOGIES</Text>
            <View style={styles.techList}>
              {tagData.techList.map((tech, index) => (
                <View key={index} style={styles.techBadge}>
                  <Text style={styles.techText}>{tech}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* NDEF Records */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>
              NDEF RECORDS ({tagData.ndefRecords?.length || 0})
            </Text>
            {tagData.ndefRecords && tagData.ndefRecords.length > 0 ? (
              tagData.ndefRecords.map((record, index) => (
                <View key={index} style={styles.recordItem}>
                  <Text style={styles.recordIndex}>Record #{index + 1}</Text>
                  <Text style={styles.recordField}>
                    Format: <Text style={styles.recordHighlight}>{record.tnf}</Text>
                  </Text>
                  <Text style={styles.recordField}>
                    Type: <Text style={styles.recordHighlight}>{record.type}</Text>
                  </Text>
                  <Text style={styles.recordField}>Payload:</Text>
                  <View style={styles.payloadBox}>
                    <Text style={styles.payloadText}>
                      {record.payload || '(empty)'}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyRecords}>
                No NDEF messages found on this tag
              </Text>
            )}
          </View>
        </View>
      )}
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
    marginBottom: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  statusCard: {
    alignItems: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  statusDetail: {
    fontSize: 13,
    color: '#a0a0b0',
    textAlign: 'center',
  },
  scanButton: {
    width: '100%',
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  scanButtonActive: {
    backgroundColor: '#e94560',
  },
  scanButtonInactive: {
    backgroundColor: '#0f3460',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  simButton: {
    width: '100%',
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#0f3460',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#4ecca3',
    borderStyle: 'dashed',
  },
  simButtonText: {
    color: '#4ecca3',
    fontSize: 15,
    fontWeight: '600',
  },
  scanButtonIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  scanButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scanningIndicator: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#0f3460',
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
  },
  scanningText: {
    color: '#e94560',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  resultContainer: {
    width: '100%',
  },
  resultHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#a0a0b0',
    marginBottom: 8,
    letterSpacing: 1,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4ecca3',
    fontFamily: 'monospace',
  },
  techList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  techBadge: {
    backgroundColor: '#0f3460',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  techText: {
    color: '#4ecca3',
    fontSize: 13,
    fontWeight: '600',
  },
  recordItem: {
    borderTopWidth: 1,
    borderTopColor: '#0f3460',
    paddingTop: 12,
    marginTop: 8,
  },
  recordIndex: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#e94560',
    marginBottom: 4,
  },
  recordField: {
    fontSize: 13,
    color: '#a0a0b0',
    marginBottom: 2,
  },
  recordHighlight: {
    color: '#ffffff',
    fontWeight: '600',
  },
  payloadBox: {
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
  },
  payloadText: {
    color: '#4ecca3',
    fontSize: 14,
    fontFamily: 'monospace',
  },
  emptyRecords: {
    color: '#a0a0b0',
    fontStyle: 'italic',
    fontSize: 13,
  },
});

export default NfcScreen;
