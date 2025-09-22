import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

const DynamicBackground = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [videoExists, setVideoExists] = useState(false);
  const [imageExists, setImageExists] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const location = useLocation();

  // Sayfa anahtarını belirle
  const pageKey = useMemo(() => {
    const pathname = location.pathname;
    if (pathname === '/' || pathname === '/home') return 'home';
    if (pathname.startsWith('/products')) return 'products';
    if (pathname.startsWith('/blog')) return 'blog';
    return 'home'; // fallback
  }, [location.pathname]);

  // Ekran boyutu ve tercihler
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    const checkMotionPreference = () => {
      setPrefersReducedMotion(
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      );
    };

    checkScreenSize();
    checkMotionPreference();

    window.addEventListener('resize', checkScreenSize);
    const motionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionMedia.addEventListener('change', checkMotionPreference);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
      motionMedia.removeEventListener('change', checkMotionPreference);
    };
  }, []);

  // Dosya yolları
  const deviceType = isMobile ? 'mobile' : 'desktop';
  const videoSrc = `/backgrounds/${pageKey}-${deviceType}.mp4`;
  const imageSources = [
    `/backgrounds/${pageKey}-${deviceType}.webp`,
    `/backgrounds/${pageKey}-${deviceType}.jpg`,
    `/backgrounds/${pageKey}-${deviceType}.png`,
  ];

  // Kaynak varlığını kontrol et
  useEffect(() => {
    const checkVideo = async () => {
      if (prefersReducedMotion) {
        setVideoExists(false);
        return;
      }

      try {
        const response = await fetch(videoSrc, { method: 'HEAD' });
        setVideoExists(response.ok);
      } catch {
        setVideoExists(false);
      }
    };

    const checkImages = async () => {
      for (const src of imageSources) {
        try {
          const response = await fetch(src, { method: 'HEAD' });
          if (response.ok) {
            setImageExists(src);
            return;
          }
        } catch {
          // Continue checking next format
        }
      }
      setImageExists(false);
    };

    checkVideo();
    checkImages();
  }, [pageKey, deviceType, prefersReducedMotion]);

  // Video render
  if (videoExists && !prefersReducedMotion) {
    return (
      <>
        <video
          key={`${pageKey}-${deviceType}-video`}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="pointer-events-none fixed inset-0 w-full h-full object-cover z-[-10]"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
        {/* Overlay - karartma efekti */}
        <div className="fixed inset-0 z-[-5] bg-black/30 pointer-events-none" />
      </>
    );
  }

  // Resim fallback
  if (imageExists) {
    return (
      <>
        <div
          className="fixed inset-0 z-[-10] bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${imageExists})` }}
        />
        {/* Overlay - karartma efekti */}
        <div className="fixed inset-0 z-[-5] bg-black/20 pointer-events-none" />
      </>
    );
  }

  // Hiçbiri yoksa şeffaf bırak (gradient yok)
  return null;
};

export default DynamicBackground;