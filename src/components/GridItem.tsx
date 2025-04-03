'use client';

import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import YouTube, { YouTubeProps, YouTubePlayer } from 'react-youtube';
import useChannelStore from '@/store/channelStore';
import usePlayerStore from '@/store/playerStore'; 
import { FaYoutube, FaExclamationTriangle } from 'react-icons/fa'; // Ses ikonları ve hata ikonu eklendi

const StyledGridItem = styled.div`
  width: 100%;
  height: 100%;
  background-color: #282828; // Koyu arka plan
  overflow: hidden;
  display: flex; // İçeriği (placeholder) ortalamak için
  align-items: center;
  justify-content: center;
`;

const PlaceholderWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #aaa;
    text-align: center;
    padding: 10px;
`;

const PlaceholderIcon = styled(FaYoutube)`
    font-size: 3rem;
    margin-bottom: 10px;
    opacity: 0.6;
`;

const PlaceholderText = styled.p`
    color: #aaa;
    font-size: 0.9rem;
    margin: 0;
`;

// Hata mesajı için stil
const ErrorWrapper = styled(PlaceholderWrapper)`
    color: #f87171; // Kırmızımsı renk
`;

const ErrorIcon = styled(FaExclamationTriangle)`
    font-size: 2.5rem;
    margin-bottom: 10px;
    opacity: 0.8;
`;

const ErrorText = styled(PlaceholderText)`
    color: inherit; // Wrapper'dan rengi al
