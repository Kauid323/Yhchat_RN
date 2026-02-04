import { encode } from 'base-64';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native';

interface ImageWithRefererProps {
  uri: string;
  style?: any;
  onError?: () => void;
  onLoad?: () => void;
  onLoadStart?: () => void;
  fallbackComponent?: React.ReactNode;
  onPress?: () => void;
}

export default function ImageWithReferer({
  uri,
  style,
  onError,
  onLoad,
  onLoadStart,
  fallbackComponent,
  onPress
}: ImageWithRefererProps) {
  const [imageError, setImageError] = useState(false);
  const [base64Uri, setBase64Uri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadImageWithReferer = useCallback(async () => {
    if (!uri) return;

    try {
      // 取消之前的请求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // 创建新的 AbortController
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      setLoading(true);
      setImageError(false);
      onLoadStart?.();

      console.log('开始异步加载图片:', uri);

      // 使用 Web Workers 概念的异步处理，完全不阻塞主线程
      const imagePromise = new Promise<string>((resolve, reject) => {
        // 使用 requestIdleCallback 的替代方案，在空闲时处理
        const processInBackground = async () => {
          try {
            if (signal.aborted) {
              reject(new Error('Request aborted'));
              return;
            }

            // 使用fetch获取图片数据，带上referer头
            const response = await fetch(uri, {
              signal,
              headers: {
                'Referer': 'https://myapp.jwznb.com',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
              }
            });

            if (signal.aborted) {
              reject(new Error('Request aborted'));
              return;
            }

            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // 获取图片数据
            const arrayBuffer = await response.arrayBuffer();
            
            if (signal.aborted) {
              reject(new Error('Request aborted'));
              return;
            }

            // 异步转换为base64，分批处理避免阻塞
            const processBase64Async = () => {
              return new Promise<string>((resolveBase64) => {
                const bytes = new Uint8Array(arrayBuffer);
                const chunkSize = 0x8000; // 32KB chunks
                let base64String = '';
                
                // 分批处理，每批之间让出控制权
                const processChunk = (startIndex: number) => {
                  const endIndex = Math.min(startIndex + chunkSize, bytes.length);
                  const chunk = bytes.subarray(startIndex, endIndex);
                  base64String += String.fromCharCode.apply(null, Array.from(chunk));
                  
                  if (endIndex < bytes.length) {
                    // 让出控制权，继续处理下一批
                    setTimeout(() => processChunk(endIndex), 1);
                  } else {
                    // 处理完成
                    const base64 = encode(base64String);
                    const mimeType = response.headers.get('content-type') || 'image/jpeg';
                    const dataUri = `data:${mimeType};base64,${base64}`;
                    
                    resolveBase64(dataUri);
                }
                };
                
                // 开始处理
                setTimeout(() => processChunk(0), 0);
              });
            };

            const dataUri = await processBase64Async();
            
            if (signal.aborted) {
              reject(new Error('Request aborted'));
              return;
            }

            resolve(dataUri);
          } catch (error) {
            reject(error);
          }
        };

        // 立即开始处理，但不阻塞
        processInBackground();
      });

      const dataUri = await imagePromise;
      
      // 检查组件是否仍然挂载
      if (!signal.aborted) {
        setBase64Uri(dataUri);
        setLoading(false);
        onLoad?.();
        console.log('图片异步加载成功:', uri);
      }

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('图片加载被取消:', uri);
        return;
      }
      
      console.log('图片加载失败:', uri, error);
      setImageError(true);
      setLoading(false);
      onError?.();
    }
  }, [uri, onError, onLoad, onLoadStart]);

  useEffect(() => {
    loadImageWithReferer();

    // 清理函数
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadImageWithReferer]);

  const renderContent = () => {
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
  };

  // 如果有点击事件，包装在TouchableOpacity中
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {renderContent()}
      </TouchableOpacity>
    );
  }

  return renderContent();
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
