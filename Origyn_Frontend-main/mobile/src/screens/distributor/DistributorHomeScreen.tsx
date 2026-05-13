import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Truck, Package, Maximize, Settings, MapPin, BarChart2, RefreshCcw } from 'lucide-react-native';
import { useStore } from '../../store/useStore';
import api from '../../services/api';

export const DistributorHomeScreen = ({ navigation }: any) => {
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

  const inTransit = products.filter(p => p.current_stage === 'IN_TRANSIT' || p.current_stage === 'DISPATCHED').length;
  const delivered = products.filter(p => p.current_stage === 'DELIVERED' || p.current_stage === 'AT_RETAILER').length;

  const getStageStyle = (stage: string) => {
    switch (stage?.toUpperCase()) {
      case 'CREATED': return { label: 'Registered', color: '#4ADE80' };
      case 'IN_TRANSIT': return { label: 'In Transit', color: '#38BDF8' };
      case 'AT_WAREHOUSE': return { label: 'At Warehouse', color: '#A78BFA' };
      case 'AT_RETAILER': return { label: 'At Retailer', color: '#FBBF24' };
      case 'DELIVERED': return { label: 'Delivered', color: '#10B981' };
      default: return { label: stage || 'Unknown', color: '#6B7280' };
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <SafeAreaView className="flex-1 bg-navy-900">
      <View className="px-4 pt-4 pb-2 flex-row justify-between items-center">
        <View>
          <Text className="text-gray-400">Welcome back,</Text>
          <Text className="text-white text-2xl font-bold">{user?.name || 'Distributor'} 🚚</Text>
        </View>
        <TouchableOpacity 
          className="w-12 h-12 bg-navy-800 rounded-full items-center justify-center"
          onPress={() => navigation.navigate('Profile')}
        >
          <Settings color="#fff" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        <View className="flex-row justify-between mb-6">
          <View className="bg-navy-800 rounded-2xl p-4 flex-1 mr-2 border border-blue-500/20">
            <Truck color="#38BDF8" size={24} />
            <Text className="text-white text-2xl font-bold mt-2">{inTransit}</Text>
            <Text className="text-gray-400 text-xs">In Transit</Text>
          </View>
          <View className="bg-navy-800 rounded-2xl p-4 flex-1 ml-2 border border-white/5">
            <Package color="#fff" size={24} />
            <Text className="text-white text-2xl font-bold mt-2">{delivered}</Text>
            <Text className="text-gray-400 text-xs">Delivered</Text>
          </View>
        </View>

        <View className="flex-row justify-between mb-6">
          <TouchableOpacity 
            className="bg-blue-500 py-4 rounded-xl items-center flex-row justify-center flex-1 mr-2"
            onPress={() => navigation.navigate('Scan')}
          >
            <Maximize color="#fff" size={20} />
            <Text className="text-white font-bold text-sm ml-2">Scan & Update</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className="bg-navy-800 py-4 rounded-xl items-center flex-row justify-center flex-1 ml-2 border border-white/10"
            onPress={() => navigation.navigate('Products')}
          >
            <BarChart2 color="#fff" size={20} />
            <Text className="text-white font-bold text-sm ml-2">View All</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-white text-lg font-bold">My Shipments</Text>
          <TouchableOpacity onPress={fetchData}>
            <RefreshCcw color="#38BDF8" size={16} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <Text className="text-gray-500 text-center mt-10">Loading shipments...</Text>
        ) : products.length === 0 ? (
          <Text className="text-gray-500 text-center mt-10">No shipments registered yet.</Text>
        ) : (
          products.map((item) => {
            const stageInfo = getStageStyle(item.current_stage);
            return (
              <TouchableOpacity 
                key={item.product_id} 
                className="bg-navy-800 rounded-2xl p-4 mb-4 border border-white/5"
                onPress={() => navigation.navigate('ProductDetail', { productId: item.product_id })}
              >
                <View className="flex-row items-center mb-3">
                  <View className="w-12 h-12 bg-blue-500/10 rounded-xl items-center justify-center mr-4 border border-blue-500/20">
                    <Truck color="#38BDF8" size={24} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-bold text-lg">{item.name} #{item.product_id.split('-').pop()}</Text>
                    <Text style={{ color: stageInfo.color, fontSize: 13 }}>{stageInfo.label}</Text>
                  </View>
                  <Text className="text-gray-400 text-xs">{formatTimeAgo(item.created_at)}</Text>
                </View>
                <View className="flex-row justify-between bg-navy-900 rounded-lg p-3">
                  <View className="flex-row items-center">
                    <MapPin color="#6B7280" size={14} />
                    <Text className="text-gray-400 text-xs ml-1">{item.gps || 'No GPS'}</Text>
                  </View>
                  <View className="bg-green-accent/20 px-2 py-0.5 rounded">
                    <Text className="text-green-accent text-xs font-bold">{Math.round(item.trust_score || 100)}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
