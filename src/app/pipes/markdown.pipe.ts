import { inject, Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';

@Pipe({
  name: 'markdown',
  standalone: true,
})
export class MarkdownPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);

  constructor() {
    this.configureMarkedOptions();
  }

  private configureMarkedOptions(): void {
    marked.setOptions({
      breaks: true,
      gfm: true,
    });
  }

  transform(value: string | undefined): SafeHtml {
    if (!value) {
      return '';
    }

    try {
      const html = marked.parse(value);
      return this.sanitizer.sanitize(SecurityContext.HTML, html) || '';
    } catch (error) {
      console.error('Markdown parsing error:', error);
      return value;
    }
  }
}
