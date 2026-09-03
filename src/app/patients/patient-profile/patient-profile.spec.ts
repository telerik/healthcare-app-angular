import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Observable } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PatientProfileComponent } from './patient-profile';
import { PatientsService } from '../../services/patients.service';
import { PatientProfile } from '../../data/patients.data';
import { PageHeaderService } from '../../services/page-header.service';

describe('PatientProfileComponent', () => {
  let component: PatientProfileComponent;
  let fixture: ComponentFixture<PatientProfileComponent>;
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };
  let mockPatientsService: { getPatientById: ReturnType<typeof vi.fn> };
  let mockPageHeaderService: { title: { set: ReturnType<typeof vi.fn> }; subtitle: { set: ReturnType<typeof vi.fn> } };
  let mockActivatedRoute: { paramMap: Observable<Map<string, string>> };

  beforeEach(() => {
    mockRouter = { navigate: vi.fn() };
    mockPatientsService = { getPatientById: vi.fn() };
    mockPageHeaderService = {
      title: { set: vi.fn() },
      subtitle: { set: vi.fn() },
    };
    mockActivatedRoute = {
      paramMap: of(new Map<string, string>()),
    };

    TestBed.configureTestingModule({
      imports: [PatientProfileComponent],
      providers: [
        { provide: Router, useValue: mockRouter as unknown as Router },
        { provide: PatientsService, useValue: mockPatientsService as unknown as PatientsService },
        { provide: PageHeaderService, useValue: mockPageHeaderService as unknown as PageHeaderService },
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
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
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
    } as unknown as PatientProfile;

    mockPatientsService.getPatientById.mockReturnValue(mockPatient);
    component.patientId = 1;
    component['loadPatientData']();

    expect(mockPatientsService.getPatientById).toHaveBeenCalledWith(1);
    expect(component.patient).toEqual(mockPatient);
  });

  it('should navigate to /patients when patient not found', () => {
    mockPatientsService.getPatientById.mockReturnValue(null);
    component.patientId = 999;
    component['loadPatientData']();

    expect(mockPatientsService.getPatientById).toHaveBeenCalledWith(999);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/patients']);
  });
});
