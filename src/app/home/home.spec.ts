import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { HomeComponent } from './home';
import { LabTestRequestDialogComponent } from '../shared/lab-test-request-dialog/lab-test-request-dialog';

describe('HomeComponent lab test workflow', () => {
  let fixture: ComponentFixture<HomeComponent>;
  let component: HomeComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [provideAnimations(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function getDialog(): LabTestRequestDialogComponent {
    return fixture.debugElement.query(By.directive(LabTestRequestDialogComponent)).componentInstance;
  }

  function openDialog(): void {
    const action = fixture.nativeElement.querySelector(
      'button[aria-label="Request lab test"]',
    ) as HTMLButtonElement;
    action.click();
    fixture.detectChanges();
  }

  it('renders the shared lab dialog from the existing Request lab test action', () => {
    openDialog();

    expect(getDialog()).toBeTruthy();
    expect(getDialog().patients()).toEqual(component.labRequestPatients);
  });

  it('removes the shared dialog when cancelled', () => {
    openDialog();

    getDialog().cancelled.emit();
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.directive(LabTestRequestDialogComponent))).toBeNull();
  });

  it('removes the shared dialog after a request is submitted', () => {
    openDialog();

    getDialog().requestSubmitted.emit({ patientId: component.labTestPatientId, testIds: [2] });
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.directive(LabTestRequestDialogComponent))).toBeNull();
  });
});
