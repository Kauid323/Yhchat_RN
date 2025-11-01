import { encode } from 'base-64';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

interface ImageWithRefererProps {
  uri: string;
  style?: any;
  onError?: () => void;
  onLoad?: () => void;
  onLoadStart?: () => void;
  fallbackComponent?: React.ReactNode;
}

export default function ImageWithReferer({
  uri,
  style,
  onError,
  onLoad,
  onLoadStart,
  fallbackComponent
}: ImageWithRefererProps) {
  const [imageError, setImageError] = useState(false);
  const [base64Uri, setBase64Uri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uri) return;

    const loadImageWithReferer = async () => {
      try {
        setLoading(true);
        setImageError(false);
        onLoadStart?.();

        console.log('开始加载图片:', uri);

        // 使用fetch获取图片数据，带上referer头
        const response = await fetch(uri, {
          headers: {
            'Referer': 'https://myapp.jwznb.com',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // 获取图片数据
        const arrayBuffer = await response.arrayBuffer();
        
        // 转换为base64
        let base64String = '';
        const bytes = new Uint8Array(arrayBuffer);
        const chunkSize = 0x8000; // 32KB chunks to avoid call stack overflow
        
        for (let i = 0; i < bytes.length; i += chunkSize) {
          const chunk = bytes.subarray(i, i + chunkSize);
          base64String += String.fromCharCode.apply(null, Array.from(chunk));
        }
        
        const base64 = encode(base64String);
        const mimeType = response.headers.get('content-type') || 'image/jpeg';
        const dataUri = `data:${mimeType};base64,${base64}`;

        setBase64Uri(dataUri);
        setLoading(false);
        onLoad?.();
        console.log('图片加载成功:', uri);

      } catch (error) {
        console.log('图片加载失败:', uri, error);
        setImageError(true);
        setLoading(false);
        onError?.();
      }
    };

    loadImageWithReferer();
  }, [uri]);

  if (imageError) {
    return fallbackComponent || (
      <View style={[styles.fallback, style]}>
        <Text style={styles.fallbackText}>❌</Text>
      </View>
    );
  }

  if (loading || !base64Uri) {
    return (
      <View style={[styles.loading, style]}>
        <Text style={styles.loadingText}>⏳</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: base64Uri }}
      style={style}
      onError={() => {
        console.log('Base64图片显示失败');
        setImageError(true);
        onError?.();
      }}
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    fontSize: 20,
  },
  loading: {
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
});
