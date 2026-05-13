import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../store/useStore';
import api from '../../services/api';
import { Package, MapPin, QrCode, Star, Settings, RefreshCcw } from 'lucide-react-native';

export const FarmerHomeScreen = ({ navigation }: any) => {
  const { user } = useStore();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
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
    fetchData();
  }, []);

  const stats = {
    batches: products.length,
    activeQrs: products.length * 12, // Simulated active scans or similar
    avgTrust: products.length > 0 ? (products.reduce((acc, p) => acc + (p.trust_score || 0), 0) / products.length).toFixed(1) : '100'
  };

  return (
    <SafeAreaView className="flex-1 bg-navy-900 px-4">
      <View className="flex-row justify-between items-center mt-4 mb-8">
        <View>
          <Text className="text-gray-400 text-lg">Good morning,</Text>
          <Text className="text-white text-2xl font-bold">{user?.name || 'Farmer'} 🌾</Text>
        </View>
        <TouchableOpacity 
          className="w-12 h-12 bg-navy-800 rounded-full items-center justify-center"
          onPress={() => navigation.navigate('Profile')}
        >
          <Settings color="#fff" size={24} />
        </TouchableOpacity>
      </View>

      {/* Stats Row */}
      <View className="flex-row justify-between mb-8">
        <View className="bg-navy-800 rounded-2xl p-4 w-[31%] border border-white/5">
          <Text className="text-white text-2xl font-black mb-1">{stats.batches}</Text>
          <Text className="text-gray-400 text-xs">Batches Registered</Text>
        </View>
        <View className="bg-navy-800 rounded-2xl p-4 w-[31%] border border-white/5">
          <Text className="text-white text-2xl font-black mb-1">{stats.activeQrs}</Text>
          <Text className="text-gray-400 text-xs">Active QRs</Text>
        </View>
        <View className="bg-navy-800 rounded-2xl p-4 w-[31%] border border-white/5">
          <Text className="text-green-accent text-2xl font-black mb-1">{stats.avgTrust}</Text>
          <Text className="text-gray-400 text-xs">Avg Trust Score</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View className="flex-row flex-wrap justify-between mb-8">
        {[
          { icon: Package, label: 'New Batch', color: 'bg-farmer', action: () => navigation.navigate('ProductRegistration') },
          { icon: Star, label: 'My Products', color: 'bg-navy-700', action: () => navigation.navigate('Products') },
          { icon: QrCode, label: 'Generate QR', color: 'bg-navy-700', action: () => navigation.navigate('ProductRegistration') },
          { icon: MapPin, label: 'Wallet', color: 'bg-navy-700', action: () => navigation.navigate('Wallet') },
        ].map((actionItem, i) => {
          const Icon = actionItem.icon;
          return (
            <TouchableOpacity key={i} className="items-center w-1/4" onPress={actionItem.action}>
              <View className={`w-14 h-14 rounded-full ${actionItem.color} items-center justify-center mb-2 shadow-[0_0_15px_rgba(74,222,128,0.2)]`}>
                <Icon color={actionItem.color === 'bg-farmer' ? '#0A0F1E' : '#fff'} size={24} />
              </View>
              <Text className="text-white text-xs font-medium">{actionItem.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Recent Activity */}
      <View className="flex-1">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-white text-lg font-bold">Recent Activity</Text>
          <TouchableOpacity onPress={fetchData}>
            <RefreshCcw color="#4ADE80" size={16} />
          </TouchableOpacity>
        </View>
        <ScrollView>
          {loading ? (
             <Text className="text-gray-500 text-center mt-10">Loading batches...</Text>
          ) : products.length === 0 ? (
             <Text className="text-gray-500 text-center mt-10">No batches registered yet.</Text>
          ) : (
            products.slice(0, 5).map((prod) => (
              <TouchableOpacity 
                key={prod.product_id} 
                className="flex-row items-center bg-navy-800 rounded-xl p-4 mb-3 border border-white/5"
                onPress={() => navigation.navigate('ProductDetail', { productId: prod.product_id })}
              >
                <View className="w-12 h-12 bg-gray-700 rounded-lg mr-4 items-center justify-center">
                  <Package color="#4ADE80" size={20} />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-bold">{prod.name} #{prod.product_id.split('-').pop()}</Text>
                  <Text className="text-gray-400 text-xs mt-1">Status: {prod.current_stage} • {new Date(prod.created_at).toLocaleDateString()}</Text>
                </View>
                <View className="bg-green-accent/20 px-2 py-1 rounded">
                  <Text className="text-green-accent text-xs font-bold">{Math.round(prod.trust_score || 100)}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};
