'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styled, { ThemeProvider, css } from 'styled-components';
import theme from '@/styles/theme';
import GlobalStyles from '@/styles/GlobalStyles';
import Sidebar from '@/components/Sidebar';
import GridContainer from '@/components/GridContainer';
import ChatSidebar from '@/components/ChatSidebar';
import useUIStore from '@/store/uiStore';
import useGridStore from '@/store/gridStore';
import usePlayerStore from '@/store/playerStore';
import {
    FaBars, FaExpand, FaCompress,
    FaVolumeUp, FaVolumeMute,
    FaThLarge, FaPlay, FaPause
} from 'react-icons/fa';

const gridLayoutConfig: { [key: number]: { cells: number; rows: number } } = {
    4: { cells: 4, rows: 2 },
    6: { cells: 6, rows: 2 },
    8: { cells: 8, rows: 2 },
    9: { cells: 9, rows: 3 },
    12: { cells: 12, rows: 3 }
};

const getLayoutName = (cols: number): string => {
    switch(cols) {
        case 4: return '2x2';
        case 6: return '3x2';
        case 8: return '4x2';
        case 9: return '3x3';
        case 12: return '4x3';
        default: return `${cols} cols`;
    }
};

const AppWrapper = styled.div`
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
    background-color: ${() => theme.colors.background};
`;

const Header = styled.header<{ $isFullScreen: boolean }>`
    height: ${({ $isFullScreen }) => ($isFullScreen ? '40px' : '60px')};
    background-color: #1F2937;
    color: #F3F4F6;
    display: flex;
    align-items: center;
    padding: 0 ${({ theme }) => theme.spacing.medium || "16px"};
    flex-shrink: 0;
    justify-content: space-between;
    border-bottom: 1px solid #374151;
    transition: height 0.2s ease-in-out;
`;

const HeaderLeft = styled.div<{ $isFullScreen: boolean }>`
    display: flex;
    align-items: center;
    ${({ $isFullScreen }) =>
            $isFullScreen &&
            css`
                ${Title} {
                    opacity: 0;
                    pointer-events: none;
                    width: 0;
                    margin-left: 0;
                }
                ${SidebarToggleButton} {
                    display: none;
                }
            `}
`;

const Title = styled.h1`
    font-size: 1.3rem;
    margin: 0;
    margin-left: ${({ theme }) => theme.spacing.small};
    font-weight: 600;
    letter-spacing: 0.2px;
    color: #E5E7EB;
    transition: opacity 0.2s ease-in-out, width 0.2s ease-in-out, margin-left 0.2s ease-in-out;
`;

const SidebarToggleButton = styled.button`
    background: none;
    border: none;
    color: #D1D5DB;
    font-size: 1.4rem;
    cursor: pointer;
    padding: 8px;
    margin-right: ${({ theme }) => theme.spacing.small};
    display: flex;
    align-items: center;
    border-radius: 4px;
    transition: background-color 0.2s ease, opacity 0.2s ease-in-out;
    &:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }
`;

const SvgLogo = styled.svg`
    width: 30px;
    height: 24px;
    flex-shrink: 0;
`;

const HeaderControls = styled.div`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.small};
`;

const ControlButton = styled(SidebarToggleButton)`
    margin-right: 0;
`;

const LayoutSelect = styled.select`
    padding: 6px 8px;
    border: 1px solid #4B5563;
    border-radius: 4px;
    background-color: #374151;
    color: #F3F4F6;
    font-size: 0.8rem;
    outline: none;
    cursor: pointer;

    &:focus {
        border-color: ${({ theme }) => theme.colors.primary};
        box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.5);
    }
`;

const FullScreenButton = styled(ControlButton)``;
const MuteButton = styled(ControlButton)``;
const PlayPauseButton = styled(ControlButton)``;

const MainContent = styled.main<{ $isFullScreen: boolean }>`
    display: flex;
    flex-grow: 1;
    overflow: hidden;
    height: ${({ $isFullScreen }) => ($isFullScreen ? 'calc(100vh - 40px)' : 'calc(100vh - 60px)')};
    transition: height 0.2s ease-in-out;
`;

const ContentWrapper = styled.div`
    flex-grow: 1;
    display: flex;
    overflow: hidden;
`;

export default function Home() {
    const { toggleChannelListVisibility } = useUIStore();
    const [isFullscreenActive, setIsFullscreenActive] = useState(false);
    const { isGloballyMuted, toggleGlobalMute, isPlayingGlobally, toggleGlobalPlayPause } = usePlayerStore();
    const { gridCols, setGridCols } = useGridStore();

    const toggleBrowserFullScreen = useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }, []);

    useEffect(() => {
        const handleFullScreenChange = () => {
            setIsFullscreenActive(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullScreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullScreenChange);
        };
    }, []);

    return (
        <ThemeProvider theme={theme}>
            <GlobalStyles />
            <AppWrapper>
                <Header $isFullScreen={isFullscreenActive}>
                    <HeaderLeft $isFullScreen={isFullscreenActive}>
                        {!isFullscreenActive && (
                            <SidebarToggleButton onClick={toggleChannelListVisibility} title="Toggle Channel List">
                                <FaBars />
                            </SidebarToggleButton>
                        )}
                        <SvgLogo viewBox="0 0 30 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="30" height="24" rx="4" fill="#FFFFFF"/>
                            <rect x="4" y="4" width="22" height="16" rx="2" fill="#FF0000"/>
                            <path d="M13 10L18 12L13 14V10Z" fill="#FFFFFF"/>
                        </SvgLogo>
                        <Title>TubeTopia</Title>
                    </HeaderLeft>

                    <HeaderControls>
                        <FaThLarge title="Layout Settings" style={{color: '#9CA3AF'}}/>
                        <LayoutSelect
                            value={gridCols.toString()}
                            onChange={(e) => setGridCols(parseInt(e.target.value, 10))}
                            title="Select Grid Layout"
                        >
                            {/* eslint-disable-next-line @typescript-eslint/no-unused-vars */}
                            {Object.entries(gridLayoutConfig).map(([colsKey, config]) => (
                                <option key={colsKey} value={colsKey}>
                                    {getLayoutName(parseInt(colsKey))} ({colsKey} cols)
                                </option>
                            ))}
                        </LayoutSelect>

                        <MuteButton onClick={toggleGlobalMute} title={isGloballyMuted ? "Unmute All" : "Mute All"}>
                            {isGloballyMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                        </MuteButton>

                        <PlayPauseButton onClick={toggleGlobalPlayPause} title={isPlayingGlobally ? "Pause All" : "Play All"}>
                            {isPlayingGlobally ? <FaPause /> : <FaPlay />}
                        </PlayPauseButton>

                        <FullScreenButton onClick={toggleBrowserFullScreen} title={isFullscreenActive ? "Exit Full Screen" : "Enter Full Screen"}>
                            {isFullscreenActive ? <FaCompress /> : <FaExpand />}
                        </FullScreenButton>
                    </HeaderControls>
                </Header>
                <MainContent $isFullScreen={isFullscreenActive}>
                    {!isFullscreenActive && <Sidebar />}
                    <ContentWrapper>
                        <GridContainer isFullscreenActive={isFullscreenActive} />
                        <ChatSidebar />
                    </ContentWrapper>
                </MainContent>
            </AppWrapper>
        </ThemeProvider>
    );
}