'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import styled, { ThemeProvider, css, keyframes } from 'styled-components';
import GlobalStyles from '@/styles/GlobalStyles';
import Sidebar from '@/components/Sidebar';
import GridContainer from '@/components/GridContainer';
import ChatSidebar from '@/components/ChatSidebar';
import useUIStore from '@/store/uiStore';
import useGridStore, { gridLayoutConfig, GridState } from '@/store/gridStore';
import usePlayerStore, { PlayerState } from '@/store/playerStore';
import useChannelStore from '@/store/channelStore';
import useSearchStore, { SearchState } from '@/store/searchStore';
import {
    FaBars, FaExpand, FaCompress,
    FaVolumeUp, FaVolumeMute,
    FaThLarge, FaPlay, FaPause, FaPlus, FaSyncAlt, FaSearch, FaCog, FaTimes
} from 'react-icons/fa';
import theme from '@/styles/theme';
import SettingsModal from '@/components/SettingsModal';
import YoutubeSearchResultsDropdown from '@/components/YoutubeSearchResultsDropdown';

// Styled components definitions
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
    align-items: flex-start;
    padding: 8px ${({ theme }) => theme.spacing.medium || "16px"};
    flex-shrink: 0;
    justify-content: space-between;
    border-bottom: 1px solid #374151;
    transition: height 0.2s ease-in-out;
`;

const HeaderLeft = styled.div<{ $isFullScreen: boolean }>`
    display: flex;
    align-items: center;
    height: 100%;
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

// Backdrop component
const Backdrop = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6); // Semi-transparent black
    z-index: 1000; // Below search wrapper, above everything else
    cursor: pointer; // Indicate it's clickable
`;

// New wrapper for centering the search bar in the header
const HeaderCenterContainer = styled.div`
    flex-grow: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    padding: 0 ${({ theme }) => theme.spacing.medium || '16px'};
    position: relative; // Needed for z-index context if search has high z-index
    z-index: 1001; // Ensure search container is above backdrop
`;

const HeaderControls = styled.div`
    display: flex;
    align-items: center;
    height: 100%;
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

const AddCellButton = styled(ControlButton)<{ disabled?: boolean }>`
    opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
    cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};

    &:hover {
        background-color: ${({ disabled, theme }) => (disabled ? 'none' : 'rgba(255, 255, 255, 0.1)')};
    }
`;

const ResetLayoutButton = styled(ControlButton)`
    // Özel stil gerekirse buraya eklenebilir
`;

const YoutubeSearchWrapper = styled.div`
    padding: 0;
    position: relative;
    max-width: 600px;
    width: 100%; 
`;

const YoutubeSearchInputContainer = styled.div`
    display: flex;
    align-items: center;
    width: 100%;
    position: relative;
    z-index: 1002;
    
    background-color: #121212; 
    border: 1px solid #4B5563;
    border-radius: 20px; 
    overflow: hidden;
    transition: border-color 0.2s ease, box-shadow 0.2s ease; 

    &:focus-within {
      border-color: ${({ theme }) => theme.colors.primary || '#6366f1'};
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.5);
    }
`;

// Keyframes for the loading animation
const loadingAnimation = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

// Styled component for the loading indicator
const SearchLoadingIndicator = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, rgba(55, 65, 81, 0.2), rgba(99, 102, 241, 0.3), rgba(55, 65, 81, 0.2));
    background-size: 200% 100%;
    animation: ${loadingAnimation} 1.8s linear infinite;
    z-index: 0;
    pointer-events: none;
`;

const YoutubeSearchInput = styled.input`
    flex-grow: 1;
    padding: 8px 15px 8px 15px;
    height: 36px;
    border: none;
    background-color: transparent;
    color: #F3F4F6;
    font-size: 0.9rem;
    outline: none;
    box-sizing: border-box;
    position: relative;
    z-index: 1;
`;

const ClearYoutubeSearchButton = styled.button`
    position: absolute;
    right: 55px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #9CA3AF;
    cursor: pointer;
    padding: 6px;
    display: flex;
    align-items: center;
    font-size: 0.8rem;
    z-index: 2;

    &:hover {
        color: #F3F4F6;
    }
`;

const YoutubeSearchButton = styled.button`
    padding: 0 16px;
    height: 36px;
    border: none;
    border-left: 1px solid #4B5563;
    background-color: #313131;
    color: #F3F4F6;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    transition: background-color 0.2s ease;
    box-sizing: border-box;
    z-index: 1;
    flex-shrink: 0;
    border-radius: 0 19px 19px 0;

    &:hover {
        background-color: #4d4d4d;
    }
`;

const SettingsButton = styled(ControlButton)``;

// Buton grupları için wrapper
const ButtonGroup = styled.div`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.small || '8px'};
`;

// Gruplar arası ayırıcı
const Separator = styled.div`
    width: 1px;
    height: 24px;
    background-color: #4B5563;
    margin: 0 ${({ theme }) => theme.spacing.medium || '16px'};
