export function validateMediaUrl(url: string): 'image' | 'video' | 'youtube' | 'invalid' {
  if (!url) return 'invalid';
  
  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.match(/\.(jpeg|jpg|gif|png|webp|avif)(\?.*)?$/) != null) {
    return 'image';
  }
  
  if (lowerUrl.match(/\.(mp4|webm|ogv)(\?.*)?$/) != null) {
    return 'video';
  }

  if (lowerUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i) != null) {
    return 'youtube';
  }
  
  return 'invalid';
}

export function getThumbnail(mediaUrl: string, customThumbnail?: string): string {
  if (customThumbnail) {
    return customThumbnail;
  }
  
  const type = validateMediaUrl(mediaUrl);
  
  if (type === 'video') {
    return mediaUrl.replace(/\.(mp4|webm|ogv)(\?.*)?$/i, '.jpg');
  }

  if (type === 'youtube') {
    const match = mediaUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    if (match && match[1]) {
      return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
    }
  }
  
  return mediaUrl;
}
