'use client';

import React from 'react';
import styled, { keyframes } from 'styled-components';
import { FaTimes, FaCheck, FaExclamationTriangle } from 'react-icons/fa';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonVariant?: 'danger' | 'primary';
}

// Animations (SettingsModal'dan kopyalandı, gerekirse ayrı bir dosyaya taşınabilir)
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideIn = keyframes`
  from { transform: scale(0.95) translateY(-10px); opacity: 0; }
  to { transform: scale(1) translateY(0); opacity: 1; }
`;

// Styled Components (SettingsModal'dan benzerleri alındı)
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.75); /* Biraz daha koyu overlay */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050; /* SettingsModal'dan daha yukarıda */
  animation: ${fadeIn} 0.2s ease-out;
`;

const ModalContent = styled.div`
  background-color: #2a374a; /* Biraz farklı bir arka plan */
  color: #E5E7EB;
  padding: 20px 25px;
  border-radius: 8px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.4);
  width: 90%;
  max-width: 400px; /* Daha küçük modal */
  position: relative;
  animation: ${slideIn} 0.25s cubic-bezier(0.165, 0.84, 0.44, 1);
  border: 1px solid #4b5563;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #374151;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.1rem; /* Biraz daha küçük başlık */
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ffcc00; /* Uyarı rengi */
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #9CA3AF;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 5px;
  line-height: 1;
  transition: color 0.2s ease;
  &:hover { color: #FFF; }
`;

const ModalBody = styled.p`
  font-size: 0.9rem;
  margin-bottom: 20px;
  line-height: 1.6;
  color: #cbd5e1; /* Biraz daha açık metin rengi */
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const StyledButton = styled.button<{ $variant?: 'danger' | 'primary' | 'secondary' }>`
  background-color: ${({ $variant = 'secondary', theme }) =>
    $variant === 'danger' ? (theme.colors.danger ?? '#DC2626') :
    $variant === 'primary' ? (theme.colors.primary ?? '#4F46E5') :
    '#4B5563'}; /* İkincil buton rengi */
  color: #FFF;
  border: none;
  border-radius: 4px;
  padding: 8px 16px; /* Biraz daha küçük padding */
  font-size: 0.85rem; /* Biraz daha küçük font */
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background-color 0.2s ease, transform 0.1s ease;

  &:hover {
    background-color: ${({ $variant = 'secondary', theme }) =>
      $variant === 'danger' ? (theme.colors.dangerHover ?? '#B91C1C') :
      $variant === 'primary' ? (theme.colors.primaryHover ?? '#4338CA') :
      '#5a6a7f'};
  }
  
  &:active {
      transform: scale(0.98);
  }
`;

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmButtonVariant = 'primary',
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose(); // Otomatik kapatma
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            <FaExclamationTriangle /> {title}
          </ModalTitle>
          <CloseButton onClick={onClose} title="Close">
            <FaTimes />
          </CloseButton>
        </ModalHeader>
        <ModalBody>{message}</ModalBody>
        <ModalFooter>
          <StyledButton $variant="secondary" onClick={onClose}>
            {cancelText}
          </StyledButton>
          <StyledButton $variant={confirmButtonVariant} onClick={handleConfirm}>
            <FaCheck /> {confirmText}
          </StyledButton>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ConfirmationModal; 