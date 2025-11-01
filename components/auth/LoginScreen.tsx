import { useAuth } from '@/contexts/AuthContext';
import { userAPI } from '@/utils/apiClientMixed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const { login } = useAuth();
  const [loginType, setLoginType] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [imageCaptcha, setImageCaptcha] = useState('');
  const [captchaImage, setCaptchaImage] = useState('');
  const [captchaId, setCaptchaId] = useState('');
  const [loading, setLoading] = useState(false);
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [smsLoading, setSmsLoading] = useState(false);

  const getDeviceId = () => {
    return `${Platform.OS}-${Date.now()}`;
  };

  // 切换到手机登录时自动获取图片验证码
  useEffect(() => {
    if (loginType === 'phone' && !captchaImage) {
      handleGetImageCaptcha();
    }
  }, [loginType]);

  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert('错误', '请填写邮箱和密码');
      return;
    }

    setLoading(true);
    try {
      const deviceId = getDeviceId();
      const response = await userAPI.emailLogin(email, password, deviceId, Platform.OS);
      
      if (response.code === 1 && response.data?.token) {
        await login(response.data.token);
        await AsyncStorage.setItem('userEmail', email);
        Alert.alert('成功', '登录成功！', [
          { text: '确定', onPress: onLoginSuccess }
        ]);
      } else {
        Alert.alert('登录失败', response.msg || '登录失败，请检查邮箱和密码');
      }
    } catch (error) {
      console.error('登录错误:', error);
      Alert.alert('登录失败', '网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 获取图片验证码
  const handleGetImageCaptcha = async () => {
    setCaptchaLoading(true);
    try {
      const deviceId = getDeviceId();
      const response = await userAPI.getCaptcha(deviceId);
      if (response.code === 1 && response.data) {
        setCaptchaImage(response.data.b64s);
        setCaptchaId(response.data.id);
      } else {
        Alert.alert('获取失败', response.msg || '获取图片验证码失败');
      }
    } catch (error) {
      console.error('获取图片验证码错误:', error);
      Alert.alert('获取失败', '网络错误，请稍后重试');
    } finally {
      setCaptchaLoading(false);
    }
  };

  // 获取短信验证码
  const handleGetSMSCode = async () => {
    if (!phone) {
      Alert.alert('错误', '请输入手机号');
      return;
    }
    if (!imageCaptcha) {
      Alert.alert('错误', '请输入图片验证码');
      return;
    }
    if (!captchaId) {
      Alert.alert('错误', '请先获取图片验证码');
      return;
    }

    setSmsLoading(true);
    try {
      const response = await userAPI.getVerificationCode(phone, imageCaptcha, captchaId);
      if (response.code === 1) {
        Alert.alert('发送成功', '短信验证码已发送，请查收');
      } else {
        Alert.alert('发送失败', response.msg || '短信验证码发送失败');
      }
    } catch (error) {
      console.error('获取短信验证码错误:', error);
      Alert.alert('发送失败', '网络错误，请稍后重试');
    } finally {
      setSmsLoading(false);
    }
  };

  const handlePhoneLogin = async () => {
    if (!phone || !captcha) {
      Alert.alert('错误', '请填写手机号和验证码');
      return;
    }

    setLoading(true);
    try {
      const deviceId = getDeviceId();
      const response = await userAPI.verificationLogin(phone, captcha, deviceId, Platform.OS);
      
      if (response.code === 1 && response.data?.token) {
        await login(response.data.token);
        await AsyncStorage.setItem('userPhone', phone);
        Alert.alert('成功', '登录成功！', [
          { text: '确定', onPress: onLoginSuccess }
        ]);
      } else {
        Alert.alert('登录失败', response.msg || '登录失败，请检查手机号和验证码');
      }
    } catch (error) {
      console.error('登录错误:', error);
      Alert.alert('登录失败', '网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>云湖聊天</Text>
          <Text style={styles.subtitle}>欢迎回来</Text>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, loginType === 'email' && styles.activeTab]}
            onPress={() => setLoginType('email')}
          >
            <Text style={[styles.tabText, loginType === 'email' && styles.activeTabText]}>
              邮箱登录
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, loginType === 'phone' && styles.activeTab]}
            onPress={() => setLoginType('phone')}
          >
            <Text style={[styles.tabText, loginType === 'phone' && styles.activeTabText]}>
              手机登录
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          {loginType === 'email' ? (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>邮箱</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="请输入邮箱地址"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>密码</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="请输入密码"
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              <TouchableOpacity
                style={[styles.loginButton, loading && styles.disabledButton]}
                onPress={handleEmailLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.loginButtonText}>登录</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>手机号</Text>
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="请输入手机号"
                  keyboardType="phone-pad"
                  maxLength={11}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>图片验证码</Text>
                <View style={styles.imageCaptchaContainer}>
                  <TextInput
                    style={[styles.input, styles.imageCaptchaInput]}
                    value={imageCaptcha}
                    onChangeText={setImageCaptcha}
                    placeholder="请输入图片验证码"
                    maxLength={4}
                  />
                  <TouchableOpacity
                    style={styles.captchaImageContainer}
                    onPress={handleGetImageCaptcha}
                    disabled={captchaLoading}
                  >
                    {captchaLoading ? (
                      <ActivityIndicator size="small" color="#007AFF" />
                    ) : captchaImage ? (
                      <Image
                        source={{ uri: captchaImage }}
                        style={styles.captchaImage}
                        resizeMode="contain"
                      />
                    ) : (
                      <Text style={styles.captchaPlaceholder}>点击获取</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>短信验证码</Text>
                <View style={styles.captchaContainer}>
                  <TextInput
                    style={[styles.input, styles.captchaInput]}
                    value={captcha}
                    onChangeText={setCaptcha}
                    placeholder="请输入短信验证码"
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                  <TouchableOpacity
                    style={[styles.captchaButton, (smsLoading || !imageCaptcha) && styles.disabledButton]}
                    onPress={handleGetSMSCode}
                    disabled={smsLoading || !imageCaptcha}
                  >
                    {smsLoading ? (
                      <ActivityIndicator size="small" color="#007AFF" />
                    ) : (
                      <Text style={styles.captchaButtonText}>获取验证码</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
              
              <TouchableOpacity
                style={[styles.loginButton, loading && styles.disabledButton]}
                onPress={handlePhoneLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.loginButtonText}>登录</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            登录即表示同意云湖的服务条款和隐私政策
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#e9ecef',
    borderRadius: 12,
    padding: 4,
    marginBottom: 32,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  formContainer: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  imageCaptchaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageCaptchaInput: {
    flex: 1,
    marginRight: 12,
  },
  captchaImageContainer: {
    width: 120,
    height: 40,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captchaImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  captchaPlaceholder: {
    color: '#999',
    fontSize: 12,
  },
  captchaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  captchaInput: {
    flex: 1,
    marginRight: 12,
  },
  captchaButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  captchaButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
});
