export function replacePlaceholders(
  template: string,
  context: { [key: string]: string }
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => context[key] || '');
}
