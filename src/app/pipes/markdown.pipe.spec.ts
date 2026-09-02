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

  it('should apply the configured breaks option by converting newlines to <br>', () => {
    const html = pipe.transform('line one\nline two') as string;

    expect(html).toContain('line one');
    expect(html).toContain('<br>');
    expect(html).toContain('line two');
  });

  it('should apply the configured gfm option for strikethrough and autolinks', () => {
    const html = pipe.transform('~~gone~~ and https://example.com') as string;

    expect(html).toContain('<del>gone</del>');
    expect(html).toContain('<a href="https://example.com">');
  });

  it('should apply the configured gfm option for tables', () => {
    const html = pipe.transform('| a | b |\n| --- | --- |\n| 1 | 2 |') as string;

    expect(html).toContain('<table>');
    expect(html).toContain('<th>a</th>');
    expect(html).toContain('<td>1</td>');
  });
});
