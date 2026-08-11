import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { PatientsService } from '../services/patients.service';
import { ScheduleComponent } from './schedule';

describe('ScheduleComponent follow-up context', () => {
  let fixture: ComponentFixture<ScheduleComponent>;
  let component: ScheduleComponent;
  let queryParams: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let patientsService: PatientsService;

  beforeEach(async () => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn().mockReturnValue({
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        matches: false,
      }),
    });
    queryParams = new BehaviorSubject(convertToParamMap({}));
    await TestBed.configureTestingModule({
      imports: [ScheduleComponent],
      providers: [
        provideAnimations(),
        { provide: ActivatedRoute, useValue: { queryParamMap: queryParams } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ScheduleComponent);
    component = fixture.componentInstance;
    patientsService = TestBed.inject(PatientsService);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('does not show context on direct Schedule navigation', () => {
    expect(component.followUpPatient).toBeNull();
    expect(fixture.nativeElement.querySelector('.follow-up-context-card')).toBeNull();
  });

  it('renders resolved identity and no-booking guidance for a valid follow-up', async () => {
    const patient = patientsService.getAllPatients()[0];
    queryParams.next(convertToParamMap({ intent: 'follow-up', patientId: String(patient.id) }));
    fixture.destroy();
    fixture = TestBed.createComponent(ScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.followUpPatient?.id).toBe(patient.id);
    expect(fixture.nativeElement.textContent).toContain(patient.name);
    expect(fixture.nativeElement.textContent).toContain('No appointment has been booked');
  });

  it.each([
    {},
    { patientId: '1' },
    { intent: 'follow-up', patientId: 'invalid' },
    { intent: 'follow-up', patientId: '0' },
    { intent: 'follow-up', patientId: '9999' },
  ])('omits context for invalid handoff parameters %#', (params) => {
    queryParams.next(convertToParamMap(params));
    fixture.detectChanges();

    expect(component.followUpPatient).toBeNull();
    expect(fixture.nativeElement.querySelector('.follow-up-context-card')).toBeNull();
  });

  it('replaces then clears context as the query parameters change', () => {
    const [firstPatient, secondPatient] = patientsService.getAllPatients();
    queryParams.next(convertToParamMap({ intent: 'follow-up', patientId: String(firstPatient.id) }));
    expect(component.followUpPatient?.id).toBe(firstPatient.id);

    queryParams.next(convertToParamMap({ intent: 'follow-up', patientId: String(secondPatient.id) }));
    expect(component.followUpPatient?.id).toBe(secondPatient.id);

    queryParams.next(convertToParamMap({ intent: 'other', patientId: String(secondPatient.id) }));
    expect(component.followUpPatient).toBeNull();
  });
});
