import { MarkdownPage } from '../components/MarkdownPage';
import impressumContent from '../content/impressum.md';

export function Impressum() {
  return <MarkdownPage content={impressumContent} />;
}
