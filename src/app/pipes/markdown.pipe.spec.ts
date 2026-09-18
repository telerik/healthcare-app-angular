import { TestBed } from '@angular/core/testing';
import { MarkdownPipe } from './markdown.pipe';

describe('MarkdownPipe', () => {
  let pipe: MarkdownPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    pipe = TestBed.runInInjectionContext(() => new MarkdownPipe());
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return empty string for empty input', () => {
    expect(pipe.transform(undefined)).toBe('');
    expect(pipe.transform('')).toBe('');
  });

  it('should transform markdown to html', () => {
    const html = pipe.transform('**Dummy** _markdown_ text') as string;

    expect(html).toContain('<strong>Dummy</strong>');
    expect(html).toContain('<em>markdown</em>');
  });

  it('should handle markdown with line breaks', () => {
    const html = pipe.transform('Line 1\nLine 2') as string;

    // With breaks: true, single line breaks should be converted to <br>
    expect(html).toContain('Line 1');
    expect(html).toContain('Line 2');
  });

  it('should support GitHub Flavored Markdown', () => {
    // Test GFM feature like strikethrough
    const html = pipe.transform('~~strikethrough~~') as string;

    expect(html).toContain('del');
  });
});
