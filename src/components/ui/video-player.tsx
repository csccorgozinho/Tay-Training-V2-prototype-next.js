import React from 'react';
import { Play } from 'lucide-react';

interface VideoPlayerProps {
  url?: string;
  title?: string;
  className?: string;
}

export const VideoPlayer = ({ url, title = "Video", className = "" }: VideoPlayerProps) => {
  if (!url) return null;

  // Extract video ID and determine provider
  const getEmbedUrl = (videoUrl: string): { embedUrl: string; provider: string } => {
    // YouTube
    const youtubeMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (youtubeMatch) {
      return {
        embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}?modestbranding=1`,
        provider: 'youtube'
      };
    }

    // Vimeo
    const vimeoMatch = videoUrl.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return {
        embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
        provider: 'vimeo'
      };
    }

    // Direct video file (mp4, webm, etc.)
    if (videoUrl.match(/\.(mp4|webm|ogg)$/i)) {
      return {
        embedUrl: videoUrl,
        provider: 'html5'
      };
    }

    // If no match, assume it's a direct embeddable URL
    return {
      embedUrl: videoUrl,
      provider: 'custom'
    };
  };

  const { embedUrl, provider } = getEmbedUrl(url);

  if (provider === 'html5') {
    return (
      <div className={`w-full bg-black rounded-lg overflow-hidden ${className}`}>
        <video
          controls
          className="w-full h-full"
          title={title}
        >
          <source src={embedUrl} type="video/mp4" />
          Seu navegador não suporta o elemento de vídeo.
        </video>
      </div>
    );
  }

  return (
    <div className={`w-full aspect-video bg-black rounded-lg overflow-hidden shadow-lg ${className}`}>
      <iframe
        width="100%"
        height="100%"
        src={embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="border-0"
      />
    </div>
  );
};

export default VideoPlayer;
