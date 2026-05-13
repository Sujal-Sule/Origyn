import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShieldAlert, Users, Activity, Hexagon, Settings, Package, BarChart2 } from 'lucide-react-native';
import { useStore } from '../../store/useStore';

export const AdminHomeScreen = ({ navigation }: any) => {
  const { user } = useStore();

  return (
    <SafeAreaView className="flex-1 bg-navy-900">
      <View className="px-4 pt-4 pb-2 flex-row justify-between items-center">
        <View>
          <Text className="text-gray-400">Origyn Network</Text>
          <Text className="text-white text-2xl font-bold">{user?.name || 'Admin'} 🛡️</Text>
        </View>
        <TouchableOpacity 
          className="w-12 h-12 bg-navy-800 rounded-full items-center justify-center"
          onPress={() => navigation.navigate('Profile')}
        >
          <Settings color="#fff" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        {/* Stats */}
        <View className="flex-row justify-between mb-4">
          <View className="bg-navy-800 rounded-2xl p-4 flex-1 mr-2 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
            <Users color="#EF4444" size={24} />
            <Text className="text-white text-2xl font-bold mt-2">1,204</Text>
            <Text className="text-gray-400 text-xs">Total Users</Text>
          </View>
          <View className="bg-navy-800 rounded-2xl p-4 flex-1 ml-2 border border-white/5">
            <Activity color="#fff" size={24} />
            <Text className="text-white text-2xl font-bold mt-2">8.4k</Text>
            <Text className="text-gray-400 text-xs">Daily Scans</Text>
          </View>
        </View>

        <View className="bg-navy-800 rounded-2xl p-4 mb-6 border border-white/5 flex-row items-center justify-between">
          <View>
            <Text className="text-gray-400 text-sm">Network Health</Text>
            <Text className="text-white text-lg font-bold">99.9% Uptime</Text>
          </View>
          <View className="w-10 h-10 bg-green-500/20 rounded-full items-center justify-center border border-green-500/30">
            <Hexagon color="#10B981" size={20} />
          </View>
        </View>

        {/* Quick Actions */}
        <View className="flex-row justify-between mb-6">
          <TouchableOpacity 
            className="bg-red-500/20 py-3 rounded-xl items-center flex-1 mr-2 border border-red-500/30"
            onPress={() => navigation.navigate('Products')}
          >
            <Package color="#EF4444" size={20} />
            <Text className="text-white font-bold text-sm mt-1">Products</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className="bg-blue-500/20 py-3 rounded-xl items-center flex-1 mx-2 border border-blue-500/30"
            onPress={() => navigation.navigate('Scan')}
          >
            <BarChart2 color="#38BDF8" size={20} />
            <Text className="text-white font-bold text-sm mt-1">Scan</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className="bg-purple-500/20 py-3 rounded-xl items-center flex-1 ml-2 border border-purple-500/30"
            onPress={() => navigation.navigate('Wallet')}
          >
            <Hexagon color="#A78BFA" size={20} />
            <Text className="text-white font-bold text-sm mt-1">Treasury</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-white text-lg font-bold mb-4">System Alerts</Text>
        {[
          { title: 'New node sync completed', type: 'info', time: '10m ago', desc: 'Aptos Testnet block #14,291,042' },
          { title: 'High anomaly detected in Batch #441', type: 'warning', time: '1h ago', desc: 'Temperature spike to 12°C detected' },
          { title: 'New farmer registration', type: 'info', time: '3h ago', desc: 'User Vikram Singh joined from Uttarakhand' },
        ].map((alert, index) => (
          <View key={index} className="bg-navy-800 rounded-2xl p-4 mb-4 border border-white/5">
            <View className="flex-row items-center mb-2">
              <View className={`w-10 h-10 rounded-xl items-center justify-center mr-4 ${alert.type === 'warning' ? 'bg-red-500/20 border border-red-500/30' : 'bg-blue-500/20 border border-blue-500/30'}`}>
                <ShieldAlert color={alert.type === 'warning' ? '#EF4444' : '#38BDF8'} size={20} />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold">{alert.title}</Text>
                <Text className="text-gray-400 text-xs">{alert.time}</Text>
              </View>
            </View>
            <Text className="text-gray-400 text-sm ml-14">{alert.desc}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};
