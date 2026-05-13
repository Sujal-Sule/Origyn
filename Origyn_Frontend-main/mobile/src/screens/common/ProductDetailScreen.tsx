import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Package, MapPin, CheckCircle, Clock, Download, Share2, ShieldCheck } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import api from '../../services/api';

export const ProductDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { productId } = route.params;
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const viewShotRef = useRef<any>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${productId}`);
        setProduct(res.data);
      } catch (err) {
        console.error("Error fetching product:", err);
        Alert.alert("Error", "Could not load product details.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleSave = useCallback(async () => {
    try {
      if (viewShotRef.current) {
        const uri = await viewShotRef.current.capture();
        await Sharing.shareAsync(uri, {
          dialogTitle: 'Save QR Code',
          mimeType: 'image/png',
        });
      }
    } catch (e) {
      Alert.alert('Error', 'Could not save QR code.');
    }
  }, []);

  const handleShare = useCallback(async () => {
    try {
      if (viewShotRef.current) {
        const uri = await viewShotRef.current.capture();
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: 'image/png',
            dialogTitle: `Share QR for ${productId}`,
          });
        }
      }
    } catch (e) {
      Alert.alert('Error', 'Could not share QR code.');
    }
  }, [productId]);

  const qrValue = product
    ? `${product.product_id}:${product.current_dcqr_hash}`
    : productId;

  const getStageColor = (stage: string) => {
    switch (stage?.toUpperCase()) {
      case 'CREATED': return '#4ADE80';
      case 'IN_TRANSIT': return '#38BDF8';
      case 'AT_WAREHOUSE': return '#A78BFA';
      case 'AT_RETAILER': return '#FBBF24';
      case 'DELIVERED': return '#10B981';
      default: return '#4ADE80';
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-navy-900 items-center justify-center">
        <Text className="text-gray-400 text-lg">Loading product...</Text>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView className="flex-1 bg-navy-900 items-center justify-center">
        <Text className="text-gray-400 text-lg">Product not found</Text>
        <TouchableOpacity className="mt-4 bg-navy-800 px-6 py-3 rounded-xl" onPress={() => navigation.goBack()}>
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const stageColor = getStageColor(product.current_stage);

  return (
    <SafeAreaView className="flex-1 bg-navy-900">
      <View className="flex-row items-center px-4 pt-4 pb-2">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-navy-800 rounded-full">
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold ml-4">Product Details</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }}>
          <View style={{ backgroundColor: 'white', borderRadius: 24, padding: 24, alignItems: 'center', marginBottom: 20 }}>
            <QRCode
              value={qrValue}
              size={200}
              backgroundColor="white"
              color="#0A0F1E"
            />
            <Text style={{ color: '#0A0F1E', fontWeight: '900', fontSize: 20, marginTop: 16, marginBottom: 4 }}>
              {product.name}
            </Text>
            <Text style={{ color: '#6B7280', fontSize: 12, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>
              {product.product_id}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, backgroundColor: '#F0FDF4', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 100 }}>
              <Text style={{ color: '#16A34A', fontWeight: 'bold', fontSize: 12 }}>
                ORIGYN VERIFIED • Score {Math.round(product.trust_score || 100)}
              </Text>
            </View>
          </View>
        </ViewShot>

        <View className="flex-row justify-between mb-6">
          <TouchableOpacity
            className="flex-1 mr-2 bg-farmer py-4 rounded-xl flex-row items-center justify-center"
            onPress={handleSave}
          >
            <Download color="#0A0F1E" size={20} />
            <Text className="text-navy-900 font-bold ml-2">Save</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 ml-2 bg-navy-800 py-4 rounded-xl flex-row items-center justify-center border border-white/10"
            onPress={handleShare}
          >
            <Share2 color="#fff" size={20} />
            <Text className="text-white font-bold ml-2">Share</Text>
          </TouchableOpacity>
        </View>

        <View className="bg-navy-800 rounded-2xl p-5 mb-6 border border-white/5">
          <Text className="text-gray-400 text-sm mb-4">Batch Information</Text>

          <View className="flex-row justify-between mb-3 border-b border-white/10 pb-3">
            <Text className="text-gray-400">Product</Text>
            <Text className="text-white font-bold">{product.name}</Text>
          </View>
          <View className="flex-row justify-between mb-3 border-b border-white/10 pb-3">
            <Text className="text-gray-400">Category</Text>
            <Text className="text-white font-bold">{product.category || 'General'}</Text>
          </View>
          <View className="flex-row justify-between mb-3 border-b border-white/10 pb-3">
            <Text className="text-gray-400">Batch ID</Text>
            <Text className="text-farmer font-mono font-bold text-xs">{product.product_id}</Text>
          </View>
          <View className="flex-row justify-between mb-3 border-b border-white/10 pb-3">
            <Text className="text-gray-400">Current Stage</Text>
            <View className="flex-row items-center">
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: stageColor, marginRight: 6 }} />
              <Text style={{ color: stageColor, fontWeight: 'bold' }}>{product.current_stage}</Text>
            </View>
          </View>
          <View className="flex-row justify-between mb-3 border-b border-white/10 pb-3">
            <Text className="text-gray-400">Batch Size</Text>
            <Text className="text-white font-bold">{product.batch_size || 'N/A'} kg</Text>
          </View>
          <View className="flex-row justify-between mb-3 border-b border-white/10 pb-3">
            <Text className="text-gray-400">GPS</Text>
            <Text className="text-white font-bold text-xs">{product.gps || 'N/A'}</Text>
          </View>
          <View className="flex-row justify-between mb-3 border-b border-white/10 pb-3">
            <Text className="text-gray-400">Trust Score</Text>
            <Text className="text-farmer font-black">{Math.round(product.trust_score || 100)}/100</Text>
          </View>
          <View className="flex-row justify-between mb-3 border-b border-white/10 pb-3">
            <Text className="text-gray-400">Blockchain Tx</Text>
            <Text className="text-blue-400 font-mono text-xs" numberOfLines={1}>{product.blockchain_tx ? product.blockchain_tx.slice(0, 16) + '...' : 'N/A'}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-400">Registered</Text>
            <Text className="text-white font-bold">{product.created_at ? new Date(product.created_at).toLocaleDateString() : 'N/A'}</Text>
          </View>
        </View>

        {product.anomaly_flag && (
          <View className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-6 flex-row items-center">
            <ShieldCheck color="#EF4444" size={24} />
            <View className="ml-3 flex-1">
              <Text className="text-red-400 font-bold">Anomaly Detected</Text>
              <Text className="text-gray-400 text-xs mt-1">A GPS or timing anomaly has been flagged on this batch.</Text>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};
