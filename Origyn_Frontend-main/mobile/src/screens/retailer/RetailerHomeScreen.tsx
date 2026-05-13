import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Store, Package, CheckCircle, Maximize, Settings, ShieldCheck, AlertTriangle, RefreshCcw } from 'lucide-react-native';
import { useStore } from '../../store/useStore';
import api from '../../services/api';
import { useFocusEffect } from '@react-navigation/native';

export const RetailerHomeScreen = ({ navigation }: any) => {
  const { user } = useStore();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products/my-products');
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching retailer products:", err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const inStock = products.filter(p => p.current_stage !== 'DELIVERED').length;
  const delivered = products.filter(p => p.current_stage === 'DELIVERED').length;
  const flagged = products.filter(p => p.anomaly_flag || p.recalled).length;
  const verifiedPct = products.length > 0 
    ? Math.round((products.filter(p => p.trust_score >= 80).length / products.length) * 100) 
    : 0;

  const getStageInfo = (stage: string) => {
    switch (stage?.toUpperCase()) {
      case 'CREATED': return { label: 'Registered', color: '#4ADE80', verified: true };
      case 'IN_TRANSIT': return { label: 'In Transit', color: '#38BDF8', verified: true };
      case 'AT_WAREHOUSE': return { label: 'At Warehouse', color: '#A78BFA', verified: true };
      case 'QUALITY_CHECK': return { label: 'Quality Checked', color: '#06B6D4', verified: true };
      case 'DISPATCHED': return { label: 'Dispatched', color: '#FBBF24', verified: true };
      case 'AT_RETAILER': return { label: 'At Store', color: '#A78BFA', verified: true };
      case 'DELIVERED': return { label: 'Sold / Delivered', color: '#10B981', verified: true };
      default: return { label: stage || 'Unknown', color: '#6B7280', verified: false };
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

  const recentlyUpdated = [...products]
    .sort((a, b) => new Date(b.last_updated || b.created_at).getTime() - new Date(a.last_updated || a.created_at).getTime())
    .slice(0, 3);

  return (
    <SafeAreaView className="flex-1 bg-navy-900">
      <View className="px-4 pt-4 pb-2 flex-row justify-between items-center">
        <View>
          <Text className="text-gray-400">Welcome back,</Text>
          <Text className="text-white text-2xl font-bold">{user?.name || 'Retailer'} 🏪</Text>
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
          <View className="bg-navy-800 rounded-2xl p-4 flex-1 mr-2 border border-purple-500/20">
            <Store color="#A78BFA" size={24} />
            <Text className="text-white text-2xl font-bold mt-2">{inStock}</Text>
            <Text className="text-gray-400 text-xs">In Stock</Text>
          </View>
          <View className="bg-navy-800 rounded-2xl p-4 flex-1 mx-2 border border-white/5">
            <CheckCircle color="#10B981" size={24} />
            <Text className="text-white text-2xl font-bold mt-2">{verifiedPct}%</Text>
            <Text className="text-gray-400 text-xs">Authenticity</Text>
          </View>
          <View className="bg-navy-800 rounded-2xl p-4 flex-1 ml-2 border border-white/5">
            <AlertTriangle color="#FBBF24" size={24} />
            <Text className="text-white text-2xl font-bold mt-2">{flagged}</Text>
            <Text className="text-gray-400 text-xs">Flagged</Text>
          </View>
        </View>

        <TouchableOpacity 
          className="bg-purple-500 py-4 rounded-xl items-center flex-row justify-center mb-8"
          onPress={() => navigation.navigate('Scan')}
        >
          <Maximize color="#fff" size={20} />
          <Text className="text-white font-bold text-lg ml-2">Scan Incoming Inventory</Text>
        </TouchableOpacity>

        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-white text-lg font-bold">Current Inventory</Text>
          <TouchableOpacity onPress={fetchData}>
            <RefreshCcw color="#A78BFA" size={16} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <Text className="text-gray-500 text-center mt-10">Loading inventory...</Text>
        ) : products.length === 0 ? (
          <View className="items-center mt-10">
            <Package color="#6B7280" size={48} />
            <Text className="text-gray-500 mt-4 text-center">No products in inventory yet.{'\n'}Scan incoming deliveries to add them.</Text>
          </View>
        ) : (
          products.map((item) => {
            const stage = getStageInfo(item.current_stage);
            return (
              <TouchableOpacity
                key={item.product_id}
                className="bg-navy-800 rounded-2xl p-4 mb-4 border border-white/5"
                onPress={() => navigation.navigate('ProductDetail', { productId: item.product_id })}
              >
                <View className="flex-row items-center mb-3">
                  <View className="w-12 h-12 bg-purple-500/10 rounded-xl items-center justify-center mr-4 border border-purple-500/20">
                    <Package color="#A78BFA" size={24} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-bold text-lg">{item.name}</Text>
                    <Text className="text-gray-400 text-sm">#{item.product_id.split('-').pop()} • {item.category || 'General'}</Text>
                  </View>
                  <Text className="text-white font-bold">{item.batch_size || '—'} kg</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <View className={`flex-row items-center px-3 py-1 rounded-full`} style={{ backgroundColor: `${stage.color}15`, borderWidth: 1, borderColor: `${stage.color}30` }}>
                    <ShieldCheck color={stage.color} size={14} />
                    <Text style={{ color: stage.color, fontSize: 12, fontWeight: 'bold', marginLeft: 4 }}>{stage.label}</Text>
                  </View>
                  <Text className="text-gray-400 text-xs">{formatTimeAgo(item.created_at)}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        {recentlyUpdated.length > 0 && (
          <>
            <Text className="text-white text-lg font-bold mb-4 mt-2">Recent Activity</Text>
            {recentlyUpdated.map((item) => {
              const stage = getStageInfo(item.current_stage);
              return (
                <TouchableOpacity 
                  key={`recent-${item.product_id}`}
                  className="bg-navy-800 rounded-2xl p-4 mb-4 border border-white/5 flex-row items-center"
                  onPress={() => navigation.navigate('ProductDetail', { productId: item.product_id })}
                >
                  <View className="w-12 h-12 bg-purple-500/10 rounded-xl items-center justify-center mr-4 border border-purple-500/20">
                    <Package color={stage.color} size={24} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-bold">{item.name} #{item.product_id.split('-').pop()}</Text>
                    <Text style={{ color: stage.color, fontSize: 12 }}>{stage.label}</Text>
                  </View>
                  <Text className="text-gray-400 text-xs">{formatTimeAgo(item.last_updated || item.created_at)}</Text>
                </TouchableOpacity>
              );
            })}
          </>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
};
