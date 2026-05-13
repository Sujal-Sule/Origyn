import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Button } from '../ui/Button';
import { Alert } from 'react-native';
import { useStore } from '../../store/useStore';
import api from '../../services/api';

export const QRScanner = ({ navigation }: any) => {
  const [permission, requestPermission] = useCameraPermissions();
  const { role } = useStore();
  const [scanned, setScanned] = React.useState(false);

  // Reset scan state when screen is focused
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setScanned(false);
    });
    return unsubscribe;
  }, [navigation]);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center bg-navy-900 p-6">
        <Text className="text-white text-center mb-6 text-lg">
          We need your permission to show the camera to scan DCQR codes.
        </Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black" style={{ position: 'relative' }}>
      <CameraView 
        style={StyleSheet.absoluteFillObject} 
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={async ({ data }) => {
          if (scanned) return;
          setScanned(true);
          
          if (role === 'consumer') {
            try {
              const { token } = useStore.getState();
              const res = await api.post('/scan/consumer', {
                qr_data: data,
                gps: "19.0760,72.8777"
              }, {
                headers: { Authorization: `Bearer ${token}` }
              });
              
              if (res.data.valid) {
                navigation.navigate('TrustScore', { score: res.data.trust_score?.score || 100, data: res.data });
              } else {
                Alert.alert("Fake Product", res.data.message);
                setTimeout(() => setScanned(false), 2000);
              }
            } catch (err: any) {
              Alert.alert("Error", "Validation failed: " + (err.response?.data?.detail || err.message));
              setTimeout(() => setScanned(false), 2000);
            }
          } else if (role === 'distributor' || role === 'retailer') {
            navigation.navigate('UpdateStage', { data });
          } else {
            alert(`Scanned: ${data}`);
            setTimeout(() => setScanned(false), 2000);
          }
        }}
      />

      {/* Overlay rendered as sibling, not child, to avoid CameraView children warning */}
      <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' }} pointerEvents="none">
        <Text className="text-white text-lg font-bold mb-8">Align QR code within frame</Text>
        
        <View className="w-64 h-64 border-2 border-green-accent rounded-xl relative overflow-hidden">
          <View className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg" />
          <View className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg" />
          <View className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg" />
          <View className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg" />
          <View className="w-full h-1 bg-green-accent opacity-80" />
        </View>
      </View>
    </View>
  );
};
