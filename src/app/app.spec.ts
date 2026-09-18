import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  const originalHash = window.location.hash;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  afterEach(() => {
    window.location.hash = originalHash;
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it.each([
    ['#/', 0],
    ['#/schedule', 1],
    ['#/patients', 2],
    ['#/analytics', 3],
  ])('should initialize selected nav from %s', (hash, expectedIndex) => {
    window.location.hash = hash;

    const fixture = TestBed.createComponent(App);

    expect(fixture.componentInstance.selectedNavIndex).toBe(expectedIndex);
  });

  it('should render app shell', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('kendo-appbar')).toBeTruthy();
  });
});
