'use client';

import React from 'react';
import styled from 'styled-components';
import useSearchStore from '@/store/searchStore';
import { FaSpinner, FaExclamationTriangle } from 'react-icons/fa';

const ResultsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%; // Sidebar içinde kalan alanı doldurur
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  color: #ccc;
  font-size: 1.5rem;
  animation: spin 1s linear infinite;
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #f87171;
  text-align: center;
  gap: 10px;
`;

const ResultsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1;
  overflow-y: auto;
  /* Scrollbar stilleri */
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background-color: #4B5563; border-radius: 3px; }
`;

const ResultItem = styled.li`
  display: flex;
  align-items: center;
  padding: 8px ${ ({ theme }) => theme.spacing.medium };
  cursor: pointer;
  border-bottom: 1px solid #374151;
  transition: background-color 0.2s ease;
  gap: 10px;

  &:hover {
    background-color: #374151;
  }
`;

const Thumbnail = styled.img`
  width: 60px; // Küçük resim boyutu
  height: 34px;
  object-fit: cover;
  border-radius: 3px;
  flex-shrink: 0;
`;

const Title = styled.span`
  font-size: 0.85rem;
  color: #E5E7EB;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SearchResults: React.FC = () => {
  const {
    results,
    isLoading,
    error,
    currentSearchTerm,
    assignResultToGrid,
  } = useSearchStore();

  if (isLoading) {
    return <LoadingSpinner><FaSpinner /></LoadingSpinner>;
  }

  if (error) {
    return (
      <ErrorMessage>
        <FaExclamationTriangle size="1.5em" />
        <span>Error: {error}</span>
      </ErrorMessage>
    );
  }

  if (results.length === 0 && currentSearchTerm) {
    return (
        <ErrorMessage style={{ color: '#888' }}>
            No results found for "{currentSearchTerm}"
        </ErrorMessage>
    );
  }

  // Arama yapılmadıysa veya sonuç yoksa (ilk yükleme gibi) boş göster
  if (results.length === 0) {
      return null; 
  }

  return (
    <ResultsWrapper>
      <ResultsList>
        {results.map((item) => (
          <ResultItem key={item.id} onClick={() => assignResultToGrid(item)} title={`Add ${item.title} to selected grid cell`}>
            <Thumbnail src={item.thumbnail} alt={item.title} />
            <Title>{item.title}</Title>
          </ResultItem>
        ))}
      </ResultsList>
    </ResultsWrapper>
  );
};

export default SearchResults; 