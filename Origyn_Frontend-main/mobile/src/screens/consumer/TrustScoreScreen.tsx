import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle, ShieldAlert, ArrowLeft, Star, MapPin, Snowflake, ShieldCheck } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';

export const TrustScoreScreen = ({ navigation, route }: any) => {
  const score = route?.params?.score || 94; // Default to 94 for demo
  const apiData = route?.params?.data; // Data from backend
  const scoreAnim = useSharedValue(0);
  const scaleAnim = useSharedValue(0.5);

  useEffect(() => {
    scoreAnim.value = withTiming(score, { duration: 2000 });
    scaleAnim.value = withSpring(1);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleAnim.value }],
    };
  });

  return (
    <SafeAreaView className="flex-1 bg-navy-900">
      <View className="flex-row items-center px-4 pt-4 pb-2">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-navy-800 rounded-full">
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold ml-4">Scan Result</Text>
      </View>

      <ScrollView className="flex-1 px-4">
        {/* Score Reveal */}
        <View className="items-center py-10">
          <Animated.View 
            className="w-64 h-64 rounded-full border-8 border-green-accent items-center justify-center bg-navy-800 shadow-[0_0_50px_rgba(0,255,136,0.3)]"
            style={animatedStyle}
          >
            <Text className="text-green-accent text-8xl font-black">{score}</Text>
            <Text className="text-white font-bold text-lg mt-2">TRUST SCORE</Text>
          </Animated.View>

          <View className="flex-row items-center mt-6 bg-green-accent/20 px-6 py-2 rounded-full">
            <ShieldCheck color="#00FF88" size={20} />
            <Text className="text-green-accent font-bold ml-2">Authentic Product</Text>
          </View>
        </View>

        {/* Product Info */}
        <View className="bg-navy-800 rounded-2xl p-5 mb-6 border border-white/10">
          <Text className="text-gray-400 text-sm mb-1">Product Details</Text>
          <Text className="text-white text-2xl font-bold mb-4">{apiData?.product?.name || 'Unknown Product'}</Text>
          
          <View className="flex-row flex-wrap">
            <View className="w-1/2 mb-4">
              <View className="flex-row items-center mb-1">
                <MapPin color="#6B7280" size={16} />
                <Text className="text-gray-400 text-xs ml-1">Category</Text>
              </View>
              <Text className="text-white font-medium">{apiData?.product?.category || 'General'}</Text>
            </View>
            <View className="w-1/2 mb-4">
              <View className="flex-row items-center mb-1">
                <Snowflake color="#6B7280" size={16} />
                <Text className="text-gray-400 text-xs ml-1">Current Stage</Text>
              </View>
              <Text className="text-green-accent font-medium">{apiData?.product?.current_stage || 'Unknown'}</Text>
            </View>
            <View className="w-1/2">
              <Text className="text-gray-400 text-xs mb-1">Batch ID</Text>
              <Text className="text-white font-medium text-xs">#{apiData?.product?.product_id || 'N/A'}</Text>
            </View>
            <View className="w-1/2">
              <Text className="text-gray-400 text-xs mb-1">Score Grade</Text>
              <Text className="text-white font-medium text-xs">{apiData?.trust_score?.grade || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* Rewards */}
        <View className="bg-consumer/10 rounded-2xl p-5 mb-8 border border-consumer/20 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-consumer rounded-full items-center justify-center mr-3 shadow-[0_0_15px_rgba(251,191,36,0.6)]">
              <Star color="#0A0F1E" size={20} />
            </View>
            <View>
              <Text className="text-consumer font-bold text-lg">+{apiData?.tokens_earned ?? 0} ORIGYN</Text>
              <Text className="text-gray-400 text-xs">Earned for verification</Text>
            </View>
          </View>
          <TouchableOpacity className="bg-consumer px-4 py-2 rounded-full">
            <Text className="text-navy-900 font-bold text-sm">Wallet</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
