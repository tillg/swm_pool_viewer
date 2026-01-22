import { MarkdownPage } from '../components/MarkdownPage';
import todoContent from '../content/todo.md';

export function Todo() {
  return <MarkdownPage content={todoContent} />;
}
