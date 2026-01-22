import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import matter from 'gray-matter';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { theme } from '../styles/theme';
import { Footer } from './Footer';

const POOL_IMAGES = [
  '/pool-1.jpg',
  '/pool-2.jpg',
  '/pool-3.jpg',
  '/pool-4.jpg',
  '/pool-5.jpg',
];

interface Frontmatter {
  title: string;
  heroImage?: string;
  showToc?: boolean;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface MarkdownPageProps {
  content: string;
}

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

const ContentWrapper = styled.div`
  display: flex;
  gap: ${theme.spacing.xxl};

  ${theme.mediaQueries.mobile} {
    flex-direction: column;
    gap: ${theme.spacing.m};
  }
`;

const MainContent = styled.div`
  flex: 1;
  min-width: 0;
  order: 1;

  ${theme.mediaQueries.mobile} {
    order: 2;
  }
`;

const TocSidebar = styled.aside`
  width: 250px;
  flex-shrink: 0;
  order: 2;

  ${theme.mediaQueries.mobile} {
    width: 100%;
    order: 1;
  }
`;

const TocContainer = styled.nav<{ $isOpen: boolean }>`
  position: sticky;
  top: ${theme.spacing.xl};

  ${theme.mediaQueries.mobile} {
    position: static;
  }
`;

const TocToggle = styled.button`
  display: none;
  width: 100%;
  padding: ${theme.spacing.m};
  background: ${theme.colors.background.card};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  font-family: ${theme.typography.fontFamily.bold};
  font-size: 14px;
  color: ${theme.colors.text.primary};
  cursor: pointer;
  text-align: left;

  ${theme.mediaQueries.mobile} {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &::after {
    content: '▼';
    font-size: 10px;
    transition: transform 0.2s;
  }

  &[aria-expanded='true']::after {
    transform: rotate(180deg);
  }
`;

const TocList = styled.ul<{ $isOpen: boolean }>`
  list-style: none;
  padding: 0;
  margin: 0;

  ${theme.mediaQueries.mobile} {
    display: ${props => (props.$isOpen ? 'block' : 'none')};
    margin-top: ${theme.spacing.s};
    padding: ${theme.spacing.m};
    background: ${theme.colors.background.card};
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.borderRadius.medium};
  }
`;

const TocTitle = styled.h3`
  font-family: ${theme.typography.fontFamily.bold};
  font-size: 14px;
  color: ${theme.colors.text.muted};
  margin: 0 0 ${theme.spacing.m} 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  ${theme.mediaQueries.mobile} {
    display: none;
  }
`;

const TocLink = styled.button<{ $level: number }>`
  display: block;
  width: 100%;
  padding: ${theme.spacing.xs} 0;
  padding-left: ${props => (props.$level === 3 ? theme.spacing.m : '0')};
  color: ${theme.colors.text.secondary};
  text-decoration: none;
  font-size: 14px;
  line-height: 1.4;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;

  &:hover {
    color: ${theme.colors.brand.secondary};
  }
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

  h3 {
    color: ${theme.colors.text.primary};
    font-family: ${theme.typography.fontFamily.bold};
    font-weight: 700;
    font-size: 17px;
    line-height: 1.4;
    margin: ${theme.spacing.l} 0 ${theme.spacing.s} 0;
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

  img {
    max-width: 100%;
    height: auto;
    border-radius: ${theme.borderRadius.medium};
  }

  pre {
    margin: 0 0 ${theme.spacing.m} 0;
    border-radius: ${theme.borderRadius.medium};
    overflow: auto;
  }

  code {
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 14px;
  }

  /* Inline code */
  p code, li code {
    background: ${theme.colors.background.light};
    padding: 2px 6px;
    border-radius: ${theme.borderRadius.small};
  }
`;

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9äöüß\s-]/g, '')
    .replace(/\s+/g, '-');
}

function extractToc(markdownContent: string): TocItem[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const items: TocItem[] = [];
  let match;

  while ((match = headingRegex.exec(markdownContent)) !== null) {
    const level = match[1].length;
    const text = match[2];
    items.push({
      id: generateSlug(text),
      text,
      level,
    });
  }

  return items;
}

export function MarkdownPage({ content }: MarkdownPageProps) {
  const [tocOpen, setTocOpen] = useState(false);

  const { frontmatter, markdownBody, heroImageUrl, tocItems } = useMemo(() => {
    const { data, content: body } = matter(content);
    const fm = data as Frontmatter;

    let heroUrl: string;
    if (fm.heroImage === 'random' || !fm.heroImage) {
      const index = Math.floor(Math.random() * POOL_IMAGES.length);
      heroUrl = POOL_IMAGES[index];
    } else {
      heroUrl = fm.heroImage;
    }

    const toc = extractToc(body);

    return {
      frontmatter: fm,
      markdownBody: body,
      heroImageUrl: heroUrl,
      tocItems: toc,
    };
  }, [content]);

  const showToc = frontmatter.showToc !== false && tocItems.length > 0;

  return (
    <PageWrapper>
      <HeroContainer>
        <HeroImage $imageUrl={heroImageUrl} />
      </HeroContainer>

      <ContentContainer>
        <BackLink to="/">Zurück zur Startseite</BackLink>
        <Title>{frontmatter.title}</Title>

        <ContentWrapper>
          <MainContent>
            <MarkdownContent>
              <ReactMarkdown
                components={{
                  h2: ({ children }) => {
                    const text = String(children);
                    return <h2 id={generateSlug(text)}>{children}</h2>;
                  },
                  h3: ({ children }) => {
                    const text = String(children);
                    return <h3 id={generateSlug(text)}>{children}</h3>;
                  },
                  code: ({ className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || '');
                    const codeString = String(children).replace(/\n$/, '');

                    if (match) {
                      return (
                        <SyntaxHighlighter
                          language={match[1]}
                          PreTag="div"
                        >
                          {codeString}
                        </SyntaxHighlighter>
                      );
                    }

                    return (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {markdownBody}
              </ReactMarkdown>
            </MarkdownContent>
          </MainContent>

          {showToc && (
            <TocSidebar>
              <TocContainer $isOpen={tocOpen}>
                <TocToggle
                  onClick={() => setTocOpen(!tocOpen)}
                  aria-expanded={tocOpen}
                >
                  Inhalt
                </TocToggle>
                <TocTitle>Inhalt</TocTitle>
                <TocList $isOpen={tocOpen}>
                  {tocItems.map(item => (
                    <li key={item.id}>
                      <TocLink
                        $level={item.level}
                        onClick={() => {
                          const element = document.getElementById(item.id);
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                      >
                        {item.text}
                      </TocLink>
                    </li>
                  ))}
                </TocList>
              </TocContainer>
            </TocSidebar>
          )}
        </ContentWrapper>
      </ContentContainer>

      <Footer />
    </PageWrapper>
  );
}
