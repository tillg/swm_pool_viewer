import { useMemo } from 'react';
import { Link } from 'react-router-dom';
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

const Section = styled.section`
  margin-bottom: ${theme.spacing.xl};
  padding-bottom: ${theme.spacing.l};
  border-bottom: 1px solid ${theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const SectionTitle = styled.h2`
  color: #0065CC;
  font-family: ${theme.typography.fontFamily.bold};
  font-weight: 700;
  font-size: 20px;
  line-height: 1.4;
  margin: 0 0 ${theme.spacing.m} 0;
`;

const Paragraph = styled.p`
  color: rgb(32, 32, 32);
  font-size: 16px;
  line-height: 1.5;
  margin: 0 0 ${theme.spacing.m} 0;

  &:last-child {
    margin-bottom: 0;
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

const Label = styled.strong`
  font-family: ${theme.typography.fontFamily.bold};
  font-weight: 700;
`;

const Footer = styled.footer`
  background: ${theme.colors.background.page};
  padding: ${theme.spacing.xl} 0;
  border-top: 1px solid ${theme.colors.border};
`;

const FooterContent = styled.div`
  max-width: ${theme.layout.contentMaxWidth};
  margin: 0 auto;
  padding: 0 ${theme.spacing.xl};
`;

const FooterLink = styled(Link)`
  color: #0065CC;
  text-decoration: none;
  font-size: 15px;
  font-family: ${theme.typography.fontFamily.bold};
  font-weight: 700;

  &:hover {
    text-decoration: underline;
  }

  &::after {
    content: ' >>';
  }
`;

export function Impressum() {
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

        <Title>Impressum</Title>

        <Section>
          <SectionTitle>Angaben gemäß § 5 TMG</SectionTitle>
          <Paragraph>
            Till Gartner
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>Kontakt</SectionTitle>
          <Paragraph>
            <Label>E-Mail:</Label> <a href="mailto:till.gartner@gmail.com">till.gartner@gmail.com</a>
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</SectionTitle>
          <Paragraph>
            Till Gartner
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>Haftungsausschluss</SectionTitle>

          <Paragraph>
            <Label>Haftung für Inhalte</Label><br />
            Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit
            und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
          </Paragraph>

          <Paragraph>
            <Label>Haftung für Links</Label><br />
            Unsere Webseite enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben.
            Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten
            Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
          </Paragraph>
        </Section>
      </ContentContainer>

      <Footer>
        <FooterContent>
          <FooterLink to="/">Startseite</FooterLink>
        </FooterContent>
      </Footer>
    </PageWrapper>
  );
}
