import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { MarkdownPipe } from './markdown.pipe';

describe('MarkdownPipe', () => {
  let pipe: MarkdownPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    pipe = new MarkdownPipe(TestBed.inject(DomSanitizer));
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
});