import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '../styles/theme';

const FooterContainer = styled.footer`
  background: ${theme.colors.background.page};
  padding: ${theme.spacing.xl} 0;
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
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.xs};

  &:hover {
    text-decoration: underline;
  }

  &::after {
    content: ' >>';
  }
`;

const LinkContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.l};
`;

export function Footer() {
  return (
    <FooterContainer>
      <FooterContent>
        <LinkContainer>
          <FooterLink to="/impressum">Impressum</FooterLink>
          <FooterLink to="/todo">Was noch kommt</FooterLink>
        </LinkContainer>
      </FooterContent>
    </FooterContainer>
  );
}
