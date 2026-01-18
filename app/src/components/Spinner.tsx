import styled, { keyframes } from 'styled-components';
import { theme } from '../styles/theme';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SpinnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  gap: ${theme.spacing.m};
`;

const SpinnerRing = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid ${theme.colors.border};
  border-top-color: ${theme.colors.brand.secondary};
  border-radius: ${theme.borderRadius.round};
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.span`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.bodySmall};
`;

export function Spinner() {
  return (
    <SpinnerContainer>
      <SpinnerRing />
      <LoadingText>Loading data...</LoadingText>
    </SpinnerContainer>
  );
}
