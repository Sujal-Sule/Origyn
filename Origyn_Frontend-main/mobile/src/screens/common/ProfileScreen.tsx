import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Settings, Shield, LogOut, ChevronRight, HelpCircle } from 'lucide-react-native';
import { useStore } from '../../store/useStore';

export const ProfileScreen = ({ navigation }: any) => {
  const { user, role, logout } = useStore();

  const handleNavigation = (title: string) => {
    navigation.navigate('SettingDetail', { title });
  };

  return (
    <SafeAreaView className="flex-1 bg-navy-900">
      <View className="px-4 pt-4 pb-2">
        <Text className="text-white text-2xl font-bold">Profile</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        <View className="items-center mb-8">
          <View className="w-24 h-24 rounded-full bg-navy-800 items-center justify-center mb-4 border-2 border-green-accent">
            <User color="#00FF88" size={40} />
          </View>
          <Text className="text-white text-2xl font-bold">{user?.name || 'User Name'}</Text>
          <View className="bg-green-accent/20 px-3 py-1 rounded-full mt-2">
            <Text className="text-green-accent font-bold capitalize">{role || 'Consumer'}</Text>
          </View>
        </View>

        <View className="space-y-2 mb-6">
          <Text className="text-gray-400 text-sm ml-2 mb-2">ACCOUNT</Text>
          
          <TouchableOpacity 
            className="flex-row items-center bg-navy-800 p-4 rounded-2xl mb-2 border border-white/5"
            onPress={() => handleNavigation('Personal Details')}
          >
            <View className="w-10 h-10 rounded-full bg-navy-900 items-center justify-center mr-4">
              <User color="#fff" size={20} />
            </View>
            <Text className="text-white font-medium flex-1">Personal Details</Text>
            <ChevronRight color="#6B7280" size={20} />
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-row items-center bg-navy-800 p-4 rounded-2xl mb-2 border border-white/5"
            onPress={() => handleNavigation('Privacy & Security')}
          >
            <View className="w-10 h-10 rounded-full bg-navy-900 items-center justify-center mr-4">
              <Shield color="#fff" size={20} />
            </View>
            <Text className="text-white font-medium flex-1">Privacy & Security</Text>
            <ChevronRight color="#6B7280" size={20} />
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-row items-center bg-navy-800 p-4 rounded-2xl mb-2 border border-white/5"
            onPress={() => handleNavigation('App Settings')}
          >
            <View className="w-10 h-10 rounded-full bg-navy-900 items-center justify-center mr-4">
              <Settings color="#fff" size={20} />
            </View>
            <Text className="text-white font-medium flex-1">App Settings</Text>
            <ChevronRight color="#6B7280" size={20} />
          </TouchableOpacity>
        </View>

        <View className="space-y-2 mb-8">
          <Text className="text-gray-400 text-sm ml-2 mb-2">SUPPORT</Text>
          <TouchableOpacity 
            className="flex-row items-center bg-navy-800 p-4 rounded-2xl mb-2 border border-white/5"
            onPress={() => handleNavigation('Help & Support')}
          >
            <View className="w-10 h-10 rounded-full bg-navy-900 items-center justify-center mr-4">
              <HelpCircle color="#fff" size={20} />
            </View>
            <Text className="text-white font-medium flex-1">Help & Support</Text>
            <ChevronRight color="#6B7280" size={20} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          className="flex-row items-center justify-center bg-red-500/10 p-4 rounded-2xl border border-red-500/20 mb-8"
          onPress={logout}
        >
          <LogOut color="#EF4444" size={20} className="mr-2" />
          <Text className="text-red-500 font-bold">Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};
