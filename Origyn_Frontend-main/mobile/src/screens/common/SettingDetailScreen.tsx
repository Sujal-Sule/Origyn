import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';

export const SettingDetailScreen = ({ route, navigation }: any) => {
  const { title } = route?.params || { title: 'Settings' };

  return (
    <SafeAreaView className="flex-1 bg-navy-900">
      <View className="px-4 pt-4 pb-2 flex-row items-center border-b border-white/10 pb-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 w-10 h-10 bg-navy-800 rounded-full items-center justify-center">
          <ArrowLeft color="#fff" size={20} />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">{title}</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-8">
        <View className="bg-navy-800 rounded-2xl p-6 border border-white/5 items-center">
          <Text className="text-white text-lg font-bold mb-2">{title} Configuration</Text>
          <Text className="text-gray-400 text-center">
            This section allows you to manage your {title.toLowerCase()}. Settings updates will be synced across the Origyn network securely.
          </Text>
        </View>
        
        {title === 'Personal Details' && (
          <View className="mt-6 space-y-4">
            <View className="bg-navy-800 p-4 rounded-xl border border-white/5">
              <Text className="text-gray-400 text-xs mb-1">Full Name</Text>
              <Text className="text-white font-medium">Demo User</Text>
            </View>
            <View className="bg-navy-800 p-4 rounded-xl border border-white/5">
              <Text className="text-gray-400 text-xs mb-1">Email</Text>
              <Text className="text-white font-medium">user@origyn.network</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
