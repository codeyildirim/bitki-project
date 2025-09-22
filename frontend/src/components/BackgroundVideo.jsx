import React, { useState } from 'react';

const BackgroundVideo = () => {
  const [videoError, setVideoError] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);
  const [currentVideo] = useState('/videos/current-background.mp4');

  const handleVideoError = () => {
    console.error('Video yüklenemedi, fallback gösteriliyor');
    setVideoError(true);
    setVideoLoading(false);
  };

  const handleVideoLoad = () => {
    console.log('Video başarıyla yüklendi');
    setVideoLoading(false);
  };

  // Video yüklenemezse fallback gradient background
  if (videoError) {
    return (
      <div
        className="fixed top-0 left-0 w-full h-full z-[-2]"
        style={{
          background: `
            linear-gradient(45deg, #ff0080, #8000ff, #00ff80, #ff8000, #ff0080),
            radial-gradient(circle at 25% 25%, rgba(255,0,128,0.3) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(0,255,128,0.3) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(128,0,255,0.3) 0%, transparent 50%)
          `,
          backgroundSize: '400% 400%, 100% 100%, 100% 100%, 100% 100%',
          animation: 'psychedelic 8s ease-in-out infinite'
        }}
      >
        <style>{`
          @keyframes psychedelic {
            0% { background-position: 0% 50%; filter: hue-rotate(0deg); }
            25% { background-position: 100% 50%; filter: hue-rotate(90deg); }
            50% { background-position: 100% 100%; filter: hue-rotate(180deg); }
            75% { background-position: 50% 100%; filter: hue-rotate(270deg); }
            100% { background-position: 0% 50%; filter: hue-rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      {/* Loading/Fallback gradient her zaman render edilir */}
      {videoLoading && (
        <div
          className="fixed top-0 left-0 w-full h-full z-[-3]"
          style={{
            background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
          }}
        />
      )}

      {/* Video element - her zaman render edilir ama gizlenebilir */}
      {!videoError && (
        <video
          autoPlay
          muted
          loop
          playsInline
          onError={handleVideoError}
          onLoadedData={handleVideoLoad}
          className="fixed top-0 left-0 w-full h-full object-cover z-[-2]"
          style={{
            filter: 'brightness(0.7)',
            display: videoLoading ? 'none' : 'block'
          }}
        >
          <source src={currentVideo} type="video/mp4" />
        </video>
      )}

      {/* Video overlay için gradient */}
      <div className="fixed top-0 left-0 w-full h-full z-[-1] bg-gradient-to-b from-black/20 via-transparent to-black/40"></div>
    </>
  );
};

export default BackgroundVideo;