import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Phone, Lock, User, ShieldCheck, MessageSquare, RefreshCw } from 'lucide-react-native';
import { useStore } from '../../store/useStore';
import api from '../../services/api';

type Step = 'form' | 'otp';

export const RegisterScreen = ({ navigation, route }: any) => {
  const role = route?.params?.role || 'consumer';
  const [step, setStep] = useState<Step>('form');

  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // OTP fields
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(TextInput | null)[]>([]);

  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const { setUser, setToken } = useStore();

  // ── Step 1: Send OTP ─────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (!name.trim() || !phone.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all fields before continuing.');
      return;
    }
    if (phone.trim().length < 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit phone number.');
      return;
    }

    setSending(true);
    try {
      await api.post('/auth/send-otp', { phone: phone.trim() });
      setStep('otp');
      startResendTimer();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.detail || 'Failed to send OTP. Try again.');
    } finally {
      setSending(false);
    }
  };

  // ── Resend timer (60s cooldown) ───────────────────────────────────────────
  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) { clearInterval(interval); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setSending(true);
    try {
      await api.post('/auth/send-otp', { phone: phone.trim() });
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
      startResendTimer();
      Alert.alert('Sent', 'A new OTP has been sent to your phone.');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.detail || 'Failed to resend OTP.');
    } finally {
      setSending(false);
    }
  };

  // ── OTP input handler ─────────────────────────────────────────────────────
  const handleOtpChange = (val: string, idx: number) => {
    const digit = val.replace(/[^0-9]/g, '').slice(-1);
    const next = [...otp];
    next[idx] = digit;
    setOtp(next);
    if (digit && idx < 5) otpRefs.current[idx + 1]?.focus();
    if (!digit && idx > 0) otpRefs.current[idx - 1]?.focus();
  };

  const handleOtpKeyPress = (key: string, idx: number) => {
    if (key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  // ── Step 2: Verify OTP & Register ─────────────────────────────────────────
  const handleVerifyAndRegister = async () => {
    const code = otp.join('');
    if (code.length < 6) {
      Alert.alert('Incomplete OTP', 'Please enter the full 6-digit OTP.');
      return;
    }

    setVerifying(true);
    try {
      // Verify OTP
      await api.post('/auth/verify-otp', { phone: phone.trim(), otp: code });

      // Register
      await api.post('/auth/register', { name, phone: phone.trim(), password, role });

      // Auto-login
      const res = await api.post('/auth/login', { phone: phone.trim(), password });
      setToken(res.data.access_token);
      setUser(res.data.user);
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message;
      if (msg?.toLowerCase().includes('otp') || msg?.toLowerCase().includes('invalid')) {
        Alert.alert('Invalid OTP', 'The OTP you entered is incorrect or has expired. Please try again.');
      } else {
        Alert.alert('Registration Failed', msg);
      }
    } finally {
      setVerifying(false);
    }
  };

  // ── FORM STEP ─────────────────────────────────────────────────────────────
  if (step === 'form') {
    return (
      <SafeAreaView className="flex-1 bg-navy-900">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
          <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="w-10 h-10 rounded-full bg-navy-800 items-center justify-center mb-8"
            >
              <ArrowLeft color="#fff" size={20} />
            </TouchableOpacity>

            <View className="mb-10">
              <Text className="text-white text-3xl font-bold mb-2">Create Account</Text>
              <Text className="text-gray-400">Join the Origyn network for traceability</Text>
            </View>

            <View className="space-y-4 mb-8">
              {/* Name */}
              <View>
                <Text className="text-gray-400 text-sm mb-1 ml-1">Full Name</Text>
                <View className="flex-row items-center bg-navy-800 rounded-xl px-4 py-3 border border-white/10">
                  <User color="#6B7280" size={20} />
                  <TextInput
                    placeholder="John Doe"
                    placeholderTextColor="#4B5563"
                    className="flex-1 text-white ml-3"
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              </View>

              {/* Phone */}
              <View>
                <Text className="text-gray-400 text-sm mb-1 ml-1">Phone Number</Text>
                <View className="flex-row items-center bg-navy-800 rounded-xl px-4 py-3 border border-white/10">
                  <Phone color="#6B7280" size={20} />
                  <TextInput
                    placeholder="9876543210"
                    placeholderTextColor="#4B5563"
                    className="flex-1 text-white ml-3"
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                    value={phone}
                    onChangeText={setPhone}
                    maxLength={10}
                  />
                </View>
              </View>

              {/* Password */}
              <View>
                <Text className="text-gray-400 text-sm mb-1 ml-1">Password</Text>
                <View className="flex-row items-center bg-navy-800 rounded-xl px-4 py-3 border border-white/10">
                  <Lock color="#6B7280" size={20} />
                  <TextInput
                    placeholder="••••••••"
                    placeholderTextColor="#4B5563"
                    className="flex-1 text-white ml-3"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                  />
                </View>
              </View>
            </View>

            <TouchableOpacity
              className="bg-green-accent py-4 rounded-xl items-center flex-row justify-center mb-6"
              style={{ shadowColor: '#00FF88', shadowOpacity: 0.3, shadowRadius: 20, elevation: 8 }}
              onPress={handleSendOtp}
              disabled={sending}
            >
              {sending ? (
                <ActivityIndicator color="#0A0F1E" size="small" />
              ) : (
                <>
                  <MessageSquare color="#0A0F1E" size={20} style={{ marginRight: 8 }} />
                  <Text className="text-navy-900 font-bold text-lg">Send Verification Code</Text>
                </>
              )}
            </TouchableOpacity>

            <View className="flex-row justify-center mt-auto">
              <Text className="text-gray-400">Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text className="text-green-accent font-bold">Sign In</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ── OTP STEP ─────────────────────────────────────────────────────────────
  return (
    <SafeAreaView className="flex-1 bg-navy-900">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}>
          <TouchableOpacity
            onPress={() => setStep('form')}
            className="w-10 h-10 rounded-full bg-navy-800 items-center justify-center mb-8"
          >
            <ArrowLeft color="#fff" size={20} />
          </TouchableOpacity>

          {/* Header */}
          <View className="mb-8">
            <View className="w-16 h-16 rounded-2xl bg-green-accent/10 border border-green-accent/20 items-center justify-center mb-5">
              <MessageSquare color="#00FF88" size={28} />
            </View>
            <Text className="text-white text-3xl font-bold mb-2">Verify Number</Text>
            <Text className="text-gray-400">
              We sent a 6-digit code to{'\n'}
              <Text className="text-white font-semibold">+91 {phone}</Text>
            </Text>
          </View>

          {/* OTP Boxes */}
          <View className="flex-row justify-between mb-8">
            {otp.map((digit, idx) => (
              <TextInput
                key={idx}
                ref={(r) => { otpRefs.current[idx] = r; }}
                value={digit}
                onChangeText={(v) => handleOtpChange(v, idx)}
                onKeyPress={({ nativeEvent }) => handleOtpKeyPress(nativeEvent.key, idx)}
                keyboardType="number-pad"
                maxLength={1}
                className="text-center text-white text-2xl font-bold"
                style={{
                  width: 48,
                  height: 60,
                  borderRadius: 12,
                  backgroundColor: '#1a2035',
                  borderWidth: digit ? 2 : 1,
                  borderColor: digit ? '#00FF88' : 'rgba(255,255,255,0.1)',
                  fontSize: 24,
                }}
                autoFocus={idx === 0}
              />
            ))}
          </View>

          {/* Resend */}
          <View className="flex-row justify-center items-center mb-8">
            <Text className="text-gray-400 text-sm">Didn't receive it? </Text>
            <TouchableOpacity onPress={handleResend} disabled={resendTimer > 0 || sending}>
              <View className="flex-row items-center gap-1">
                <RefreshCw color={resendTimer > 0 ? '#4B5563' : '#00FF88'} size={14} />
                <Text className={`font-bold text-sm ml-1 ${resendTimer > 0 ? 'text-gray-500' : 'text-green-accent'}`}>
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            onPress={handleVerifyAndRegister}
            disabled={verifying || otp.join('').length < 6}
            className="py-4 rounded-xl items-center flex-row justify-center"
            style={{
              backgroundColor: otp.join('').length === 6 ? '#00FF88' : '#1a2035',
              borderWidth: 1,
              borderColor: otp.join('').length === 6 ? '#00FF88' : 'rgba(255,255,255,0.1)',
              shadowColor: '#00FF88',
              shadowOpacity: otp.join('').length === 6 ? 0.35 : 0,
              shadowRadius: 20,
              elevation: otp.join('').length === 6 ? 8 : 0,
            }}
          >
            {verifying ? (
              <ActivityIndicator color="#0A0F1E" size="small" />
            ) : (
              <>
                <ShieldCheck color={otp.join('').length === 6 ? '#0A0F1E' : '#4B5563'} size={20} style={{ marginRight: 8 }} />
                <Text style={{ color: otp.join('').length === 6 ? '#0A0F1E' : '#4B5563', fontWeight: 'bold', fontSize: 18 }}>
                  Verify & Create Account
                </Text>
              </>
            )}
          </TouchableOpacity>

          <Text className="text-center text-gray-600 text-xs mt-6">
            By registering, you verify that your phone number is correct.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
