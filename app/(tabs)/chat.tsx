import AvatarCustom from '@/components/ui/Avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import {
    Button,
    Card,
    Divider,
    List,
    Surface,
    Text,
    useTheme
} from 'react-native-paper';

export default function ProfileScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user, logout } = useAuth();

  // 调试用户头像URL
  if (user?.avatar_url) {
    console.log('用户头像URL:', user.avatar_url);
  }

  const handleLogout = () => {
    Alert.alert(
      '确认登出',
      '您确定要登出吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      title: '个人信息',
      icon: '👤',
      onPress: () => Alert.alert('功能开发中', '个人信息编辑功能即将推出'),
    },
    {
      title: '消息设置',
      icon: '🔔',
      onPress: () => Alert.alert('功能开发中', '消息设置功能即将推出'),
    },
    {
      title: '隐私设置',
      icon: '🔒',
      onPress: () => Alert.alert('功能开发中', '隐私设置功能即将推出'),
    },
    {
      title: '帮助与反馈',
      icon: '❓',
      onPress: () => Alert.alert('功能开发中', '帮助与反馈功能即将推出'),
    },
    {
      title: '关于我们',
      icon: 'ℹ️',
      onPress: () => Alert.alert('关于云湖聊天', '基于云湖平台API开发的React Native聊天应用'),
    },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* 用户信息卡片 */}
      <Card style={styles.userCard} mode="elevated">
        <Card.Content style={styles.userCardContent}>
          <View style={styles.avatarContainer}>
            <AvatarCustom
              uri={user?.avatar_url}
              size={80}
              fallbackIcon="👤"
            />
          </View>
          <View style={styles.userInfo}>
            <Text variant="headlineSmall" style={styles.userName}>{user?.name || '未知用户'}</Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>ID: {user?.id || 'N/A'}</Text>
            {user?.email && (
              <Text variant="bodySmall" style={{ color: theme.colors.outline }}>邮箱: {user.email}</Text>
            )}
            {user?.phone && (
              <Text variant="bodySmall" style={{ color: theme.colors.outline }}>手机: {user.phone}</Text>
            )}
            <View style={styles.vipContainer}>
              <Surface 
                style={[
                  styles.badge, 
                  { backgroundColor: user?.is_vip === 1 ? '#ffd700' : theme.colors.surfaceVariant }
                ]}
                elevation={1}
              >
                <Text variant="labelSmall" style={{ color: user?.is_vip === 1 ? '#000' : theme.colors.onSurfaceVariant }}>
                  {user?.is_vip === 1 ? 'VIP用户' : '普通用户'}
                </Text>
              </Surface>
              <Text variant="bodyMedium" style={styles.coinText}>💰 {user?.coin || 0}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* 菜单项 */}
      <Surface style={styles.menuContainer} elevation={1}>
        {menuItems.map((item, index) => (
          <React.Fragment key={index}>
            <List.Item
              title={item.title}
              left={props => <Text style={styles.menuIcon}>{item.icon}</Text>}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={item.onPress}
            />
            {index < menuItems.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </Surface>

      {/* 登出按钮 */}
      <Button
        mode="contained"
        onPress={handleLogout}
        style={styles.logoutButton}
        buttonColor={theme.colors.error}
        textColor="#fff"
      >
        登出
      </Button>

      <View style={styles.footer}>
        <Text variant="labelSmall" style={{ color: theme.colors.outline }}>云湖聊天 v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  userCard: {
    margin: 16,
    borderRadius: 16,
  },
  userCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatarContainer: {
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  vipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
  },
  coinText: {
    fontWeight: '500',
    color: '#ff9500',
  },
  menuContainer: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuIcon: {
    fontSize: 20,
    marginLeft: 8,
    marginRight: 8,
    textAlign: 'center',
  },
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 8,
    borderRadius: 12,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
});