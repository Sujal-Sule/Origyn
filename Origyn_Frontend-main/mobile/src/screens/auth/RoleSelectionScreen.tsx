import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useStore } from '../../store/useStore';
import { Button } from '../../components/ui/Button';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Leaf, Truck, Store, ShoppingBag, ShieldCheck, FileText } from 'lucide-react-native';

const roles = [
  { id: 'farmer', title: 'Farmer', icon: Leaf, desc: 'Register produce', color: 'bg-farmer text-navy-900 border-farmer' },
  { id: 'distributor', title: 'Distributor', icon: Truck, desc: 'Update transit stage', color: 'bg-distributor text-navy-900 border-distributor' },
  { id: 'retailer', title: 'Retailer', icon: Store, desc: 'Receive inventory', color: 'bg-retailer text-white border-retailer' },
  { id: 'consumer', title: 'Consumer', icon: ShoppingBag, desc: 'Scan & earn tokens', color: 'bg-consumer text-navy-900 border-consumer' },
  { id: 'admin', title: 'Admin', icon: ShieldCheck, desc: 'System management', color: 'bg-red-500 text-white border-red-500' },
  { id: 'regulator', title: 'Regulator', icon: FileText, desc: 'Audit & compliance', color: 'bg-gray-400 text-navy-900 border-gray-400' },
];

export const RoleSelectionScreen = ({ navigation }: any) => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleContinue = () => {
    if (selectedRole) {
      navigation.navigate('Register', { role: selectedRole });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-navy-900 px-4 pt-6">
      <Text className="text-white text-3xl font-black mb-2">I am a...</Text>
      <Text className="text-gray-400 mb-8">Select your role to continue</Text>

      <ScrollView contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingBottom: 100 }}>
        {roles.map((role) => {
          const isSelected = selectedRole === role.id;
          const Icon = role.icon;
          return (
            <TouchableOpacity
              key={role.id}
              onPress={() => setSelectedRole(role.id)}
              className={`w-[48%] bg-navy-800 rounded-2xl p-4 mb-4 border-2 transition-all ${
                isSelected ? role.color.split(' ')[2] : 'border-transparent'
              }`}
              style={{
                shadowColor: isSelected ? '#00FF88' : 'transparent',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: isSelected ? 0.5 : 0,
                shadowRadius: 10,
                transform: [{ scale: isSelected ? 1.05 : 1 }],
              }}
            >
              <View className={`w-12 h-12 rounded-full items-center justify-center mb-3 ${isSelected ? role.color.split(' ')[0] : 'bg-gray-700'}`}>
                <Icon color={isSelected ? (role.id === 'retailer' || role.id === 'admin' ? '#fff' : '#0A0F1E') : '#fff'} size={24} />
              </View>
              <Text className={`text-lg font-bold mb-1 ${isSelected ? 'text-white' : 'text-gray-300'}`}>{role.title}</Text>
              <Text className="text-gray-500 text-xs">{role.desc}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View className="absolute bottom-10 left-4 right-4">
        <Button 
          title="Continue" 
          onPress={handleContinue} 
          disabled={!selectedRole}
          variant={selectedRole ? 'primary' : 'ghost'}
          color="green"
        />
      </View>
    </SafeAreaView>
  );
};
