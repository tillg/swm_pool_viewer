import { useMemo } from 'react';
import styled from 'styled-components';
import { theme } from '../styles/theme';

const POOL_IMAGES = [
  '/pool-1.jpg',
  '/pool-2.jpg',
  '/pool-3.jpg',
  '/pool-4.jpg',
  '/pool-5.jpg',
  '/pool-6.jpg',
  '/pool-7.jpg',
  '/pool-8.jpg',
  '/pool-9.jpg',
  '/pool-10.jpg',
];

const HeroContainer = styled.section`
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
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
`;

const HeroContent = styled.div`
  position: relative;
  max-width: ${theme.layout.contentMaxWidth};
  margin: 0 auto;
  padding: ${theme.spacing.xl};
  height: 100%;
  display: flex;
  align-items: center;
`;

const HeroBox = styled.div`
  background: ${theme.colors.brand.primary};
  padding: 60px 60px 64px;
  max-width: 580px;
`;

const HeroTitle = styled.h1`
  color: ${theme.colors.background.page};
  font-family: ${theme.typography.fontFamily.bold};
  font-size: ${theme.typography.fontSize.headlineXL};
  line-height: 1.15;
  margin: 0;
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
