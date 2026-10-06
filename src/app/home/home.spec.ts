import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { HomeComponent } from './home';

describe('HomeComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [provideRouter([]), provideNoopAnimations()],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should load todays appointments on init', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(Array.isArray(component.appointments)).toBe(true);
    expect(component.appointments.length).toBeGreaterThan(0);
  });

  it("should pin Isabella Rossi's upcoming appointment to the top of the grid", () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.pinnedTopAppointments.length).toBe(1);
    expect(component.pinnedTopAppointments[0]).toEqual(
      expect.objectContaining({
        patientName: 'Isabella Rossi',
        status: 'Upcoming',
      }),
    );
  });

  it('should only include the pinned appointment among the appointments it is pinning from', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.pinnedTopAppointments.forEach((pinned) => {
      expect(component.appointments).toContainEqual(pinned);
    });
  });

  it('should render the appointments grid with top pinning enabled', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const grid = compiled.querySelector('kendo-grid');
    expect(grid).toBeTruthy();
  });
});
