import { useMemo } from 'react';
import styled from 'styled-components';
import { theme } from '../styles/theme';

const POOL_IMAGES = [
  '/pool-1.jpg',
  '/pool-2.jpg',
  '/pool-3.jpg',
  '/pool-4.jpg',
  '/pool-5.jpg',
];

const HeroContainer = styled.section`
  position: relative;
  width: 100%;
  height: 400px;
  overflow: visible;

  ${theme.mediaQueries.mobile} {
    height: auto;
    margin-bottom: 80px;
  }
`;

const HeroImage = styled.div<{ $imageUrl: string }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url(${props => props.$imageUrl});
  background-size: cover;
  background-position: center;

  ${theme.mediaQueries.mobile} {
    position: relative;
    height: 250px;
  }
`;

const HeroContent = styled.div`
  position: relative;
  max-width: ${theme.layout.contentMaxWidth};
  margin: 0 auto;
  padding: ${theme.spacing.xl};
  height: 100%;
  display: flex;
  align-items: center;

  ${theme.mediaQueries.mobile} {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    transform: translateY(50%);
    height: auto;
    padding: 0 ${theme.spacing.m};
  }
`;

const HeroBox = styled.div`
  background: ${theme.colors.brand.primary};
  padding: 60px 60px 64px;
  max-width: 580px;

  ${theme.mediaQueries.mobile} {
    width: 100%;
    max-width: none;
    padding: 24px 20px 28px;
  }
`;

const HeroTitle = styled.h1`
  color: ${theme.colors.background.page};
  font-family: ${theme.typography.fontFamily.bold};
  font-size: ${theme.typography.fontSize.headlineXL};
  line-height: 1.15;
  margin: 0;

  ${theme.mediaQueries.mobile} {
    font-size: 24px;
    line-height: 1.25;
  }
`;

export function Hero() {
  const randomImage = useMemo(() => {
    const index = Math.floor(Math.random() * POOL_IMAGES.length);
    return POOL_IMAGES[index];
  }, []);

  return (
    <HeroContainer>
      <HeroImage $imageUrl={randomImage} />
      <HeroContent>
        <HeroBox>
          <HeroTitle>
            Auslastungs-Historie der Hallenbäder und Saunen
          </HeroTitle>
        </HeroBox>
      </HeroContent>
    </HeroContainer>
  );
}
