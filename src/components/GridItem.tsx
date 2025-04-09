'use client';

import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import YouTube, { YouTubeProps, YouTubePlayer } from 'react-youtube';
import useChannelStore from '@/store/channelStore';
import usePlayerStore from '@/store/playerStore';
import useGridStore from '@/store/gridStore';
import { FaYoutube, FaExclamationTriangle, FaTimes } from 'react-icons/fa';

const StyledGridItem = styled.div`
  width: 100%;
  height: 100%;
  background-color: #282828;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
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

const ErrorWrapper = styled(PlaceholderWrapper)`
    color: #f87171;
`;

const ErrorIcon = styled(FaExclamationTriangle)`
    font-size: 2.5rem;
    margin-bottom: 10px;
    opacity: 0.8;
`;

const ErrorText = styled(PlaceholderText)`
    color: inherit;
`;

const RemoveButton = styled.button`
    position: absolute;
    top: 5px;
    right: 5px;
    background: rgba(0, 0, 0, 0.5);
    color: #ccc;
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 0.8rem;
    z-index: 10;
    opacity: 0.5;
    transition: opacity 0.2s ease, background-color 0.2s ease;

    &:hover {
        opacity: 1;
        background: rgba(255, 0, 0, 0.7);
        color: #fff;
    }
`;

// YouTube oynatıcısını saran div için stil
const PlayerWrapper = styled.div<{ $isDragging?: boolean; $isResizing?: boolean }>`
    width: 100%;
    height: 100%;
    position: relative; 
    // Sürüklenirken VEYA yeniden boyutlandırılırken fare olaylarını engelle
    ${({ $isDragging, $isResizing }) => ($isDragging || $isResizing) && `pointer-events: none;`}
`;

interface GridItemProps {
  cellId: string;
  contentId: string | null;
  isDragging?: boolean;
  isResizing?: boolean;
}

const GridItem = ({ cellId, contentId, isDragging, isResizing }: GridItemProps) => {
  const channel = useChannelStore((state) => 
    contentId ? state.channels.find((c) => c.id === contentId) : null
  );
  const { isGloballyMuted, isPlayingGlobally } = usePlayerStore(); 
  const playerRef = useRef<YouTubePlayer | null>(null);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const removeCell = useGridStore(state => state.removeCell);

  const handleRemoveCell = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeCell(cellId);
  };

  const opts: YouTubeProps['opts'] = {
    height: '100%',
    width: '100%',
    playerVars: {
        controls: 1, 
    },
  };

  let videoId: string | undefined = undefined;

  useEffect(() => {
      setPlayerError(null);
      if (contentId === null && playerRef.current) {
          console.log(`Destroying player for cell ${cellId} as contentId became null.`);
          if (typeof playerRef.current.destroy === 'function') {
              playerRef.current.destroy();
          }
          playerRef.current = null;
      }
  }, [contentId, cellId]);

    useEffect(() => {
        if (playerRef.current && playerRef.current.mute && playerRef.current.unMute) {
            if (isGloballyMuted) {
                playerRef.current.mute();
            } else {
                playerRef.current.unMute();
            }
        }
    }, [isGloballyMuted, contentId]);

    useEffect(() => {
        if (playerRef.current && playerRef.current.playVideo && playerRef.current.pauseVideo) {
            if (isPlayingGlobally) {
                playerRef.current.playVideo();
            } else {
                playerRef.current.pauseVideo();
            }
        }
    }, [isPlayingGlobally, contentId]);

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
     return (
         <StyledGridItem title={`Cell: ${cellId} - Content ID not found: ${contentId}`}>
             <ErrorWrapper>
                 <ErrorIcon />
                 <ErrorText>Content not found (ID: {contentId}). It might have been deleted.</ErrorText>
             </ErrorWrapper>
         </StyledGridItem>
     );
  }

  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    console.log(`[LOG] onPlayerReady entered for cell: ${cellId}, Content: ${contentId}`);
    if (contentId === null) return;
    playerRef.current = event.target;
    console.log(`Player ready for cell: ${cellId}, Content: ${contentId}`);
    setPlayerError(null);
    if (playerRef.current) {
        if (isGloballyMuted) {
            playerRef.current.mute?.();
        } else {
            playerRef.current.unMute?.();
        }
        if (isPlayingGlobally) {
            playerRef.current.playVideo?.();
        }
    }
  };

  const onPlayerError: YouTubeProps['onError'] = (event) => {
      console.log(`[LOG] onPlayerError entered for cell: ${cellId}, Data: ${event.data}`);
      if (contentId === null) {
          console.warn(`Received player error for cell ${cellId} after content was removed. Ignoring.`);
          return;
      }
      console.error('YouTube Player Error:', event.data, 'for cell:', cellId, 'content:', channel);
      let errorMessage = `Error code: ${event.data}`;
      switch(event.data) {
          case 2: errorMessage = "Invalid parameter value."; break;
          case 5: errorMessage = "HTML5 player error."; break;
          case 100: errorMessage = "Video not found or private."; break;
          case 101: 
          case 150: errorMessage = "Playback not allowed in embedded players."; break;
          default: errorMessage = `An unknown error occurred (${event.data}).`; break;
      }
      setPlayerError(errorMessage);
  }

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
          console.log(`[LOG] Rendering YouTube component for cell: ${cellId}, isDragging: ${isDragging}, isResizing: ${isResizing}`);
          return (
              <PlayerWrapper $isDragging={isDragging} $isResizing={isResizing}>
                  <YouTube 
                      key={contentId} 
                      videoId={videoId}
                      opts={opts} 
                      onReady={onPlayerReady} 
                      onError={onPlayerError}
                      style={{ width: '100%', height: '100%' }}
                  />
              </PlayerWrapper>
          );
      }
      console.log(`[LOG] Rendering Placeholder for cell: ${cellId}`);
      return (
          <PlaceholderWrapper>
              <PlaceholderIcon />
              <PlaceholderText>Click here then select a channel</PlaceholderText>
              <RemoveButton onClick={handleRemoveCell} title="Remove this cell">
                  <FaTimes />
              </RemoveButton>
          </PlaceholderWrapper>
      );
  };

  return (
    <StyledGridItem title={`Cell: ${cellId} - ${playerError ? `Error: ${playerError}` : `Content: ${channel?.name || contentId || 'Empty'}`}`}>
        {renderContent()}
        {contentId && !playerError && (
           <RemoveButton 
                onClick={(e) => {
                    e.stopPropagation(); 
                    useGridStore.getState().clearCellContent(cellId); 
                }}
                title="Clear content / Remove cell"
                style={{ top: '5px', right: '5px' }}
            >
              <FaTimes />
           </RemoveButton>
        )}
    </StyledGridItem>
  );
};

export default GridItem; 