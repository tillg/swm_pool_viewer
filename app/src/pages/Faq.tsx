import { MarkdownPage } from '../components/MarkdownPage';
import faqContent from '../content/faq.md';

export function Faq() {
  return <MarkdownPage content={faqContent} />;
}
