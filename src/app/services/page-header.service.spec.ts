import { TestBed } from '@angular/core/testing';
import { PageHeaderService } from './page-header.service';

describe('PageHeaderService', () => {
  let service: PageHeaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PageHeaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should update title and subtitle signals', () => {
    service.title.set('Dummy Title');
    service.subtitle.set('Dummy Subtitle');

    expect(service.title()).toBe('Dummy Title');
    expect(service.subtitle()).toBe('Dummy Subtitle');
  });

  it('should keep actions null by default', () => {
    expect(service.actions()).toBeNull();
  });
});
