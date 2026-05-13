import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Phone, Lock, ShieldCheck, MessageSquare, RefreshCw } from 'lucide-react-native';
import api from '../../services/api';

type Step = 'phone' | 'otp' | 'new_password';

export const ForgotPasswordScreen = ({ navigation }: any) => {
  const [step, setStep] = useState<Step>('phone');

  // Fields
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const otpRefs = useRef<(TextInput | null)[]>([]);

  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // ── Step 1: Send OTP ─────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (phone.trim().length < 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit phone number.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/send-otp', { phone: phone.trim() });
      setStep('otp');
      startResendTimer();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.detail || 'Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
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
    setLoading(true);
    try {
      await api.post('/auth/send-otp', { phone: phone.trim() });
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
      startResendTimer();
      Alert.alert('Sent', 'A new OTP has been sent to your phone.');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.detail || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
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

  const verifyOtpAndNext = () => {
    const code = otp.join('');
    if (code.length < 6) {
      Alert.alert('Incomplete OTP', 'Please enter the full 6-digit OTP.');
      return;
    }
    setStep('new_password');
  };

  // ── Step 3: Reset Password ─────────────────────────────────────────
  const handleResetPassword = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    const code = otp.join('');

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { 
        phone: phone.trim(), 
        otp: code,
        new_password: newPassword
      });
      
      Alert.alert('Success', 'Your password has been reset successfully.', [
        { text: 'Login', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message;
      if (msg?.toLowerCase().includes('otp') || msg?.toLowerCase().includes('invalid')) {
        Alert.alert('Invalid OTP', 'The OTP has expired or is incorrect. Please try again.');
        setStep('otp'); // Go back to OTP if it failed verification here
      } else {
        Alert.alert('Reset Failed', msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── RENDER HELPERS ─────────────────────────────────────────────────────────────
  const renderHeader = (title: string, subtitle: string) => (
    <View className="mb-10">
      <Text className="text-white text-3xl font-bold mb-2">{title}</Text>
      <Text className="text-gray-400">{subtitle}</Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-navy-900">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}>
          <TouchableOpacity
            onPress={() => step === 'phone' ? navigation.goBack() : setStep(step === 'otp' ? 'phone' : 'otp')}
            className="w-10 h-10 rounded-full bg-navy-800 items-center justify-center mb-8"
          >
            <ArrowLeft color="#fff" size={20} />
          </TouchableOpacity>

          {step === 'phone' && (
            <>
              {renderHeader('Forgot Password', 'Enter your registered phone number to receive a verification code.')}
              <View className="mb-8">
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

              <TouchableOpacity
                className="bg-green-accent py-4 rounded-xl items-center flex-row justify-center mt-auto mb-6"
                style={{ shadowColor: '#00FF88', shadowOpacity: 0.3, shadowRadius: 20, elevation: 8 }}
                onPress={handleSendOtp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#0A0F1E" size="small" />
                ) : (
                  <>
                    <MessageSquare color="#0A0F1E" size={20} style={{ marginRight: 8 }} />
                    <Text className="text-navy-900 font-bold text-lg">Send Verification Code</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}

          {step === 'otp' && (
            <>
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

              <View className="flex-row justify-center items-center mb-8">
                <Text className="text-gray-400 text-sm">Didn't receive it? </Text>
                <TouchableOpacity onPress={handleResend} disabled={resendTimer > 0 || loading}>
                  <View className="flex-row items-center gap-1">
                    <RefreshCw color={resendTimer > 0 ? '#4B5563' : '#00FF88'} size={14} />
                    <Text className={`font-bold text-sm ml-1 ${resendTimer > 0 ? 'text-gray-500' : 'text-green-accent'}`}>
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={verifyOtpAndNext}
                disabled={otp.join('').length < 6}
                className="py-4 rounded-xl items-center flex-row justify-center mt-auto mb-6"
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
                <ShieldCheck color={otp.join('').length === 6 ? '#0A0F1E' : '#4B5563'} size={20} style={{ marginRight: 8 }} />
                <Text style={{ color: otp.join('').length === 6 ? '#0A0F1E' : '#4B5563', fontWeight: 'bold', fontSize: 18 }}>
                  Verify Code
                </Text>
              </TouchableOpacity>
            </>
          )}

          {step === 'new_password' && (
            <>
              {renderHeader('New Password', 'Create a new strong password for your account.')}
              
              <View className="space-y-4 mb-8">
                <View>
                  <Text className="text-gray-400 text-sm mb-1 ml-1">New Password</Text>
                  <View className="flex-row items-center bg-navy-800 rounded-xl px-4 py-3 border border-white/10">
                    <Lock color="#6B7280" size={20} />
                    <TextInput
                      placeholder="••••••••"
                      placeholderTextColor="#4B5563"
                      className="flex-1 text-white ml-3"
                      secureTextEntry
                      value={newPassword}
                      onChangeText={setNewPassword}
                    />
                  </View>
                </View>

                <View className="mt-4">
                  <Text className="text-gray-400 text-sm mb-1 ml-1">Confirm Password</Text>
                  <View className="flex-row items-center bg-navy-800 rounded-xl px-4 py-3 border border-white/10">
                    <Lock color="#6B7280" size={20} />
                    <TextInput
                      placeholder="••••••••"
                      placeholderTextColor="#4B5563"
                      className="flex-1 text-white ml-3"
                      secureTextEntry
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                    />
                  </View>
                </View>
              </View>

              <TouchableOpacity
                className="bg-green-accent py-4 rounded-xl items-center flex-row justify-center mt-auto mb-6"
                style={{ shadowColor: '#00FF88', shadowOpacity: 0.3, shadowRadius: 20, elevation: 8 }}
                onPress={handleResetPassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#0A0F1E" size="small" />
                ) : (
                  <>
                    <ShieldCheck color="#0A0F1E" size={20} style={{ marginRight: 8 }} />
                    <Text className="text-navy-900 font-bold text-lg">Reset Password</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
