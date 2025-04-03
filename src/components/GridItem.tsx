'use client';

import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import YouTube, { YouTubeProps, YouTubePlayer } from 'react-youtube';
import useChannelStore from '@/store/channelStore';
// Player store importu sadece ses için gerekli
import usePlayerStore from '@/store/playerStore'; 
import { FaYoutube } from 'react-icons/fa'; // Placeholder ikonu

const StyledGridItem = styled.div`
  width: 100%;
  height: 100%;
  background-color: #282828; // Koyu arka plan
  /* border: 1px solid ${({ theme }) => theme.colors.border}; */ // Kenarlık kaldırıldı (GridItemWrapper'da var)
  /* border-radius: ${({ theme }) => theme.borderRadius}; */
  /* box-shadow: 0 1px 3px ${({ theme }) => theme.colors.shadow}; */
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

  // Oynatıcı seçenekleri
  const opts: YouTubeProps['opts'] = {
    height: '100%',
    width: '100%',
    playerVars: { 
        // autoplay: 1, // Başlangıçta oynatmayı global state'e bırakalım
        controls: 1, 
        modestbranding: 1, 
        rel: 0, 
    },
  };

  let videoId: string | undefined = undefined;

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
     return <StyledGridItem title={`Cell: ${cellId} - Content ID not found: ${contentId}`}><PlaceholderText>Content not found (ID: {contentId}). It might have been deleted.</PlaceholderText></StyledGridItem>;
  }

  // Oynatıcı hazır olduğunda referansı kaydet ve ayarları uygula
  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target;
    // Kalite logları ve ayarları kaldırıldı
    console.log(`Player ready for cell: ${cellId}, Content: ${contentId}`);
    if (playerRef.current) {
        // Başlangıç ses durumunu ayarla
        if (isGloballyMuted) {
            playerRef.current.mute?.();
        } else {
            playerRef.current.unMute?.();
        }
        // Başlangıç oynatma durumunu ayarla
        if (isPlayingGlobally) {
            playerRef.current.playVideo?.();
        } else {
            // Hazır olduğunda duraklatılmış başlaması için API metodu yok gibi,
            // çok kısa süre sonra durdurmayı deneyebiliriz.
            // setTimeout(() => playerRef.current?.pauseVideo?.(), 100); 
            // Veya autoplay=0 ile başlayıp sonra global play'e göre başlatmak?
            // Şimdilik hazır olunca state'e göre oynatıyoruz.
        }
    }
  };

  const onPlayerError: YouTubeProps['onError'] = (event) => {
      console.error('YouTube Player Error:', event.data, 'for cell:', cellId, 'content:', channel);
  }

  // Ses durumu değişikliğini dinle
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
              console.log(`Playing player for ${contentId}`);
              playerRef.current.playVideo();
          } else {
              console.log(`Pausing player for ${contentId}`);
              playerRef.current.pauseVideo();
          }
      }
  }, [isPlayingGlobally, contentId]); 

  return (
    <StyledGridItem title={`Cell: ${cellId} - Playing: ${channel?.name || contentId}`}>
      {/* contentId varsa ve oynatıcı parametreleri hazırsa */} 
      {(videoId || (opts.playerVars?.list && opts.playerVars?.listType)) ? (
          <YouTube 
            key={contentId} // İçerik değiştiğinde oynatıcının yeniden render olmasını sağla
            videoId={videoId}
            opts={opts} 
            onReady={onPlayerReady} 
            onError={onPlayerError}
            style={{ width: '100%', height: '100%' }}
          />
      ) : (
         // contentId null ise veya oynatıcı hazırlanamadıysa boş placeholder göster
         <PlaceholderWrapper>
            <PlaceholderIcon />
            <PlaceholderText>Click here then select a channel from the list</PlaceholderText>
         </PlaceholderWrapper>
      )}
    </StyledGridItem>
  );
};

export default GridItem; 