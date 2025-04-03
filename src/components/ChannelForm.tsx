'use client';

import React, { useState } from 'react';
import styled, { DefaultTheme } from 'styled-components';
import useChannelStore, { ChannelType } from '@/store/channelStore';

// Form stilini güncelle
const FormWrapper = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.small};
`;

// Input ve Select için ortak stiller
const inputSelectStyles = (
    theme: DefaultTheme
) => `
  padding: 8px 12px;
  border: 1px solid #4B5563; // Kenarlık rengi
  border-radius: 4px;
  background-color: #374151; // Koyu arka plan
  color: #F3F4F6; // Açık yazı rengi
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:focus {
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.5); // Ana renk ile focus efekti
  }

  &::placeholder {
    color: #9CA3AF; // Placeholder rengi
  }
`;

const Input = styled.input`
  ${({ theme }: { theme: DefaultTheme }) => inputSelectStyles(theme)}
`;

const Select = styled.select`
  ${({ theme }: { theme: DefaultTheme }) => inputSelectStyles(theme)}
  appearance: none; // Tarayıcı varsayılan okunu kaldır
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%239CA3AF' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E"); // Özel ok ikonu (SVG)
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 1em;
`;

// Button stilini güncelle
const Button = styled.button`
  padding: 10px 15px;
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.primary}; // Ana renk
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #4F46E5; // Hover rengi (biraz daha koyu primary)
  }

  &:disabled {
    background-color: #4B5563; // Pasif buton rengi
    cursor: not-allowed;
  }
`;

const ChannelForm = () => {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<ChannelType>('video');
  const addChannel = useChannelStore((state) => state.addChannel);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    addChannel({ url, name: name || undefined, type });
    setUrl('');
    setName('');
    setType('video');
  };

  return (
    <FormWrapper onSubmit={handleSubmit}>
      <Input
        type="text"
        placeholder="YouTube URL or ID"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        required
      />
      <Input
        type="text"
        placeholder="Name (Optional)"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Select value={type} onChange={(e) => setType(e.target.value as ChannelType)}>
        <option value="video">Video</option>
        <option value="live">Live Stream</option>
        {/* <option value="playlist">Playlist</option> */}
      </Select>
      <Button type="submit">Add</Button>
    </FormWrapper>
  );
};

export default ChannelForm; 