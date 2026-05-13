import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Package, Search, RefreshCcw } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../../store/useStore';
import api from '../../services/api';

export const ProductsScreen = () => {
  const navigation = useNavigation<any>();
  const { role } = useStore();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products/my-products');
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const getStageColor = (stage: string) => {
    switch (stage?.toUpperCase()) {
      case 'CREATED': return '#4ADE80';
      case 'IN_TRANSIT': return '#38BDF8';
      case 'AT_WAREHOUSE': return '#A78BFA';
      case 'AT_RETAILER': return '#FBBF24';
      case 'DELIVERED': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getRoleAccent = () => {
    switch (role) {
      case 'farmer': return '#4ADE80';
      case 'distributor': return '#38BDF8';
      case 'retailer': return '#A78BFA';
      case 'consumer': return '#FBBF24';
      default: return '#00FF88';
    }
  };

  const accent = getRoleAccent();

  return (
    <SafeAreaView className="flex-1 bg-navy-900">
      <View className="px-4 pt-4 pb-2 flex-row justify-between items-center">
        <Text className="text-white text-2xl font-bold">{role === 'consumer' ? 'Recent History' : 'Products'}</Text>
        <TouchableOpacity 
          className="w-10 h-10 bg-navy-800 rounded-full items-center justify-center"
          onPress={fetchProducts}
        >
          <RefreshCcw color="#fff" size={18} />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-gray-400">
            {loading ? 'Loading...' : `${products.length} ${role === 'consumer' ? 'Recent Scans' : 'Registered Items'}`}
          </Text>
        </View>

        {loading ? (
          <Text className="text-gray-500 text-center mt-10">Loading products...</Text>
        ) : products.length === 0 ? (
          <View className="items-center mt-16">
            <Package color="#6B7280" size={48} />
            <Text className="text-gray-500 mt-4 text-center">
              {role === 'consumer' 
                ? "No products scanned yet.\nScan a QR code to see it here." 
                : "No products registered yet.\nStart by registering a new batch."}
            </Text>
          </View>
        ) : (
          products.map((item) => {
            const stageColor = getStageColor(item.current_stage);
            return (
              <TouchableOpacity 
                key={item.product_id}
                className="bg-navy-800 rounded-2xl p-4 mb-4 border border-white/5 flex-row items-center"
                onPress={() => navigation.navigate('ProductDetail', { productId: item.product_id })}
              >
                <View className="w-12 h-12 bg-navy-900 rounded-xl items-center justify-center mr-4">
                  <Package color={accent} size={24} />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-bold text-lg">{item.name}</Text>
                  <View className="flex-row items-center mt-1">
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: stageColor, marginRight: 6 }} />
                    <Text style={{ color: stageColor, fontSize: 12 }}>{item.current_stage}</Text>
                    <Text className="text-gray-600 text-xs mx-2">•</Text>
                    <Text className="text-gray-400 text-xs">{new Date(item.created_at).toLocaleDateString()}</Text>
                  </View>
                </View>
                <Text style={{ color: accent, fontWeight: 'bold', fontSize: 12 }}>#{item.product_id.split('-').pop()}</Text>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