`;

const getLayoutName = (cols: number): string => {
    const config = gridLayoutConfig[cols];
    if (!config) return `${cols} Columns`;
    const rows = config.rows || Math.ceil(config.cells / cols);
    const calculatedCols = Math.ceil(config.cells / rows);
    return `${rows}x${calculatedCols} Grid`;
};

export default function Home() {
    const { isChannelListVisible, toggleChannelListVisibility } = useUIStore();
    const {
        layout,
        gridCols,
        setGridCols,
        resetCurrentLayout,
        addEmptyCell,
    }: GridState = useGridStore();
    const { 
        isGloballyMuted,
        isPlayingGlobally,
        toggleGlobalMute,
        toggleGlobalPlayPause
    }: PlayerState = usePlayerStore();
    const {
        fetchResults,
        setSearchTerm,
        clearResults,
        results,
        isLoading,
        error,
        currentSearchTerm
    }: SearchState = useSearchStore();
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const isMaxCells = useMemo(() => {
        const config = gridLayoutConfig[gridCols];
        return config ? layout.length >= config.cells : true;
    }, [layout, gridCols]);

    const handleFullScreenChange = useCallback(() => {
        setIsFullScreen(!!document.fullscreenElement);
    }, []);

    const handleYoutubeSearch = () => {
        const term = currentSearchTerm.trim();
        if (term) {
            fetchResults(term);
            setIsSearchDropdownOpen(true);
        } else {
            clearResults();
            setIsSearchDropdownOpen(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        setSearchTerm(term);
        if (term.trim() === '') {
            clearResults();
            setIsSearchDropdownOpen(false);
        } else {
            setIsSearchDropdownOpen(true);
        }
    };

    const handleSearchKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleYoutubeSearch();
        }
    };

    const handleInputFocus = () => {
        if (currentSearchTerm || results.length > 0 || error) {
            setIsSearchDropdownOpen(true);
        }
    };

    const closeSearchDropdown = useCallback(() => {
        setIsSearchDropdownOpen(false);
    }, []);

    const handleClearYoutubeSearch = () => {
        setSearchTerm('');
        clearResults();
        setIsSearchDropdownOpen(false);
        searchInputRef.current?.focus();
    };

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting full-screen: ${err.message} (${err.name})`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    useEffect(() => {
        document.addEventListener('fullscreenchange', handleFullScreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
    }, [handleFullScreenChange]);

    return (
        <ThemeProvider theme={theme}>
            <GlobalStyles />
            {/* Conditionally render Backdrop */} 
            {isSearchDropdownOpen && <Backdrop onClick={closeSearchDropdown} />} 
            <AppWrapper>
                <Header $isFullScreen={isFullScreen}>
                    <HeaderLeft $isFullScreen={isFullScreen}>
                        {!isFullScreen && (
                            <SidebarToggleButton onClick={toggleChannelListVisibility} title="Toggle Channel List">
                                <FaBars />
                            </SidebarToggleButton>
                        )}
                        <SvgLogo viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </SvgLogo>
                        <Title>TubeTopia</Title>
                    </HeaderLeft>

                    <HeaderCenterContainer>
                        <YoutubeSearchWrapper>
                            <YoutubeSearchInputContainer>
                                {isLoading && <SearchLoadingIndicator />}
                                <YoutubeSearchInput
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Search YouTube..."
                                    value={currentSearchTerm}
                                    onChange={handleInputChange}
                                    onKeyPress={handleSearchKeyPress}
                                    onFocus={handleInputFocus}
                                />
                                {currentSearchTerm && !isLoading && (
                                    <ClearYoutubeSearchButton onClick={handleClearYoutubeSearch} title="Clear Search">
                                        <FaTimes />
                                    </ClearYoutubeSearchButton>
                                )}
                                <YoutubeSearchButton onClick={handleYoutubeSearch} title="Search YouTube">
                                    <FaSearch />
                                </YoutubeSearchButton>
                            </YoutubeSearchInputContainer>
                            {isSearchDropdownOpen && (
                                <YoutubeSearchResultsDropdown
                                    inputRef={searchInputRef} 
                                    onClose={closeSearchDropdown}
                                />
                            )}
                        </YoutubeSearchWrapper>
                    </HeaderCenterContainer>

                    <HeaderControls>
                        <ButtonGroup>
                            <LayoutSelect onChange={(e) => setGridCols(Number(e.target.value))} value={gridCols}>
                                {Object.keys(gridLayoutConfig).map((key) => (
                                    <option key={key} value={key}>{getLayoutName(Number(key))}</option>
                                ))}
                            </LayoutSelect>
                            <AddCellButton onClick={addEmptyCell} title="Add Cell" disabled={isMaxCells}>
                                <FaPlus />
                            </AddCellButton>
                            <ResetLayoutButton onClick={resetCurrentLayout} title="Reset Grid Layout">
                                <FaSyncAlt />
                            </ResetLayoutButton>
                        </ButtonGroup>
                        <Separator />
                        <ButtonGroup>
                            <MuteButton onClick={toggleGlobalMute} title={isGloballyMuted ? "Unmute All" : "Mute All"}>
                                {isGloballyMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                            </MuteButton>
                            <PlayPauseButton onClick={toggleGlobalPlayPause} title={isPlayingGlobally ? "Pause All" : "Resume All"}>
                                {isPlayingGlobally ? <FaPause /> : <FaPlay />}
                            </PlayPauseButton>
                        </ButtonGroup>
                        <Separator />
                        <ButtonGroup>
                            <FullScreenButton onClick={toggleFullScreen} title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}>
                                {isFullScreen ? <FaCompress /> : <FaExpand />}
                            </FullScreenButton>
                            <SettingsButton onClick={() => setIsSettingsModalOpen(true)} title="Settings">
                                <FaCog />
                            </SettingsButton>
                        </ButtonGroup>
                    </HeaderControls>
                </Header>
                <MainContent $isFullScreen={isFullScreen}>
                    <Sidebar />
                    <ContentWrapper>
                        <GridContainer isFullscreenActive={isFullScreen} />
                        {/* <ChatSidebar /> */}
                    </ContentWrapper>
                </MainContent>
                <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
            </AppWrapper>
        </ThemeProvider>
    );
}