import { Component, HostListener, OnInit, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KENDO_BUTTONS } from '@progress/kendo-angular-buttons';
import { KENDO_DIALOG } from '@progress/kendo-angular-dialog';
import { KENDO_DROPDOWNS } from '@progress/kendo-angular-dropdowns';
import { KENDO_INPUTS } from '@progress/kendo-angular-inputs';
import { KENDO_LABELS } from '@progress/kendo-angular-label';
import {
  LAB_TEST_OPTIONS,
  LabRequestPatient,
  LabTestRequest,
} from '../../data/lab-tests.data';

@Component({
  selector: 'app-lab-test-request-dialog',
  imports: [
    FormsModule,
    KENDO_BUTTONS,
    KENDO_DIALOG,
    KENDO_DROPDOWNS,
    KENDO_INPUTS,
    KENDO_LABELS,
  ],
  templateUrl: './lab-test-request-dialog.html',
  styleUrl: './lab-test-request-dialog.css',
})
export class LabTestRequestDialogComponent implements OnInit {
  public patients = input.required<readonly LabRequestPatient[]>();
  public initialPatientId = input.required<number>();
  public cancelled = output<void>();
  public requestSubmitted = output<LabTestRequest>();

  public searchQuery = '';
  public selectedPatientId = 0;
  public selectedTestIds = new Set<number>();
  public dialogWidth = this.getDialogWidth();
  public dialogHeight = this.getDialogHeight();

  public get filteredLabTests() {
    const query = this.searchQuery.trim().toLowerCase();
    return query
      ? LAB_TEST_OPTIONS.filter((test) => test.name.toLowerCase().includes(query))
      : LAB_TEST_OPTIONS;
  }

  public ngOnInit(): void {
    const patients = this.patients();
    if (patients.length === 0) {
      throw new Error('LabTestRequestDialogComponent requires at least one patient');
    }

    this.selectedPatientId = patients.some((patient) => patient.id === this.initialPatientId())
      ? this.initialPatientId()
      : patients[0].id;
    this.selectedTestIds = new Set(
      LAB_TEST_OPTIONS.filter((test) => test.defaultSelected).map((test) => test.id),
    );
  }

  @HostListener('window:resize')
  public onResize(): void {
    this.dialogWidth = this.getDialogWidth();
    this.dialogHeight = this.getDialogHeight();
  }

  public isTestSelected(testId: number): boolean {
    return this.selectedTestIds.has(testId);
  }

  public toggleLabTest(testId: number): void {
    const selectedTestIds = new Set(this.selectedTestIds);
    if (selectedTestIds.has(testId)) {
      selectedTestIds.delete(testId);
    } else {
      selectedTestIds.add(testId);
    }
    this.selectedTestIds = selectedTestIds;
  }

  public cancel(): void {
    this.cancelled.emit();
  }

  public submit(): void {
    this.requestSubmitted.emit({
      patientId: this.selectedPatientId,
      testIds: [...this.selectedTestIds].sort((first, second) => first - second),
    });
  }

  private getDialogWidth(): number {
    return window.innerWidth < 1000 ? Math.min(690, window.innerWidth - 32) : 690;
  }

  private getDialogHeight(): number {
    return window.innerWidth < 1000 ? Math.min(580, window.innerHeight - 32) : 580;
  }
}
