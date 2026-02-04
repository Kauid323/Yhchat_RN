import { useAuth } from '@/contexts/AuthContext';
import { userAPI } from '@/utils/apiClientMixed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import {
    ActivityIndicator,
    Button,
    SegmentedButtons,
    Surface,
    Text,
    TextInput,
    useTheme,
} from 'react-native-paper';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const { login } = useAuth();
  const theme = useTheme();
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
          <Text variant="headlineLarge" style={styles.title}>云湖聊天</Text>
          <Text variant="bodyLarge" style={styles.subtitle}>欢迎回来</Text>
        </View>

        <SegmentedButtons
          value={loginType}
          onValueChange={(value) => setLoginType(value as 'email' | 'phone')}
          style={styles.segmentedButtons}
          buttons={[
            {
              value: 'email',
              label: '邮箱登录',
            },
            {
              value: 'phone',
              label: '手机登录',
            },
          ]}
        />

        <View style={styles.formContainer}>
          {loginType === 'email' ? (
            <>
              <TextInput
                label="邮箱"
                mode="outlined"
                value={email}
                onChangeText={setEmail}
                placeholder="请输入邮箱地址"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                left={<TextInput.Icon icon="email" />}
              />
              <TextInput
                label="密码"
                mode="outlined"
                value={password}
                onChangeText={setPassword}
                placeholder="请输入密码"
                secureTextEntry
                autoCapitalize="none"
                style={styles.input}
                left={<TextInput.Icon icon="lock" />}
              />
              <Button
                mode="contained"
                onPress={handleEmailLogin}
                loading={loading}
                disabled={loading}
                style={styles.loginButton}
                contentStyle={styles.loginButtonContent}
              >
                登录
              </Button>
            </>
          ) : (
            <>
              <TextInput
                label="手机号"
                mode="outlined"
                value={phone}
                onChangeText={setPhone}
                placeholder="请输入手机号"
                keyboardType="phone-pad"
                maxLength={11}
                style={styles.input}
                left={<TextInput.Icon icon="phone" />}
              />
              
              <View style={styles.imageCaptchaContainer}>
                <TextInput
                  label="图片验证码"
                  mode="outlined"
                  value={imageCaptcha}
                  onChangeText={setImageCaptcha}
                  placeholder="请输入"
                  maxLength={4}
                  style={[styles.input, { flex: 1, marginRight: 8 }]}
                />
                <Surface style={styles.captchaImageContainer} elevation={1}>
                  {captchaLoading ? (
                    <ActivityIndicator size="small" />
                  ) : captchaImage ? (
                    <Button onPress={handleGetImageCaptcha} style={{ padding: 0 }}>
                      <Image
                        source={{ uri: captchaImage }}
                        style={styles.captchaImage}
                        resizeMode="contain"
                      />
                    </Button>
                  ) : (
                    <Button onPress={handleGetImageCaptcha}>获取</Button>
                  )}
                </Surface>
              </View>

              <View style={styles.captchaContainer}>
                <TextInput
                  label="短信验证码"
                  mode="outlined"
                  value={captcha}
                  onChangeText={setCaptcha}
                  placeholder="请输入"
                  keyboardType="number-pad"
                  maxLength={6}
                  style={[styles.input, { flex: 1, marginRight: 8 }]}
                />
                <Button
                  mode="outlined"
                  onPress={handleGetSMSCode}
                  disabled={smsLoading || !imageCaptcha}
                  loading={smsLoading}
                  style={styles.captchaButton}
                >
                  获取验证码
                </Button>
              </View>
              
              <Button
                mode="contained"
                onPress={handlePhoneLogin}
                loading={loading}
                disabled={loading}
                style={styles.loginButton}
                contentStyle={styles.loginButtonContent}
              >
                登录
              </Button>
            </>
          )}
        </View>

        <View style={styles.footer}>
          <Text variant="bodySmall" style={styles.footerText}>
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
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    opacity: 0.7,
  },
  segmentedButtons: {
    marginBottom: 32,
  },
  formContainer: {
    marginBottom: 32,
  },
  input: {
    marginBottom: 16,
  },
  imageCaptchaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  captchaImageContainer: {
    width: 120,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  captchaImage: {
    width: 100,
    height: 40,
  },
  captchaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  captchaButton: {
    height: 50,
    justifyContent: 'center',
  },
  loginButton: {
    borderRadius: 12,
    marginTop: 8,
  },
  loginButtonContent: {
    paddingVertical: 8,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    textAlign: 'center',
    opacity: 0.6,
  },
});
