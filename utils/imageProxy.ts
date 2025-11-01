// 图片代理工具函数

/**
 * 获取代理后的图片URL
 * @param originalUrl 原始图片URL
 * @returns 代理后的URL
 */
export function getProxyImageUrl(originalUrl: string): string {
  if (!originalUrl) return '';
  
  // 如果是云湖的图片，使用代理
  if (originalUrl.includes('chat-img.jwznb.com') || originalUrl.includes('chat-img2.jwznb.com')) {
    // 使用weserv图片代理服务，支持referer
    return `https://images.weserv.nl/?url=${encodeURIComponent(originalUrl)}`;
  }
  
  // 其他图片直接返回
  return originalUrl;
}

/**
 * 获取多个备选的代理URL
 * @param originalUrl 原始图片URL
 * @returns 代理URL数组，按优先级排序
 */
export function getProxyImageUrls(originalUrl: string): string[] {
  if (!originalUrl) return [];
  
  const urls: string[] = [];
  
  // 方案1: 直接尝试原图
  urls.push(originalUrl);
  
  // 如果是需要代理的图片，添加代理方案
  if (originalUrl.includes('chat-img.jwznb.com') || originalUrl.includes('chat-img2.jwznb.com')) {
    // 方案2: weserv代理（支持referer，速度快）
    urls.push(`https://images.weserv.nl/?url=${encodeURIComponent(originalUrl)}`);
    
    // 方案3: 另一个代理服务
    urls.push(`https://imageproxy.pimg.tw/resize?url=${encodeURIComponent(originalUrl)}`);
    
    // 方案4: 如果有自己的代理服务可以在这里添加
    // urls.push(`https://your-proxy.com/image?url=${encodeURIComponent(originalUrl)}`);
  }
  
  return urls;
}
