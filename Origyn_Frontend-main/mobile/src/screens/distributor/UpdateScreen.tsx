import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Truck, CheckCircle, Package, ArrowLeft, MapPin } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Button } from '../../components/ui/Button';
import { useStore } from '../../store/useStore';
import api from '../../services/api';
import * as Location from 'expo-location';

const DISTRIBUTOR_STAGES = [
  { key: 'IN_TRANSIT', title: 'In Transit', desc: 'Product picked up and in transit' },
  { key: 'AT_WAREHOUSE', title: 'Arrived at Warehouse', desc: 'Received at distribution center' },
  { key: 'QUALITY_CHECK', title: 'Quality Check Passed', desc: 'Temperature & conditions verified' },
  { key: 'DISPATCHED', title: 'Dispatched to Retailer', desc: 'En route to final destination' },
];

const RETAILER_STAGES = [
  { key: 'AT_RETAILER', title: 'Received at Store', desc: 'Product received and stocked' },
  { key: 'DELIVERED', title: 'Sold / Delivered', desc: 'Successfully delivered to customer' },
];

export const UpdateScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { role } = useStore();
  const rawId = route.params?.data || route.params?.productId || '';
  const productId = rawId.split(':')[0];

  const [product, setProduct] = useState<any>(null);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [locationData, setLocationData] = useState<{ coords: string; address: string } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const STAGES = role === 'retailer' ? RETAILER_STAGES : DISTRIBUTOR_STAGES;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${productId}`);
        setProduct(res.data);
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };
    if (productId) fetchProduct();
  }, [productId]);

  useEffect(() => {
    fetchLocation();
  }, []);

  const fetchLocation = async () => {
    setLoadingLocation(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is needed for supply chain tracking.');
        setLocationData({ coords: '0.0,0.0', address: 'Location unavailable' });
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      let reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      const coords = `${location.coords.latitude.toFixed(4)},${location.coords.longitude.toFixed(4)}`;
      const address = reverseGeocode[0]
        ? `${reverseGeocode[0].city || reverseGeocode[0].region}, ${reverseGeocode[0].country}`
        : 'Unknown Location';
      setLocationData({ coords, address });
    } catch (err) {
      console.error("Location error:", err);
      setLocationData({ coords: '0.0,0.0', address: 'Location error' });
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedStage) {
      Alert.alert("Select a stage", "Please select a new stage before updating.");
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post(`/products/${productId}/update`, {
        new_stage: selectedStage,
        gps: locationData?.coords || "0.0,0.0",
        temperature: 4.0,
        timestamp: new Date().toISOString(),
      });
      Alert.alert("Success", `Stage updated to ${selectedStage}`, [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.detail || "Failed to update stage.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const ALL_STAGES_ORDER = ['CREATED', 'IN_TRANSIT', 'AT_WAREHOUSE', 'QUALITY_CHECK', 'DISPATCHED', 'AT_RETAILER', 'DELIVERED'];
  const currentStageIndex = product ? ALL_STAGES_ORDER.indexOf(product.current_stage) : -1;

  const roleColor = role === 'retailer' ? '#A78BFA' : '#38BDF8';
  const roleLabel = role === 'retailer' ? 'Update Inventory Status' : 'Update Transit Stage';

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-navy-900 items-center justify-center">
        <ActivityIndicator size="large" color={roleColor} />
        <Text className="text-gray-400 mt-4">Loading product...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-navy-900 px-4">
      <View className="flex-row items-center mt-4 mb-6">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-navy-800 rounded-full mr-3">
          <ArrowLeft color="#fff" size={20} />
        </TouchableOpacity>
        <View style={{ width: 48, height: 48, backgroundColor: `${roleColor}30`, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
          {role === 'retailer' ? <Package color={roleColor} size={24} /> : <Truck color={roleColor} size={24} />}
        </View>
        <View>
          <Text className="text-white text-xl font-bold">{roleLabel}</Text>
          <Text className="text-gray-400 text-sm">{product?.name || 'Product'} • #{productId?.split('-').pop()}</Text>
        </View>
      </View>

      <ScrollView className="flex-1">
        <View className="bg-navy-800 rounded-2xl p-5 mb-4 border border-white/5">
          <Text className="text-gray-400 text-sm mb-4">Current Status</Text>
          <View className="flex-row justify-between mb-2">
            <Text className="text-white font-medium">Current Stage</Text>
            <Text style={{ color: roleColor, fontWeight: 'bold' }}>{product?.current_stage || 'CREATED'}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-400 text-xs">Last Updated</Text>
            <Text className="text-gray-400 text-xs">{product?.created_at ? new Date(product.created_at).toLocaleString() : 'N/A'}</Text>
          </View>
        </View>

        <View className="bg-navy-800 rounded-2xl p-5 mb-6 border border-white/5">
          <View className="flex-row items-center mb-3">
            <MapPin color={roleColor} size={18} />
            <Text className="text-white font-medium ml-2">GPS Location</Text>
          </View>
          {loadingLocation ? (
            <View className="flex-row items-center">
              <ActivityIndicator size="small" color={roleColor} />
              <Text className="text-gray-400 ml-2">Fetching location...</Text>
            </View>
          ) : (
            <View>
              <Text style={{ color: roleColor, fontFamily: 'monospace', fontSize: 13 }}>{locationData?.coords}</Text>
              <Text className="text-gray-400 text-xs mt-1">{locationData?.address}</Text>
              <TouchableOpacity onPress={fetchLocation} className="mt-2">
                <Text style={{ color: roleColor, fontSize: 12, textDecorationLine: 'underline' }}>Refresh Location</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <Text className="text-white font-bold mb-4">Select New Stage</Text>

        {STAGES.map((stage) => {
          const isActive = selectedStage === stage.key;
          const stageGlobalIndex = ALL_STAGES_ORDER.indexOf(stage.key);
          const isPast = stageGlobalIndex <= currentStageIndex;
          return (
            <TouchableOpacity 
              key={stage.key}
              disabled={isPast}
              style={{
                flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, marginBottom: 12,
                backgroundColor: isActive ? `${roleColor}15` : isPast ? 'rgba(15,20,35,0.5)' : '#0c1220',
                borderWidth: 1,
                borderColor: isActive ? roleColor : isPast ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.05)',
                opacity: isPast ? 0.5 : 1,
              }}
              onPress={() => setSelectedStage(stage.key)}
            >
              <View style={{
                width: 24, height: 24, borderRadius: 12, borderWidth: 2, marginRight: 16,
                alignItems: 'center', justifyContent: 'center',
                borderColor: isActive ? roleColor : isPast ? '#4ADE80' : '#6B7280',
                backgroundColor: isActive ? `${roleColor}30` : isPast ? 'rgba(74,222,128,0.2)' : 'transparent',
              }}>
                {isActive && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: roleColor }} />}
                {isPast && !isActive && <CheckCircle color="#4ADE80" size={14} />}
              </View>
              <View className="flex-1">
                <Text style={{ fontWeight: 'bold', color: isActive ? roleColor : isPast ? '#6B7280' : '#fff' }}>{stage.title}</Text>
                <Text className="text-gray-400 text-xs mt-1">{stage.desc}</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        <View className="mt-8 mb-10">
          <Button 
            title={isSubmitting ? "Updating..." : "Update Blockchain"} 
            color={role === 'retailer' ? 'purple' : 'blue'}
            onPress={handleUpdate}
            disabled={!selectedStage || isSubmitting}
          />
          <Text className="text-gray-500 text-center text-xs mt-4">This action will cost ~0.001 MATIC and cannot be undone.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