`;

interface GridItemProps {
  cellId: string; // Hücrenin kendi ID'si (örn. 'cell-0')
  contentId: string | null; // Bu hücrede gösterilecek kanalın/videonun ID'si veya null
}

const GridItem = ({ cellId, contentId }: GridItemProps) => {
  // contentId'ye göre kanalı bul
  const channel = useChannelStore((state) => 
    contentId ? state.channels.find((c) => c.id === contentId) : null
  );
  // Sadece global ses durumu alındı
  const { isGloballyMuted, isPlayingGlobally } = usePlayerStore(); 
  // Oynatıcı referansını tutmak için ref
  const playerRef = useRef<YouTubePlayer | null>(null);
  // Hata durumu için state
  const [playerError, setPlayerError] = useState<string | null>(null);

  // Oynatıcı seçenekleri
  const opts: YouTubeProps['opts'] = {
    height: '100%',
    width: '100%',
    playerVars: {
        controls: 1, 
    },
  };

  let videoId: string | undefined = undefined;

  // contentId değiştiğinde hata durumunu sıfırla ve gerekirse oynatıcıyı yok et
  useEffect(() => {
      setPlayerError(null);
      if (contentId === null && playerRef.current) {
          console.log(`Destroying player for cell ${cellId} as contentId became null.`);
          if (typeof playerRef.current.destroy === 'function') {
              playerRef.current.destroy();
          }
          playerRef.current = null; // Referansı temizle
      }
  }, [contentId, cellId]); // cellId loglama için eklendi

    // Global ses durumu değişikliğini dinle (local state'i güncelleme kaldırıldı)
    useEffect(() => {
        if (playerRef.current && playerRef.current.mute && playerRef.current.unMute) {
            if (isGloballyMuted) {
                playerRef.current.mute();
            } else {
                playerRef.current.unMute();
            }
        }
    }, [isGloballyMuted, contentId]);

    // Oynatma durumu değişikliğini dinle
    useEffect(() => {
        if (playerRef.current && playerRef.current.playVideo && playerRef.current.pauseVideo) {
            if (isPlayingGlobally) {
                playerRef.current.playVideo();
            } else {
                playerRef.current.pauseVideo();
            }
        }
    }, [isPlayingGlobally, contentId]);

    // Eğer içerik atanmışsa ve kanal bilgisi bulunmuşsa oynatıcıyı hazırla
  if (contentId && channel) {
    switch (channel.type) {
      case 'video':
      case 'live':
        videoId = channel.id;
        opts.playerVars = { ...opts.playerVars, listType: undefined, list: undefined };
        break;
      case 'playlist':
        videoId = undefined;
        opts.playerVars = { ...opts.playerVars, listType: 'playlist', list: channel.id };
        break;
      case 'channel':
         // Kanal hala desteklenmiyor
         return (
            <StyledGridItem title={`Cell: ${cellId} - Channel content not supported: ${channel.name}`}>
              <PlaceholderWrapper>
                 <PlaceholderIcon />
                 <PlaceholderText>Channel embedding not supported yet.</PlaceholderText>
                 <PlaceholderText style={{fontSize: '0.7rem', marginTop: '5px'}}>({channel.name})</PlaceholderText>
              </PlaceholderWrapper>
            </StyledGridItem>
        );
      default:
        return <StyledGridItem title={`Cell: ${cellId} - Unknown content type: ${channel.name}`}><PlaceholderText>Unknown content type.</PlaceholderText></StyledGridItem>;
    }
  } else if (contentId && !channel) {
     // ID var ama kanal bulunamadı (silinmiş olabilir)
     return (
         <StyledGridItem title={`Cell: ${cellId} - Content ID not found: ${contentId}`}>
             <ErrorWrapper>
                 <ErrorIcon />
                 <ErrorText>Content not found (ID: {contentId}). It might have been deleted.</ErrorText>
             </ErrorWrapper>
         </StyledGridItem>
     );
  }

  // Oynatıcı hazır olduğunda referansı kaydet ve ayarları uygula
  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    console.log(`[LOG] onPlayerReady entered for cell: ${cellId}, Content: ${contentId}`); // Log eklendi
    // Eğer contentId hazır olmadan önce null olduysa (hızlı tıklama vb.), işlem yapma
    if (contentId === null) return;
    playerRef.current = event.target;
    // Kalite logları ve ayarları kaldırıldı
    console.log(`Player ready for cell: ${cellId}, Content: ${contentId}`);
    setPlayerError(null); // Başarıyla yüklendi, hatayı temizle
    if (playerRef.current) {
        // Başlangıç ses durumunu global state'e göre ayarla
        if (isGloballyMuted) {
            playerRef.current.mute?.();
        } else {
            playerRef.current.unMute?.();
        }
        // Başlangıç oynatma durumunu ayarla
        if (isPlayingGlobally) {
            playerRef.current.playVideo?.();
        }
    }
  };

  // onError olayını güncelle
  const onPlayerError: YouTubeProps['onError'] = (event) => {
      console.log(`[LOG] onPlayerError entered for cell: ${cellId}, Data: ${event.data}`); // Log eklendi
      // Eğer içerik zaten kaldırıldıysa (hata geç geldiyse), loglama ve state güncelleme
      if (contentId === null) {
          console.warn(`Received player error for cell ${cellId} after content was removed. Ignoring.`);
          return;
      }
      console.error('YouTube Player Error:', event.data, 'for cell:', cellId, 'content:', channel);
      let errorMessage = `Error code: ${event.data}`;
      // Yaygın hata kodlarına göre daha anlaşılır mesajlar
      switch(event.data) {
          case 2: errorMessage = "Invalid parameter value."; break;
          case 5: errorMessage = "HTML5 player error."; break;
          case 100: errorMessage = "Video not found or private."; break;
          case 101: 
          case 150: errorMessage = "Playback not allowed in embedded players."; break;
          default: errorMessage = `An unknown error occurred (${event.data}).`; break;
      }
      setPlayerError(errorMessage); // Hata state'ini ayarla
  }



  // Render logic
  const renderContent = () => {
      if (playerError) {
          return (
              <ErrorWrapper>
                  <ErrorIcon />
                  <ErrorText>{playerError}</ErrorText>
                  <ErrorText style={{fontSize: '0.7rem', marginTop: '5px'}}>({channel?.name || contentId})</ErrorText>
              </ErrorWrapper>
          );
      }
      const shouldRenderPlayer = videoId || (opts.playerVars?.list && opts.playerVars?.listType);
      if (shouldRenderPlayer) {
          console.log(`[LOG] Rendering YouTube component for cell: ${cellId}, videoId: ${videoId}, opts:`, opts); // Log eklendi
          return (
              <YouTube 
                  key={contentId} 
                  videoId={videoId}
                  opts={opts} 
                  onReady={onPlayerReady} 
                  onError={onPlayerError}
                  style={{ width: '100%', height: '100%' }}
              />
          );
      }
      // contentId null ise veya hiçbir koşul eşleşmezse placeholder
      console.log(`[LOG] Rendering Placeholder for cell: ${cellId}`); // Log eklendi
      return (
          <PlaceholderWrapper>
              <PlaceholderIcon />
              <PlaceholderText>Click here then select a channel from the list</PlaceholderText>
          </PlaceholderWrapper>
      );
  };

  return (
    <StyledGridItem title={`Cell: ${cellId} - ${playerError ? `Error: ${playerError}` : `Content: ${channel?.name || contentId || 'Empty'}`}`}>
      {renderContent()}
    </StyledGridItem>
  );
};

export default GridItem; 