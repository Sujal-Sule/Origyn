import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, Maximize, List, Wallet, User as UserIcon, Package } from 'lucide-react-native';
import { useStore } from '../store/useStore';

// Screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RoleSelectionScreen } from '../screens/auth/RoleSelectionScreen';
import { ConsumerHomeScreen } from '../screens/consumer/ConsumerHomeScreen';
import { FarmerHomeScreen } from '../screens/farmer/FarmerHomeScreen';
import { QRScanner } from '../components/scanner/QRScanner';
import { TrustScoreScreen } from '../screens/consumer/TrustScoreScreen';
import { UpdateScreen } from '../screens/distributor/UpdateScreen';
import { ProductRegistrationScreen } from '../screens/farmer/ProductRegistrationScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { ProductsScreen } from '../screens/common/ProductsScreen';
import { WalletScreen } from '../screens/common/WalletScreen';
import { ProfileScreen } from '../screens/common/ProfileScreen';
import { DistributorHomeScreen } from '../screens/distributor/DistributorHomeScreen';
import { RetailerHomeScreen } from '../screens/retailer/RetailerHomeScreen';
import { AdminHomeScreen } from '../screens/admin/AdminHomeScreen';
import { SettingDetailScreen } from '../screens/common/SettingDetailScreen';
import { ProductDetailScreen } from '../screens/common/ProductDetailScreen';
import { View, Text } from 'react-native';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const PlaceholderScreen = ({ route }: any) => (
  <View className="flex-1 bg-navy-900 items-center justify-center">
    <Text className="text-white text-lg">{route.name} Screen</Text>
  </View>
);

import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0A0F1E' } }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </Stack.Navigator>
);


function HomeScreen({ navigation }: any) {
  const { role } = useStore();
  switch(role) {
    case 'consumer': return <ConsumerHomeScreen navigation={navigation} />;
    case 'farmer': return <FarmerHomeScreen navigation={navigation} />;
    case 'distributor': return <DistributorHomeScreen navigation={navigation} />;
    case 'retailer': return <RetailerHomeScreen navigation={navigation} />;
    case 'admin': return <AdminHomeScreen navigation={navigation} />;
    default: return <PlaceholderScreen route={{ name: `Home (${role})` }} />;
  }
}

const MainTabs = () => {
  const { role } = useStore();

  const getRoleColor = () => {
    switch(role) {
      case 'farmer': return '#4ADE80';
      case 'distributor': return '#38BDF8';
      case 'retailer': return '#A78BFA';
      case 'consumer': return '#FBBF24';
      case 'admin': return '#EF4444';
      default: return '#00FF88';
    }
  };

  const activeColor = getRoleColor();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0A0F1E',
          borderTopColor: '#1F2937',
          paddingTop: 10,
          height: 60,
        },
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: '#6B7280',
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ tabBarIcon: ({ color }) => <Home color={color} size={24} /> }}
      />
      <Tab.Screen 
        name="Products" 
        component={ProductsScreen}
        options={{ tabBarIcon: ({ color }) => <List color={color} size={24} /> }}
      />
      {role === 'farmer' ? (
        <Tab.Screen 
          name="NewBatchTab" 
          component={PlaceholderScreen}
          options={{ 
            tabBarIcon: ({ color, focused }) => (
              <View className={`w-14 h-14 rounded-full items-center justify-center -mt-8 ${focused ? 'bg-navy-800 border-2 border-farmer' : 'bg-farmer'}`}>
                <Package color={focused ? '#4ADE80' : '#0A0F1E'} size={28} />
              </View>
            ) 
          }}
          listeners={({ navigation }) => ({
            tabPress: e => {
              e.preventDefault();
              navigation.navigate('ProductRegistration');
            },
          })}
        />
      ) : (
        <Tab.Screen 
          name="Scan" 
          component={QRScanner}
          options={{ 
            tabBarIcon: ({ color, focused }) => (
              <View className={`w-14 h-14 rounded-full items-center justify-center -mt-8 ${focused ? 'bg-navy-800 border-2 border-green-accent' : 'bg-green-accent'}`}>
                <Maximize color={focused ? '#00FF88' : '#0A0F1E'} size={28} />
              </View>
            ) 
          }}
        />
      )}
      <Tab.Screen 
        name="Wallet" 
        component={WalletScreen}
        options={{ tabBarIcon: ({ color }) => <Wallet color={color} size={24} /> }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ tabBarIcon: ({ color }) => <UserIcon color={color} size={24} /> }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const { user } = useStore();
  
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0A0F1E' } }}>
      {!user ? (
        <Stack.Screen name="Auth" component={AuthStack} />
      ) : (
        <>
          <Stack.Screen name="AppTabs" component={MainTabs} />
          <Stack.Screen name="TrustScore" component={TrustScoreScreen} />
          <Stack.Screen name="UpdateStage" component={UpdateScreen} />
          <Stack.Screen name="ProductRegistration" component={ProductRegistrationScreen} />
          <Stack.Screen name="SettingDetail" component={SettingDetailScreen} />
          <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};
