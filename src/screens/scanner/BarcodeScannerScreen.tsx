import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';

// Vision Camera scanner (optional)
let Camera: any, useCameraDevices: any, useScanBarcodes: any, BarcodeFormat: any;
try {
  // Lazy require to avoid crash if not installed
  Camera = require('react-native-vision-camera').Camera;
  useCameraDevices = require('react-native-vision-camera').useCameraDevices;
  ({ useScanBarcodes, BarcodeFormat } = require('vision-camera-code-scanner'));
} catch {}

const BarcodeScannerScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [permission, setPermission] = useState<'authorized' | 'denied' | 'not-determined'>('not-determined');
  const [handled, setHandled] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        if (Camera?.getCameraPermissionStatus) {
          const status = await Camera.getCameraPermissionStatus();
          if (status !== 'authorized') {
            const req = await Camera.requestCameraPermission();
            setPermission(req);
          } else setPermission(status);
        } else setPermission('denied');
      } catch {
        setPermission('denied');
      }
    })();
  }, []);

  const devices = useCameraDevices ? useCameraDevices() : undefined;
  const device = devices?.back;

  const formats = useMemo(() => [
    BarcodeFormat?.EAN_13,
    BarcodeFormat?.EAN_8,
    BarcodeFormat?.CODE_128,
    BarcodeFormat?.CODE_39,
    BarcodeFormat?.UPC_A,
    BarcodeFormat?.UPC_E,
    BarcodeFormat?.QR_CODE
  ].filter(Boolean), []);

  const [frameProcessor, barcodes] = useScanBarcodes ? useScanBarcodes(formats, { checkInverted: true }) : [undefined, []];

  useEffect(() => {
    if (handled) return;
    const code = barcodes?.[0]?.rawValue as string | undefined;
    if (code) {
      setHandled(true);
      navigation.navigate('Sales', { scannedBarcode: code });
    }
  }, [barcodes, handled, navigation]);

  if (!Camera || !useScanBarcodes) {
    return (
      <View style={styles.container}>
        <Text style={styles.info}>Scanner nativo não instalado.</Text>
        <Text style={styles.small}>Use o campo de código de barras na tela de vendas.</Text>
        <Button title="Voltar" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  if (permission !== 'authorized') {
    return (
      <View style={styles.container}>
        <Text style={styles.info}>Permissão de câmera: {permission}</Text>
        <Button title="Voltar" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.container}><Text>Carregando câmera...</Text></View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Camera
        style={{ flex: 1 }}
        device={device}
        isActive
        frameProcessor={frameProcessor}
        frameProcessorFps={5}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  info: { fontSize: 16, marginBottom: 8 },
  small: { fontSize: 12, color: '#666', textAlign: 'center', marginBottom: 12 }
});

export default BarcodeScannerScreen;
