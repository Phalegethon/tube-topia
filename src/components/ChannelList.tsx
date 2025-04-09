'use client';

import React from 'react';
import styled, { DefaultTheme } from 'styled-components';
import useChannelStore from '@/store/channelStore';
import useGridStore from '@/store/gridStore';
import { FaPlayCircle, FaTimes, FaTv } from 'react-icons/fa';

const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const ListItem = styled.div<{ $isPlaying?: boolean }>` 
  display: flex;
  align-items: center;
  padding: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.small};
  cursor: pointer;
  border-bottom: 1px solid #374151;
  transition: background-color 0.2s ease-in-out;
  color: #D1D5DB;
  background-color: ${({ $isPlaying }) => $isPlaying ? 'rgba(99, 102, 241, 0.1)' : 'transparent'};

  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
  &:last-child {
    border-bottom: none;
  }
`;

const ChannelLogo = styled(FaTv)`
    font-size: 1.5rem;
    color: #9CA3AF;
    margin-right: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.small};
    flex-shrink: 0;
`;

const ChannelDetails = styled.div`
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    overflow: hidden;
    margin-right: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.small};
`;

const NameRow = styled.div`
    display: flex;
    align-items: center;
`;

const ChannelName = styled.span`
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 500;
    font-size: 0.9rem;
    color: #E5E7EB;
    margin-right: 4px;
`;

const PlayingIcon = styled(FaPlayCircle)<{ $isPlaying?: boolean }>`
    color: ${({ theme, $isPlaying }) => $isPlaying ? theme.colors.primary : 'transparent'};
    font-size: 0.8rem;
    transition: color 0.2s ease-in-out;
    flex-shrink: 0;
`;

const ChannelTypeLabel = styled.span`
    font-size: 0.7rem;
    color: #6B7280;
    text-transform: capitalize;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #EF4444;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 5px;
  line-height: 1;
  opacity: 0;
  transition: color 0.2s ease-in-out, opacity 0.2s ease-in-out;
  border-radius: 4px;
  flex-shrink: 0;

  ${ListItem}:hover & {
    opacity: 0.7;
  }

  &:hover {
    opacity: 1;
    color: #F87171;
    background-color: rgba(239, 68, 68, 0.1);
  }
`;

const EmptyListMessage = styled.p`
  padding: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.medium};
  color: #9CA3AF;
  font-style: italic;
  text-align: center;
  font-size: 0.9rem;
`;

interface ChannelListProps {
  searchTerm?: string;
}

const ChannelList: React.FC<ChannelListProps> = ({ searchTerm = '' }) => {
  const { channels, removeChannel } = useChannelStore();
  const { 
      activeGridItemId, 
      setCellContent, 
      setActiveGridItemId, 
      layout, 
      cellContents 
    } = useGridStore();

  const playingChannelIds = new Set(Object.values(cellContents).filter(Boolean) as string[]);

  const handleItemClick = (channelId: string) => {
    if (activeGridItemId) {
      setCellContent(activeGridItemId, channelId);
      setActiveGridItemId(null);
    } else {
      const firstEmptyCell = layout.find(cell => !cellContents[cell.i]);
      if (firstEmptyCell) {
          setCellContent(firstEmptyCell.i, channelId);
      } else {
         alert('No empty grid cells available. Clear a cell or change the layout.');
      }
    }
  };

  const filteredChannels = channels.filter(channel => 
     channel.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ListWrapper>
      {filteredChannels.length === 0 && searchTerm ? (
        <EmptyListMessage>No channels found matching "{searchTerm}"</EmptyListMessage>
      ) : filteredChannels.length === 0 ? (
        <EmptyListMessage>No channels added yet.</EmptyListMessage>
      ) : (
        filteredChannels.map((channel) => {
          const isPlaying = playingChannelIds.has(channel.id);
          return (
            <ListItem 
              key={channel.id} 
              $isPlaying={isPlaying}
              onClick={() => handleItemClick(channel.id)} 
              title={isPlaying ? `${channel.name || channel.id} is currently playing. Click to set active cell.` : `Click to add to first empty cell or set active cell to ${channel.name || channel.id}`}
            >
              <ChannelLogo />
              <ChannelDetails>
                  <NameRow>
                    <ChannelName>{channel.name || channel.id}</ChannelName>
                    <PlayingIcon $isPlaying={isPlaying} title={isPlaying ? "Currently playing" : ""} />
                  </NameRow>
                  <ChannelTypeLabel>{channel.type}</ChannelTypeLabel>
              </ChannelDetails>
              <RemoveButton 
                title={`Remove ${channel.name || channel.id}`}
                onClick={(e) => { 
                  e.stopPropagation();
                  if (window.confirm(`Are you sure you want to remove channel: ${channel.name || channel.id}?`)) {
                    removeChannel(channel.id);
                  }
                }}
              >
                <FaTimes />
              </RemoveButton>
            </ListItem>
          );
        })
      )}
    </ListWrapper>
  );
};

export default ChannelList; 