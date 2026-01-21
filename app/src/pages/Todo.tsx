import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import { theme } from '../styles/theme';
import { Footer } from '../components/Footer';
import todoContent from '../content/todo.md';

const POOL_IMAGES = [
  '/pool-1.jpg',
  '/pool-2.jpg',
  '/pool-3.jpg',
  '/pool-4.jpg',
  '/pool-5.jpg',
];

const PageWrapper = styled.div`
  min-height: 100vh;
  background: ${theme.colors.background.page};
  font-family: ${theme.typography.fontFamily.primary};
`;

const HeroContainer = styled.div`
  position: relative;
  width: 100%;
  height: 300px;
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

const ContentContainer = styled.div`
  max-width: ${theme.layout.contentMaxWidth};
  margin: 0 auto;
  padding: ${theme.spacing.xl};
`;

const BackLink = styled(Link)`
  color: #0065CC;
  text-decoration: none;
  font-size: 15px;
  font-family: ${theme.typography.fontFamily.bold};
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  margin-bottom: ${theme.spacing.l};

  &:hover {
    text-decoration: underline;
  }

  &::before {
    content: '<< ';
  }
`;

const Title = styled.h1`
  color: rgb(32, 32, 32);
  font-family: ${theme.typography.fontFamily.bold};
  font-weight: 700;
  font-size: 37px;
  line-height: 1.3;
  margin: 0 0 ${theme.spacing.xl} 0;
`;

const MarkdownContent = styled.div`
  h2 {
    color: #0065CC;
    font-family: ${theme.typography.fontFamily.bold};
    font-weight: 700;
    font-size: 20px;
    line-height: 1.4;
    margin: ${theme.spacing.xl} 0 ${theme.spacing.m} 0;
    padding-bottom: ${theme.spacing.s};
    border-bottom: 1px solid ${theme.colors.border};

    &:first-child {
      margin-top: 0;
    }
  }

  ul {
    margin: 0 0 ${theme.spacing.m} 0;
    padding-left: ${theme.spacing.l};
  }

  li {
    color: rgb(32, 32, 32);
    font-size: 16px;
    line-height: 1.5;
    margin-bottom: ${theme.spacing.s};
  }

  p {
    color: rgb(32, 32, 32);
    font-size: 16px;
    line-height: 1.5;
    margin: 0 0 ${theme.spacing.m} 0;
  }

  a {
    color: #0065CC;
    text-decoration: none;
    font-weight: 700;

    &:hover {
      text-decoration: underline;
    }
  }
`;


export function Todo() {
  const randomImage = useMemo(() => {
    const index = Math.floor(Math.random() * POOL_IMAGES.length);
    return POOL_IMAGES[index];
  }, []);

  return (
    <PageWrapper>
      <HeroContainer>
        <HeroImage $imageUrl={randomImage} />
      </HeroContainer>

      <ContentContainer>
        <BackLink to="/">Zurück zur Startseite</BackLink>

        <Title>Was noch kommt</Title>

        <MarkdownContent>
          <ReactMarkdown>{todoContent}</ReactMarkdown>
        </MarkdownContent>
      </ContentContainer>

      <Footer />
    </PageWrapper>
  );
}
