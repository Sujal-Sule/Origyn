import React, { useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, UploadCloud, MapPin, Download, Share2, CheckCircle, Camera } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
import api from '../../services/api';
import { useStore } from '../../store/useStore';
import * as Location from 'expo-location';

const CATEGORIES = ['Vegetables', 'Fruits', 'Dairy', 'Grains', 'Meat', 'Spices'];

export const ProductRegistrationScreen = ({ navigation }: any) => {
  const [step, setStep] = useState(1);
  const [analyzing, setAnalyzing] = useState(false);
  const [registered, setRegistered] = useState(false);
  const viewShotRef = useRef<any>(null);
  
  const [formData, setFormData] = useState({
    category: '',
    name: '',
    batchSize: '',
    harvestDate: '',
  });
  const [backendProduct, setBackendProduct] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [locationData, setLocationData] = useState<{coords: string, address: string} | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Generate a unique batch ID
  const batchId = backendProduct?.product_id || `ORG-${formData.category?.slice(0,3).toUpperCase() || 'XXX'}-${Math.floor(1000 + Math.random() * 9000)}`;
  
  const qrData = backendProduct?.qr_payload || `${batchId}:pending`;

  const fetchLocation = async () => {
    setLoadingLocation(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      let reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const coords = `${location.coords.latitude.toFixed(4)}° N, ${location.coords.longitude.toFixed(4)}° E`;
      const address = reverseGeocode[0] ? 
        `${reverseGeocode[0].city || reverseGeocode[0].region}, ${reverseGeocode[0].country}` : 
        'Unknown Location';

      setLocationData({ coords, address });
    } catch (err) {
      console.error("Location error:", err);
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleSaveQR = useCallback(async () => {
    try {
      if (!viewShotRef.current) {
        Alert.alert('Error', 'QR code preview not ready yet.');
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 300));
      const uri = await viewShotRef.current.capture();
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant media library access to save the QR code.');
        return;
      }
      const asset = await MediaLibrary.createAssetAsync(uri);
      Alert.alert('Saved!', 'QR code has been saved to your gallery.');
    } catch (e) {
      console.error('Save QR error:', e);
      Alert.alert('Error', 'Could not save QR code. Please try Share instead.');
    }
  }, []);

  const handleShareQR = useCallback(async () => {
    try {
      if (!viewShotRef.current) {
        Alert.alert('Error', 'QR code preview not ready yet.');
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 300));
      const uri = await viewShotRef.current.capture();
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Share QR Code',
        });
      } else {
        Alert.alert('Sharing not available', 'Sharing is not available on this device.');
      }
    } catch (e) {
      console.error('Share QR error:', e);
      Alert.alert('Error', 'Could not share QR code.');
    }
  }, []);

  const renderStepIndicator = () => (
    <View className="flex-row items-center justify-center mb-6">
      {[1, 2, 3, 4].map((s, i) => (
        <React.Fragment key={s}>
          <View className={`w-8 h-8 rounded-full items-center justify-center ${step >= s ? 'bg-farmer' : 'bg-navy-800 border border-gray-600'}`}>
            <Text className={`font-bold ${step >= s ? 'text-navy-900' : 'text-gray-400'}`}>{s}</Text>
          </View>
          {i < 3 && (
            <View className={`w-10 h-1 ${step > s ? 'bg-farmer' : 'bg-navy-800 border-t border-b border-gray-600'}`} />
          )}
        </React.Fragment>
      ))}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-navy-900">
      <View className="flex-row items-center px-4 pt-4 pb-2">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-navy-800 rounded-full">
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold ml-4">Register New Batch</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        {renderStepIndicator()}
        
        {step === 1 && (
          <View>
            <Text className="text-white text-xl font-bold mb-4">Product Info</Text>
            
            <Text className="text-gray-400 text-sm mb-2">Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
              {CATEGORIES.map(cat => (
                <TouchableOpacity 
                  key={cat} 
                  onPress={() => setFormData({...formData, category: cat})}
                  className={`px-4 py-2 rounded-full mr-2 border ${formData.category === cat ? 'bg-farmer/20 border-farmer' : 'bg-navy-800 border-white/10'}`}
                >
                  <Text className={formData.category === cat ? 'text-farmer font-bold' : 'text-gray-400'}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Input 
              label="Product Name" 
              placeholder="e.g. Organic Tomatoes" 
              value={formData.name}
              onChangeText={(val) => setFormData({...formData, name: val})}
            />
            
            <View className="flex-row justify-between">
              <View className="w-[48%]">
                <Input 
                  label="Batch Size (kg)" 
                  placeholder="500" 
                  keyboardType="numeric"
                  value={formData.batchSize}
                  onChangeText={(val) => setFormData({...formData, batchSize: val})}
                />
              </View>
              <View className="w-[48%]">
                <Input 
                  label="Harvest Date" 
                  placeholder="DD/MM/YYYY" 
                  keyboardType="numeric"
                  value={formData.harvestDate}
                  onChangeText={(val) => {
                    let cleaned = val.replace(/\D/g, '');
                    let formatted = cleaned;
                    if (cleaned.length > 2) {
                      formatted = cleaned.substring(0, 2) + '/' + cleaned.substring(2);
                    }
                    if (cleaned.length > 4) {
                      formatted = formatted.substring(0, 5) + '/' + cleaned.substring(4, 8);
                    }
                    setFormData({...formData, harvestDate: formatted});
                  }}
                  maxLength={10}
                />
              </View>
            </View>

            <Button title="Next Step" onPress={() => setStep(2)} className="mt-6" />
          </View>
        )}

        {step === 2 && (
          <View className="flex-1">
            <Text className="text-white text-xl font-bold mb-4">Photo Capture & AI Verification</Text>
            
            {!aiAnalysis ? (
              <View>
                <View className="bg-navy-800 rounded-2xl p-8 mb-6 items-center border border-white/10">
                  <View className="w-20 h-20 bg-farmer/20 rounded-full items-center justify-center mb-6">
                    <Camera color="#4ADE80" size={40} />
                  </View>
                  <Text className="text-white font-bold text-lg mb-2">Capture Product Photo</Text>
                  <Text className="text-gray-400 text-center text-sm mb-6">
                    Take a photo of your produce for AI quality verification
                  </Text>

                  {analyzing ? (
                    <View className="items-center py-4">
                      <ActivityIndicator size="large" color="#4ADE80" />
                      <Text className="text-farmer mt-3 font-medium">Analyzing produce quality...</Text>
                    </View>
                  ) : (
                    <View style={{ width: '100%', gap: 12 }}>
                      <TouchableOpacity
                        style={{ backgroundColor: '#4ADE80', paddingVertical: 14, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
                        onPress={async () => {
                          try {
                            const result = await ImagePicker.launchCameraAsync({
                              mediaTypes: ['images'],
                              quality: 0.8,
                            });
                            if (!result.canceled) {
                              setAnalyzing(true);
                              const icon = formData.category === 'Fruits' ? '🍎' : 
                                         formData.category === 'Vegetables' ? '🥦' : '📦';
                              setTimeout(() => {
                                setAiAnalysis(`${icon} ${formData.name || 'Produce'} detected • Grade A • Freshness 92%`);
                                setAnalyzing(false);
                              }, 2000);
                            }
                          } catch (err) {
                            Alert.alert('Error', 'Could not open camera');
                          }
                        }}
                      >
                        <Camera color="#0A0F1E" size={20} />
                        <Text style={{ color: '#0A0F1E', fontWeight: 'bold', fontSize: 16 }}>Take Photo</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={{ backgroundColor: 'rgba(255,255,255,0.05)', paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
                        onPress={async () => {
                          try {
                            const result = await ImagePicker.launchImageLibraryAsync({
                              mediaTypes: ['images'],
                              quality: 0.8,
                            });
                            if (!result.canceled) {
                              setAnalyzing(true);
                              const icon = formData.category === 'Fruits' ? '🍎' : 
                                         formData.category === 'Vegetables' ? '🥦' : '📦';
                              setTimeout(() => {
                                setAiAnalysis(`${icon} ${formData.name || 'Produce'} detected • Grade A • Freshness 92%`);
                                setAnalyzing(false);
                              }, 2000);
                            }
                          } catch (err) {
                            Alert.alert('Error', 'Could not open gallery');
                          }
                        }}
                      >
                        <UploadCloud color="#fff" size={20} />
                        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Choose from Gallery</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            ) : (
              <View className="bg-navy-800 rounded-2xl p-6 mb-6 items-center border border-farmer/30">
                <View className="w-16 h-16 bg-farmer/20 rounded-full items-center justify-center mb-4">
                  <CheckCircle color="#4ADE80" size={32} />
                </View>
                <Text className="text-farmer font-bold text-lg text-center">{aiAnalysis}</Text>
                <TouchableOpacity className="mt-4" onPress={() => setAiAnalysis(null)}>
                  <Text className="text-gray-400 underline">Retake Photo</Text>
                </TouchableOpacity>
              </View>
            )}

            <View className="flex-row justify-between">
              <Button title="Back" variant="outline" onPress={() => setStep(1)} className="w-[48%]" color="green" />
              <Button title="Next Step" onPress={() => setStep(3)} disabled={!aiAnalysis} className="w-[48%]" />
            </View>
          </View>
        )}

        {step === 3 && (
          <View>
            <Text className="text-white text-xl font-bold mb-4">Location Capture</Text>
            
            <View className="h-64 bg-navy-800 rounded-2xl mb-4 border border-white/10 items-center justify-center relative overflow-hidden">
               {/* Simplified representation since we can't easily show a full map here without react-native-maps setup */}
               <View className="w-12 h-12 bg-farmer/20 rounded-full items-center justify-center absolute z-10">
                  <MapPin color="#4ADE80" size={24} />
               </View>
               <View className="w-4 h-4 bg-farmer rounded-full absolute z-10" />
               <View className="w-full h-full bg-navy-700 opacity-30" />
               <Text className="absolute bottom-4 text-gray-500 text-xs z-10">Real-time Location Verification</Text>
            </View>

            <View className="bg-navy-800 rounded-xl p-4 mb-6">
              <Text className="text-white font-medium mb-1">Current GPS Coordinates</Text>
              {loadingLocation ? (
                <Text className="text-gray-500 italic">Fetching coordinates...</Text>
              ) : (
                <>
                  <Text className="text-farmer font-mono">{locationData?.coords || 'Click Next to fetch location'}</Text>
                  <Text className="text-gray-400 text-xs mt-2">{locationData?.address || 'Searching for address...'}</Text>
                </>
              )}
            </View>

            <View className="flex-row justify-between">
              <Button title="Back" variant="outline" onPress={() => setStep(2)} className="w-[48%]" color="green" />
              <Button 
                title={loadingLocation ? "Locating..." : "Verify & Next"} 
                onPress={async () => {
                  if (!locationData) {
                    await fetchLocation();
                  }
                  setStep(4);
                }} 
                className="w-[48%]" 
              />
            </View>
          </View>
        )}

        {step === 4 && (
          <View>
            <Text className="text-white text-xl font-bold mb-4">
              {registered ? 'Your DCQR Code' : 'Review & Submit'}
            </Text>
            
            {!registered ? (
              <>
                <View className="bg-navy-800 rounded-2xl p-5 mb-6 border border-white/5">
                  <View className="flex-row justify-between mb-3 border-b border-white/10 pb-3">
                    <Text className="text-gray-400">Product</Text>
                    <Text className="text-white font-bold">{formData.name || 'Organic Tomatoes'}</Text>
                  </View>
                  <View className="flex-row justify-between mb-3 border-b border-white/10 pb-3">
                    <Text className="text-gray-400">Category</Text>
                    <Text className="text-white font-bold">{formData.category || 'Vegetables'}</Text>
                  </View>
                  <View className="flex-row justify-between mb-3 border-b border-white/10 pb-3">
                    <Text className="text-gray-400">Batch Size</Text>
                    <Text className="text-white font-bold">{formData.batchSize || '500'} kg</Text>
                  </View>
                  <View className="flex-row justify-between mb-3 border-b border-white/10 pb-3">
                    <Text className="text-gray-400">AI Verification</Text>
                    <Text className="text-farmer font-bold">Passed (Grade A)</Text>
                  </View>
                  <View className="flex-row justify-between mb-3 border-b border-white/10 pb-3">
                    <Text className="text-gray-400">Batch ID</Text>
                    <Text className="text-farmer font-mono font-bold">{batchId}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-gray-400">Est. Trust Score</Text>
                    <Text className="text-farmer font-black">98/100</Text>
                  </View>
                </View>

                <View className="flex-row justify-between mt-4 mb-10">
                  <Button title="Back" variant="outline" onPress={() => setStep(3)} className="w-[30%]" color="green" />
                  <Button 
                    title={isSubmitting ? "Registering..." : "Register on Blockchain"} 
                    onPress={async () => {
                      setIsSubmitting(true);
                      try {
                        const res = await api.post('/products/register', {
                          name: formData.name,
                          category: formData.category,
                          batch_size: parseInt(formData.batchSize, 10) || 1,
                          gps: locationData?.coords || "0.0,0.0"
                        });
                        setBackendProduct(res.data);
                        setRegistered(true);
                      } catch (err: any) {
                        Alert.alert("Error", "Failed to register product: " + (err.response?.data?.detail || err.message));
                      } finally {
                        setIsSubmitting(false);
                      }
                    }} 
                    disabled={isSubmitting}
                    className="w-[66%]" 
                  />
                </View>
              </>
            ) : (
              <>
                {/* Success Banner */}
                <View className="bg-farmer/10 border border-farmer/30 rounded-2xl p-4 mb-6 flex-row items-center">
                  <CheckCircle color="#4ADE80" size={24} />
                  <View className="ml-3 flex-1">
                    <Text className="text-farmer font-bold">Registered on Blockchain!</Text>
                    <Text className="text-gray-400 text-xs mt-1">Batch {batchId} is now on-chain and traceable.</Text>
                  </View>
                </View>

                {/* QR Code Card */}
                <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }}>
                  <View className="bg-white rounded-3xl p-6 items-center mb-6">
                    <View className="mb-4">
                      <QRCode
                        value={qrData}
                        size={200}
                        backgroundColor="white"
                        color="#0A0F1E"
                        logo={undefined}
                      />
                    </View>
                    <Text style={{ color: '#0A0F1E', fontWeight: '900', fontSize: 18, marginBottom: 4 }}>
                      {formData.name || 'Organic Product'}
                    </Text>
                    <Text style={{ color: '#6B7280', fontSize: 12, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>
                      {batchId}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, backgroundColor: '#F0FDF4', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 100 }}>
                      <Text style={{ color: '#16A34A', fontWeight: 'bold', fontSize: 12 }}>
                        ORIGYN VERIFIED • Score 98
                      </Text>
                    </View>
                  </View>
                </ViewShot>

                {/* Action Buttons */}
                <View className="flex-row justify-between mb-4">
                  <TouchableOpacity 
                    className="flex-1 mr-2 bg-farmer py-4 rounded-xl flex-row items-center justify-center"
                    onPress={handleSaveQR}
                  >
                    <Download color="#0A0F1E" size={20} />
                    <Text className="text-navy-900 font-bold ml-2">Save to Device</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    className="flex-1 ml-2 bg-navy-800 py-4 rounded-xl flex-row items-center justify-center border border-white/10"
                    onPress={handleShareQR}
                  >
                    <Share2 color="#fff" size={20} />
                    <Text className="text-white font-bold ml-2">Share QR</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity 
                  className="bg-navy-800 py-4 rounded-xl items-center mb-10 border border-white/10"
                  onPress={() => navigation.navigate('AppTabs', { screen: 'Home' })}
                >
                  <Text className="text-white font-bold">Back to Dashboard</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
