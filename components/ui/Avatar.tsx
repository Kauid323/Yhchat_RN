import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ImageWithReferer from './ImageWithReferer';

interface AvatarProps {
  uri?: string;
  size?: number;
  fallbackText?: string;
  fallbackIcon?: string;
  style?: any;
}

export default function Avatar({ 
  uri, 
  size = 50, 
  fallbackText = '?', 
  fallbackIcon = '👤',
  style 
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  const avatarStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  // 如果没有URI或者图片加载失败，显示默认头像
  if (!uri || imageError) {
    return (
      <View style={[styles.defaultAvatar, avatarStyle, style]}>
        <Text style={[styles.avatarText, { fontSize: size * 0.4 }]}>
          {fallbackIcon}
        </Text>
      </View>
    );
  }

  // 使用ImageWithReferer显示图片，支持自定义headers
  return (
    <ImageWithReferer
      uri={uri}
      style={[styles.image, avatarStyle]}
      onError={() => {
        console.log('头像加载失败:', uri);
        setImageError(true);
      }}
      onLoad={() => {
        console.log('头像加载成功:', uri);
      }}
      onLoadStart={() => {
        console.log('开始加载头像:', uri);
      }}
      fallbackComponent={
        <View style={[styles.defaultAvatar, avatarStyle, style]}>
          <Text style={[styles.avatarText, { fontSize: size * 0.4 }]}>
            {fallbackIcon}
          </Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: '#f0f0f0',
  },
  defaultAvatar: {
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#666',
  },
});
