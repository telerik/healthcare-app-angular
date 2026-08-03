import { TestBed } from '@angular/core/testing';
import { marked } from 'marked';
import { vi } from 'vitest';
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

  it('should configure marked with correct options', () => {
    const setOptionsSpy = vi.spyOn(marked, 'setOptions');

    TestBed.runInInjectionContext(() => new MarkdownPipe());

    expect(setOptionsSpy).toHaveBeenCalledWith({
      breaks: true,
      gfm: true,
    });

    setOptionsSpy.mockRestore();
  });

  it('should call configuration during instantiation', () => {
    const setOptionsSpy = vi.spyOn(marked, 'setOptions');

    TestBed.runInInjectionContext(() => new MarkdownPipe());

    expect(setOptionsSpy).toHaveBeenCalledTimes(1);

    setOptionsSpy.mockRestore();
  });
});
