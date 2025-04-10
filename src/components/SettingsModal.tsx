'use client';

import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import useApiKeyStore from '@/store/apiKeyStore';
import { FaTimes, FaSave, FaUndo, FaExternalLinkAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import ConfirmationModal from './ConfirmationModal';

// Props for the modal
interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Animations
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideIn = keyframes`
  from { transform: translateY(-30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

// Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: ${fadeIn} 0.3s ease-out;
`;

const ModalContent = styled.div`
  background-color: #1F2937; // Dark background
  color: #E5E7EB;
  padding: 25px 30px;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 500px;
  position: relative;
  animation: ${slideIn} 0.3s ease-out;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #374151;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #9CA3AF;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 5px;
  line-height: 1;
  transition: color 0.2s ease;
  
  &:hover {
      color: #FFF;
  }
`;

const SettingsSection = styled.div`
  margin-bottom: 25px;
`;

const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 500;
  color: #9CA3AF;
  margin: 0 0 10px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InputGroup = styled.div`
    position: relative;
    display: flex;
    align-items: center;
`;

const StyledInput = styled.input`
    flex-grow: 1;
    padding: 10px 12px;
    border: 1px solid #4B5563;
    border-radius: 4px;
    background-color: #374151;
    color: #F3F4F6;
    font-size: 0.9rem;
    outline: none;
    margin-right: 10px; // Buton için boşluk

    &:focus {
        border-color: ${({ theme }) => theme.colors.primary};
        box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.5);
    }
`;

const StyledButton = styled.button`
    background-color: #4F46E5; // Primary color
    color: #FFF;
    border: none;
    border-radius: 4px;
    padding: 10px 15px;
    font-size: 0.9rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: background-color 0.2s ease;

    &:hover {
        background-color: #4338CA;
    }
    
    &.danger {
        background-color: #DC2626; // Danger color
        &:hover {
             background-color: #B91C1C;
        }
    }
`;

const HelperText = styled.p`
    font-size: 0.8rem;
    color: #9CA3AF;
    margin: 8px 0 0 0;
`;

const ApiKeyInfo = styled.div`
    font-size: 0.8rem;
    color: #9CA3AF;
    margin-top: 12px;
    padding: 10px;
    background-color: rgba(75, 85, 99, 0.2); // Subtle background
    border-left: 3px solid #4F46E5; // Primary color border
    border-radius: 0 4px 4px 0;

    p {
        margin: 0 0 8px 0;
        line-height: 1.5;
    }

    a {
        color: #818CF8; // Lighter primary for links
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        transition: color 0.2s ease;

        &:hover {
            color: #A78BFA; // Lighter hover color
            text-decoration: underline;
        }
    }
`;

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { apiKey, setApiKey } = useApiKeyStore();
  const [localApiKey, setLocalApiKey] = useState(apiKey || '');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Update local state if store changes (e.g., on initial load)
  useEffect(() => {
    setLocalApiKey(apiKey || '');
  }, [apiKey]);

  // Handle API Key Save
  const handleSaveApiKey = () => {
    setApiKey(localApiKey);
    toast.success('API Key saved!');
    onClose(); // Close modal after save
  };

  // Handle Reset All Settings
  const handleResetSettings = () => {
    setIsConfirmModalOpen(true);
  };

  // Gerçek reset işlemini yapan fonksiyon
  const confirmReset = () => {
      localStorage.clear();
      window.location.reload();
      // Modal zaten ConfirmationModal içinde kapanacak
  };

  // Prevent rendering if not open
  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}> { /* Close on overlay click */ }
      <ModalContent onClick={(e) => e.stopPropagation()}> { /* Prevent closing when clicking inside */ }
        <ModalHeader>
          <ModalTitle>Settings</ModalTitle>
          <CloseButton onClick={onClose} title="Close Settings">
            <FaTimes />
          </CloseButton>
        </ModalHeader>

        {/* API Key Section */}
        <SettingsSection>
            <SectionTitle>YouTube API Key</SectionTitle>
            <InputGroup>
                <StyledInput 
                    type="password"
                    placeholder="Enter YouTube API Key..."
                    value={localApiKey}
                    onChange={(e) => setLocalApiKey(e.target.value)}
                />
                <StyledButton onClick={handleSaveApiKey}>
                    <FaSave /> Save
                </StyledButton>
            </InputGroup>
            <HelperText>
                Needed for YouTube search and fetching channel names automatically.
            </HelperText>
            <ApiKeyInfo>
                <p>
                    To get a YouTube API Key, you need to create a project in the Google Cloud Console,
                    enable the "YouTube Data API v3", and create credentials (API Key).
                </p>
                <a href="https://console.cloud.google.com/apis/library/youtube.googleapis.com" target="_blank" rel="noopener noreferrer">
                    Go to Google Cloud Console <FaExternalLinkAlt size="0.8em" />
                </a>
            </ApiKeyInfo>
        </SettingsSection>

        {/* Reset Section */}
        <SettingsSection>
            <SectionTitle>Reset Application</SectionTitle>
             <StyledButton className="danger" onClick={handleResetSettings}>
                <FaUndo /> Reset All Settings
            </StyledButton>
             <HelperText>
                This will remove all saved channels, API key, and reset the layout to default.
            </HelperText>
        </SettingsSection>

      </ModalContent>

      {/* Onay Modalı */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmReset}
        title="Reset Settings?"
        message="Are you sure you want to reset all settings? This will remove all saved channels, API key, and reset the layout to default."
        confirmText="Reset"
        confirmButtonVariant="danger"
      />
    </ModalOverlay>
  );
};

export default SettingsModal; 