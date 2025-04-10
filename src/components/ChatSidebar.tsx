'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import useGridStore from '@/store/gridStore';
import useChannelStore from '@/store/channelStore';
import { FaTimes } from 'react-icons/fa';

const MIN_CHAT_WIDTH = 200;
const MAX_CHAT_WIDTH = 600;

const SidebarWrapper = styled.aside<{ $isVisible: boolean; $currentWidth: number }>`
  width: ${({ $currentWidth }) => `${$currentWidth}px`};
  height: calc(100vh - 60px);
  border-left: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.white};
  display: flex;
  flex-direction: column;
  transition: margin-right 0.3s ease-in-out;
  margin-right: ${({ $isVisible, $currentWidth }) => ($isVisible ? '0' : `-${$currentWidth + 1}px`)};
  flex-shrink: 0;
  position: relative;
`;

const SidebarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.small} ${({ theme }) => theme.spacing.medium};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.dangerHover};
  flex-shrink: 0;
  color: ${({ theme }) => theme.colors.text};

  h4 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text};
  padding: 0;
  line-height: 1;
`;

const ChatFrame = styled.iframe`
  flex-grow: 1;
  border: none;
  width: 100%;
  height: 100%;
`;

const Placeholder = styled.div`
    flex-grow: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    text-align: center;
    color: #888;
    font-style: italic;
`;

const ResizeHandle = styled.div`
    position: absolute;
    left: -5px;
    top: 0;
    width: 10px;
    height: 100%;
    cursor: col-resize;
    z-index: 20;
`;

const ChatSidebar = () => {
  const { activeGridItemId, isChatVisible, setChatVisibility } = useGridStore();
  const { cellContents } = useGridStore();
  const { channels } = useChannelStore();

  const [width, setWidth] = useState(300);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const activeContentId = activeGridItemId ? cellContents[activeGridItemId] : null;
  const activeChannel = activeContentId 
      ? channels.find(c => c.id === activeContentId)
      : null;

  const chatUrl = activeChannel && (activeChannel.type === 'live' || activeChannel.type === 'video')
    ? `https://www.youtube.com/live_chat?v=${activeChannel.id}&embed_domain=${window.location.hostname}`
    : null;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !sidebarRef.current) return;
    const newWidth = sidebarRef.current.getBoundingClientRect().right - e.clientX;
    const clampedWidth = Math.max(MIN_CHAT_WIDTH, Math.min(newWidth, MAX_CHAT_WIDTH));
    setWidth(clampedWidth);
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return (
    <SidebarWrapper 
        ref={sidebarRef} 
        $isVisible={isChatVisible} 
        $currentWidth={width}
    >
      <ResizeHandle onMouseDown={handleMouseDown} />
      <SidebarHeader>
        <h4>Live Chat</h4>
        <CloseButton onClick={() => setChatVisibility(false)} title="Close Chat">
          <FaTimes />
        </CloseButton>
      </SidebarHeader>
      {chatUrl ? (
        <ChatFrame 
            src={chatUrl} 
            title="Live Chat"
            allowFullScreen
        />
      ) : (
        <Placeholder>
          Select a live stream or video in the grid to view the chat.
        </Placeholder>
      )}
    </SidebarWrapper>
  );
};

export default ChatSidebar; 