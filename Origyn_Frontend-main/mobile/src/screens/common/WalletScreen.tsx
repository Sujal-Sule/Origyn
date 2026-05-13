import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownRight, Activity, X } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useStore } from '../../store/useStore';
import api from '../../services/api';

export const WalletScreen = () => {
  const { user } = useStore();
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendModalVisible, setSendModalVisible] = useState(false);
  const [sendAmount, setSendAmount] = useState('');
  const [recipient, setRecipient] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const bRes = await api.get('/tokens/balance');
      setBalance(bRes.data.balance || 0);
      
      const hRes = await api.get('/tokens/history');
      setHistory(hRes.data.history || hRes.data || []);
    } catch (err) {
      console.error("Error fetching wallet:", err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const handleSend = async () => {
    const amountNum = parseInt(sendAmount);
    if (!amountNum || amountNum <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    if (amountNum > balance) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    try {
      await api.post('/tokens/redeem', {
        amount: amountNum,
        reason: `Transferred to ${recipient || 'External Wallet'}`
      });
      setSendModalVisible(false);
      setSendAmount('');
      setRecipient('');
      Alert.alert('Success', 'Tokens sent successfully!');
      fetchData(); // Refresh
    } catch (err) {
      Alert.alert('Error', 'Transfer failed');
    }
  };

  const usdValue = (balance * 0.035).toFixed(2); // Mock conversion rate

  return (
    <SafeAreaView className="flex-1 bg-navy-900">
      <View className="px-4 pt-4 pb-2">
        <Text className="text-white text-2xl font-bold">Origyn Wallet</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        {/* Balance Card */}
        <View className="bg-gradient-to-br from-green-accent/20 to-navy-800 rounded-3xl p-6 mb-6 border border-green-accent/30 shadow-[0_0_30px_rgba(0,255,136,0.1)]">
          <View className="flex-row items-center mb-4">
            <WalletIcon color="#00FF88" size={24} />
            <Text className="text-gray-300 ml-2 font-medium">Total Balance</Text>
          </View>
          <Text className="text-white text-5xl font-black mb-2">{balance} <Text className="text-xl text-green-accent">ORG</Text></Text>
          <Text className="text-gray-400">≈ ${usdValue} USD</Text>

          <View className="flex-row justify-between mt-6">
            <TouchableOpacity 
              className="bg-green-accent py-3 px-6 rounded-full flex-row items-center justify-center flex-1 mr-2"
              onPress={() => setSendModalVisible(true)}
            >
              <ArrowUpRight color="#0A0F1E" size={20} />
              <Text className="text-navy-900 font-bold ml-2">Send</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="bg-navy-900 py-3 px-6 rounded-full flex-row items-center justify-center flex-1 ml-2 border border-white/10"
              onPress={() => Alert.alert('Your Wallet Address', user?.wallet_address || '0xUNKNOWN')}
            >
              <ArrowDownRight color="#fff" size={20} />
              <Text className="text-white font-bold ml-2">Receive</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text className="text-white text-lg font-bold mb-4">Recent Transactions</Text>
        
        {loading ? (
          <Text className="text-gray-500 text-center mt-6">Loading transactions...</Text>
        ) : history.length === 0 ? (
          <Text className="text-gray-500 text-center mt-6">No transactions found.</Text>
        ) : (
          [...history].reverse().map((tx, idx) => {
            const isSpend = tx.amount < 0;
            const color = isSpend ? '#EF4444' : '#00FF88';
            return (
              <View key={idx} className="flex-row items-center bg-navy-800 p-4 rounded-2xl mb-3 border border-white/5">
                <View className="w-10 h-10 rounded-full bg-navy-900 items-center justify-center mr-4">
                  <Activity color={color} size={20} />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-bold">{tx.reason}</Text>
                  <Text className="text-gray-400 text-xs">{new Date(tx.timestamp).toLocaleString()}</Text>
                </View>
                <Text style={{ color }} className="font-bold text-lg">
                  {isSpend ? tx.amount : `+${tx.amount}`} ORG
                </Text>
              </View>
            )
          })
        )}
      </ScrollView>

      {/* Send Modal */}
      <Modal visible={sendModalVisible} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-navy-800 rounded-t-3xl p-6 border-t border-white/10">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white text-xl font-bold">Send Tokens</Text>
              <TouchableOpacity onPress={() => setSendModalVisible(false)}>
                <X color="#fff" size={24} />
              </TouchableOpacity>
            </View>

            <Text className="text-gray-400 mb-2">Recipient Address / Phone</Text>
            <TextInput 
              className="bg-navy-900 text-white p-4 rounded-xl mb-4 border border-white/10"
              placeholder="0x..."
              placeholderTextColor="#6B7280"
              value={recipient}
              onChangeText={setRecipient}
            />

            <Text className="text-gray-400 mb-2">Amount (ORG)</Text>
            <TextInput 
              className="bg-navy-900 text-white p-4 rounded-xl mb-6 border border-white/10"
              placeholder="0"
              placeholderTextColor="#6B7280"
              keyboardType="numeric"
              value={sendAmount}
              onChangeText={setSendAmount}
            />

            <TouchableOpacity 
              className="bg-green-accent py-4 rounded-xl items-center"
              onPress={handleSend}
            >
              <Text className="text-navy-900 font-bold text-lg">Confirm Transfer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
