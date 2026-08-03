import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { PatientProfileComponent } from './patient-profile';
import { PatientsService } from '../../services/patients.service';
import { PageHeaderService } from '../../services/page-header.service';

describe('PatientProfileComponent', () => {
  let component: PatientProfileComponent;
  let fixture: ComponentFixture<PatientProfileComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockPatientsService: jasmine.SpyObj<PatientsService>;
  let mockPageHeaderService: jasmine.SpyObj<PageHeaderService>;
  let mockActivatedRoute: any;

  beforeEach(() => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockPatientsService = jasmine.createSpyObj('PatientsService', ['getPatientById']);
    mockPageHeaderService = {
      title: { set: jasmine.createSpy('set') },
      subtitle: { set: jasmine.createSpy('set') },
    } as any;
    mockActivatedRoute = {
      paramMap: of(new Map()),
    };

    TestBed.configureTestingModule({
      imports: [PatientProfileComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: PatientsService, useValue: mockPatientsService },
        { provide: PageHeaderService, useValue: mockPageHeaderService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    });

    fixture = TestBed.createComponent(PatientProfileComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to /patients when patientId is NaN', () => {
    const consoleErrorSpy = spyOn(console, 'error');
    component.patientId = NaN;
    component['loadPatientData']();

    expect(consoleErrorSpy).toHaveBeenCalledWith('Invalid patient ID: NaN');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/patients']);
    expect(mockPatientsService.getPatientById).not.toHaveBeenCalled();
  });

  it('should not call service when patientId is NaN from invalid route param', () => {
    component.patientId = parseInt('abc', 10); // Results in NaN
    component['loadPatientData']();

    expect(mockPatientsService.getPatientById).not.toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/patients']);
  });

  it('should call service when patientId is valid', () => {
    const mockPatient = {
      id: 1,
      name: 'Test Patient',
      labResults: [],
    } as any;

    mockPatientsService.getPatientById.and.returnValue(mockPatient);
    component.patientId = 1;
    component['loadPatientData']();

    expect(mockPatientsService.getPatientById).toHaveBeenCalledWith(1);
    expect(component.patient).toEqual(mockPatient);
  });

  it('should navigate to /patients when patient not found', () => {
    mockPatientsService.getPatientById.and.returnValue(null);
    component.patientId = 999;
    component['loadPatientData']();

    expect(mockPatientsService.getPatientById).toHaveBeenCalledWith(999);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/patients']);
  });
});
