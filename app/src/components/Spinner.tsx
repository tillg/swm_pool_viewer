import styled, { keyframes } from 'styled-components';

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
  gap: 16px;
`;

const SpinnerRing = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid #e0e0e0;
  border-top-color: #4e79a7;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.span`
  color: #666;
  font-size: 14px;
`;

export function Spinner() {
  return (
    <SpinnerContainer>
      <SpinnerRing />
      <LoadingText>Loading data...</LoadingText>
    </SpinnerContainer>
  );
}
