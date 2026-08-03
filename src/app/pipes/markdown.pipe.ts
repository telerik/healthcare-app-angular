import { inject, Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Marked } from 'marked';

@Pipe({
  name: 'markdown',
  standalone: true,
})
export class MarkdownPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);

  // Create a local instance with options instead of modifying global state
  private readonly marked = new Marked({
    breaks: true,
    gfm: true,
  });

  transform(value: string | undefined): SafeHtml {
    if (!value) {
      return '';
    }

    try {
      const html = this.marked.parse(value);
      return this.sanitizer.sanitize(SecurityContext.HTML, html) || '';
    } catch (error) {
      console.error('Markdown parsing error:', error);
      return value;
    }
  }
}
