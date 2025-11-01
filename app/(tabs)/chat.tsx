import Avatar from '@/components/ui/Avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ProfileScreen() {
  const router = useRouter();
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
    <ScrollView style={styles.container}>
      {/* 用户信息卡片 */}
      <View style={styles.userCard}>
        <View style={styles.avatarContainer}>
          <Avatar
            uri={user?.avatar_url}
            size={80}
            fallbackIcon="👤"
          />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.name || '未知用户'}</Text>
          <Text style={styles.userDetail}>ID: {user?.id || 'N/A'}</Text>
          {user?.email && (
            <Text style={styles.userDetail}>邮箱: {user.email}</Text>
          )}
          {user?.phone && (
            <Text style={styles.userDetail}>手机: {user.phone}</Text>
          )}
          <View style={styles.vipContainer}>
            {user?.is_vip === 1 ? (
              <Text style={styles.vipBadge}>VIP用户</Text>
            ) : (
              <Text style={styles.normalBadge}>普通用户</Text>
            )}
            <Text style={styles.coinText}>💰 {user?.coin || 0}</Text>
          </View>
        </View>
      </View>

      {/* 菜单项 */}
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuTitle}>{item.title}</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 登出按钮 */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.7}
      >
        <Text style={styles.logoutText}>登出</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>云湖聊天 v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  userCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  avatarContainer: {
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  userDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  vipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  vipBadge: {
    backgroundColor: '#ffd700',
    color: '#000',
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    fontWeight: 'bold',
    marginRight: 8,
  },
  normalBadge: {
    backgroundColor: '#e9ecef',
    color: '#666',
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
  },
  coinText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ff9500',
  },
  menuContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuTitle: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  menuArrow: {
    fontSize: 20,
    color: '#ccc',
  },
  logoutButton: {
    backgroundColor: '#ff3b30',
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});