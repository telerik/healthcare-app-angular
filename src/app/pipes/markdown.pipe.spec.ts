import { TestBed } from '@angular/core/testing';
import { marked } from 'marked';
import { vi } from 'vitest';
import { MarkdownPipe } from './markdown.pipe';

describe('MarkdownPipe', () => {
  let pipe: MarkdownPipe;
  let setOptionsSpy: any;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    setOptionsSpy = vi.spyOn(marked, 'setOptions').mockImplementation(() => {});
  });

  afterEach(() => {
    setOptionsSpy?.mockRestore();
  });

  it('should create an instance', () => {
    pipe = TestBed.runInInjectionContext(() => new MarkdownPipe());
    expect(pipe).toBeTruthy();
  });

  it('should return empty string for empty input', () => {
    pipe = TestBed.runInInjectionContext(() => new MarkdownPipe());
    expect(pipe.transform(undefined)).toBe('');
    expect(pipe.transform('')).toBe('');
  });

  it('should transform markdown to html', () => {
    pipe = TestBed.runInInjectionContext(() => new MarkdownPipe());
    const html = pipe.transform('**Dummy** _markdown_ text') as string;

    expect(html).toContain('<strong>Dummy</strong>');
    expect(html).toContain('<em>markdown</em>');
  });

  it('should configure marked with correct options', () => {
    TestBed.runInInjectionContext(() => new MarkdownPipe());

    expect(setOptionsSpy).toHaveBeenCalledWith({
      breaks: true,
      gfm: true,
    });
  });

  it('should call configuration during instantiation', () => {
    TestBed.runInInjectionContext(() => new MarkdownPipe());

    expect(setOptionsSpy).toHaveBeenCalledTimes(1);
  });
});
