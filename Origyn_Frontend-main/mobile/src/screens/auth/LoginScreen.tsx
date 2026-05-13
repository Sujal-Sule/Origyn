import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useStore } from '../../store/useStore';
import api from '../../services/api';

export const LoginScreen = ({ navigation }: any) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const { setUser, setToken } = useStore();

  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert('Error', 'Please enter phone and password');
      return;
    }
    try {
      const res = await api.post('/auth/login', { phone, password });
      setToken(res.data.access_token);
      setUser(res.data.user);
    } catch {
      Alert.alert('Error', 'Invalid phone number or password');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-navy-900">
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, justifyContent: 'center' }}>
        {/* Logo */}
        <View className="items-center mb-10">
          <View className="w-16 h-16 bg-green-accent rounded-2xl items-center justify-center mb-4">
            <Text className="text-navy-900 font-black text-3xl">O</Text>
          </View>
          <Text className="text-white text-3xl font-black">ORIGYN</Text>
          <Text className="text-gray-400 mt-2">Your products, verified.</Text>
        </View>

        {/* Phone + Password */}
        <Input
          label="Phone Number"
          placeholder="9876543210"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
        <Input
          label="Password"
          placeholder="••••••••"
          isPassword
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity 
          className="mb-6 self-end"
          onPress={() => navigation.navigate('ForgotPassword')}
        >
          <Text className="text-green-accent font-medium">Forgot Password?</Text>
        </TouchableOpacity>

        <Button title="Login" onPress={handleLogin} className="mt-2" />

        <View className="flex-row justify-center mt-10">
          <Text className="text-gray-400">Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('RoleSelection')}>
            <Text className="text-green-accent font-bold">Register</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

