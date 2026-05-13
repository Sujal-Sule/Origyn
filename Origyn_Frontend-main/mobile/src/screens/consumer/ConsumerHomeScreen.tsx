import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../store/useStore';
import api from '../../services/api';
import { QrCode, Coins, Star, Settings, RefreshCcw } from 'lucide-react-native';

export const ConsumerHomeScreen = ({ navigation }: any) => {
  const { user } = useStore();
  const [balance, setBalance] = useState(user?.tokens || 0);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const balanceRes = await api.get('/tokens/balance');
      setBalance(balanceRes.data.balance);
      
      const historyRes = await api.get('/tokens/history');
      setHistory(historyRes.data.history || historyRes.data || []);
    } catch (err) {
      console.error("Error fetching consumer data:", err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  return (
    <SafeAreaView className="flex-1 bg-navy-900 px-4">
      <View className="flex-row justify-between items-center mt-4 mb-8">
        <View>
          <Text className="text-gray-400 text-lg">Hello,</Text>
          <Text className="text-white text-2xl font-bold">{user?.name || 'Consumer'}</Text>
        </View>
        <TouchableOpacity 
          className="w-12 h-12 bg-navy-800 rounded-full items-center justify-center"
          onPress={() => navigation.navigate('Profile')}
        >
          <Settings color="#fff" size={24} />
        </TouchableOpacity>
      </View>

      {/* Wallet Card */}
      <View className="bg-gradient-to-r from-consumer/20 to-navy-800 border border-consumer/30 rounded-3xl p-6 mb-8 relative overflow-hidden">
        <View className="absolute -right-10 -top-10 w-32 h-32 bg-consumer/10 rounded-full"></View>
        <Text className="text-gray-400 font-medium mb-1">ORIGYN Balance</Text>
        <View className="flex-row items-baseline gap-2 mb-4">
          <Text className="text-consumer text-5xl font-black">{balance}</Text>
          <Text className="text-consumer font-bold">Tokens</Text>
        </View>
        <View className="bg-navy-900/50 self-start px-4 py-2 rounded-full border border-consumer/20">
          <Text className="text-consumer font-bold text-xs">GOLD TIER • 50 to next</Text>
        </View>
      </View>

      {/* Big Scan Button */}
      <View className="items-center mb-8">
        <TouchableOpacity 
          className="w-48 h-48 bg-consumer/10 rounded-full items-center justify-center relative"
          onPress={() => navigation.navigate('Scan')}
        >
          <View className="absolute inset-2 bg-consumer/20 rounded-full animate-pulse"></View>
          <View className="w-32 h-32 bg-consumer rounded-full items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.6)]">
            <QrCode color="#0A0F1E" size={48} />
          </View>
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold mt-4">Scan Product</Text>
        <Text className="text-gray-400 mt-1">Scan QR to verify & earn tokens</Text>
      </View>

      {/* Recent Scans */}
      <View className="flex-1">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-white text-lg font-bold">Recent Scans</Text>
          <TouchableOpacity onPress={fetchData}>
            <RefreshCcw color="#FBBF24" size={16} />
          </TouchableOpacity>
        </View>
        
        {loading ? (
          <Text className="text-gray-500 text-center mt-10">Loading history...</Text>
        ) : history.length === 0 ? (
          <Text className="text-gray-500 text-center mt-10">No scans yet. Go verify a product!</Text>
        ) : (
          history.slice(0, 5).map((item, idx) => (
            <TouchableOpacity 
              key={idx} 
              className="flex-row items-center bg-navy-800 rounded-xl p-4 mb-3 border border-white/5"
              onPress={() => {
                const pId = item.product_id || (item.reason.includes('#') ? item.reason.split('#')[1].replace(')', '') : item.reason.split(' ').pop());
                navigation.navigate('ProductDetail', { productId: pId });
              }}
            >
              <View className="w-12 h-12 bg-gray-700 rounded-lg mr-4 items-center justify-center">
                <Star color="#FBBF24" size={20} />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold">{item.reason || 'Product Scan'}</Text>
                <Text className="text-gray-400 text-xs mt-1">Transaction: {item.tx_hash?.slice(0,10)}... • {new Date(item.timestamp).toLocaleDateString()}</Text>
              </View>
              <View className="bg-green-accent/20 px-2 py-1 rounded">
                <Text className="text-green-accent text-xs font-bold">+{item.amount}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </SafeAreaView>
  );
};
