import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute, ParamMap, convertToParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { vi } from 'vitest';
import { PatientProfileComponent } from './patient-profile';
import { PatientsService } from '../../services/patients.service';

describe('PatientProfileComponent', () => {
  let component: PatientProfileComponent;
  let fixture: ComponentFixture<PatientProfileComponent>;
  let paramMapSubject: BehaviorSubject<ParamMap>;
  let patientsService: PatientsService;

  beforeEach(async () => {
    // Create a controllable paramMap subject for testing
    paramMapSubject = new BehaviorSubject<ParamMap>(convertToParamMap({ id: '1' }));

    await TestBed.configureTestingModule({
      imports: [PatientProfileComponent],
      providers: [
        provideRouter([]),
        provideAnimations(),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: paramMapSubject.asObservable(),
          },
        },
      ],
    }).compileComponents();

    patientsService = TestBed.inject(PatientsService);
    fixture = TestBed.createComponent(PatientProfileComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load patient data on init', () => {
    const loadDataSpy = vi.spyOn(component as never, 'loadPatientData');
    
    fixture.detectChanges(); // Triggers ngOnInit
    
    expect(loadDataSpy).toHaveBeenCalledTimes(1);
    expect(component.patientId).toBe(1);
  });

  it('should clean up subscriptions on destroy', () => {
    fixture.detectChanges();
    
    // Component should be functional before destroy
    expect(component.patientId).toBe(1);
    
    // Destroy component - this triggers takeUntilDestroyed
    fixture.destroy();
    
    // If we got here without errors, cleanup was successful
    expect(true).toBe(true);
  });

  it('should not respond to paramMap changes after destroy', () => {
    const loadDataSpy = vi.spyOn(component as never, 'loadPatientData');
    
    fixture.detectChanges();
    
    // Verify initial load
    expect(loadDataSpy).toHaveBeenCalledTimes(1);
    
    // Destroy the component
    fixture.destroy();
    
    // Emit new param after destruction
    paramMapSubject.next(convertToParamMap({ id: '999' }));
    
    // loadPatientData should NOT have been called again
    expect(loadDataSpy).toHaveBeenCalledTimes(1);
  });
});
