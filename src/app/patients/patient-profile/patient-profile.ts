import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
  inject,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChipThemeColor, KENDO_BUTTONS } from '@progress/kendo-angular-buttons';
import { EditorCssSettings, KENDO_EDITOR } from '@progress/kendo-angular-editor';
import { ExcelExportData } from '@progress/kendo-angular-excel-export';
import { GridComponent, KENDO_GRID, KENDO_GRID_EXCEL_EXPORT } from '@progress/kendo-angular-grid';
import { KENDO_ICONS } from '@progress/kendo-angular-icons';
import { KENDO_INDICATORS } from '@progress/kendo-angular-indicators';
import { KENDO_LAYOUT } from '@progress/kendo-angular-layout';
import { BreadCrumbItem, KENDO_BREADCRUMB } from '@progress/kendo-angular-navigation';
import { KENDO_PAGER } from '@progress/kendo-angular-pager';
import { KENDO_TOOLBAR } from '@progress/kendo-angular-toolbar';

import { SortDescriptor } from '@progress/kendo-data-query';
import {
  calendarIcon,
  clipboardIcon,
  downloadIcon,
  eyeIcon,
  homeIcon,
  sparklesIcon,
  SVGIcon,
  userIcon,
} from '@progress/kendo-svg-icons';

import { LabResult, PatientProfile } from '../../data/patients.data';
import { LabRequestPatient, LabTestRequest } from '../../data/lab-tests.data';
import { PageHeaderService } from '../../services/page-header.service';
import { PatientsService } from '../../services/patients.service';
import { LabTestRequestDialogComponent } from '../../shared/lab-test-request-dialog/lab-test-request-dialog';

@Component({
  selector: 'app-patient-profile',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './patient-profile.html',
  styleUrls: ['./patient-profile.css'],
  imports: [
    CommonModule,
    KENDO_BREADCRUMB,
    KENDO_BUTTONS,
    KENDO_ICONS,
    KENDO_INDICATORS,
    KENDO_LAYOUT,
    KENDO_EDITOR,
    KENDO_TOOLBAR,
    KENDO_GRID,
    KENDO_GRID_EXCEL_EXPORT,
    KENDO_PAGER,
    LabTestRequestDialogComponent,
  ],
})
export class PatientProfileComponent implements OnInit, OnDestroy {
  @ViewChild(GridComponent) private grid!: GridComponent;

  public downloadIcon: SVGIcon = downloadIcon;
  public sparklesIcon: SVGIcon = sparklesIcon;
  public calendarIcon: SVGIcon = calendarIcon;
  public clipboardIcon: SVGIcon = clipboardIcon;
  public eyeIcon: SVGIcon = eyeIcon;

  public editorIframeCss: EditorCssSettings = {
    path: 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap',
    content: `.k-content {
        font-family: 'Poppins', sans-serif;
        font-size: 16px;
    }`,
  };

  public getPatientStatusColor(status: string): ChipThemeColor {
    const colorMap: Record<string, ChipThemeColor> = {
      Stable: 'success',
      Monitoring: 'warning',
      Critical: 'error',
    };
    return colorMap[status] ?? 'base';
  }

  public breadcrumbItems: BreadCrumbItem[] = [
    { text: 'Patients', svgIcon: homeIcon, title: 'Patients' },
    { text: 'Patient Profile', svgIcon: userIcon, title: 'Patient Profile' },
  ];

  public patientId = 0;
  public patient: PatientProfile | null = null;
  public labResults: LabResult[] = [];
  public labResultsSort: SortDescriptor[] = [{ field: 'testName', dir: 'asc' }];
  public labTestDialogOpened = false;
  public labRequestPatients: readonly LabRequestPatient[] = [];
  public vitalsCard = viewChild<ElementRef<HTMLElement>>('vitalsCard');

  private pageHeaderService = inject(PageHeaderService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private patientsService = inject(PatientsService);

  ngOnInit(): void {
    this.pageHeaderService.title.set('Patients');
    this.pageHeaderService.subtitle.set('');

    // Subscribe to route parameter changes to handle navigation between different patients
    this.route.paramMap.subscribe((params) => {
      this.patient = null;
      this.labResults = [];
      this.labRequestPatients = [];
      this.labTestDialogOpened = false;

      const patientId = Number(params.get('id'));
      if (!Number.isInteger(patientId) || patientId <= 0) {
        this.router.navigate(['/patients']);
        return;
      }

      this.patientId = patientId;
      this.loadPatientData();
    });
  }

  ngOnDestroy(): void {
    this.pageHeaderService.title.set('');
    this.pageHeaderService.subtitle.set('');
  }

  private loadPatientData(): void {
    const patientData = this.patientsService.getPatientById(this.patientId);
    if (patientData) {
      this.patient = patientData;
      this.labResults = patientData.labResults;
      this.labRequestPatients = [
        {
          id: patientData.id,
          name: patientData.name,
          identifier: patientData.patientCode,
        },
      ];
    } else {
      // Patient not found, navigate back to patients list
      this.router.navigate(['/patients']);
    }
  }

  public navigateToPatients(): void {
    this.router.navigate(['/patients']);
  }

  public onBreadcrumbItemClick(item: BreadCrumbItem): void {
    if (item.text === 'Patients') {
      this.navigateToPatients();
    }
  }

  public saveNotes(): void {
    console.log('Saving patient notes...');
    // In a real app, save to backend service
  }

  public reviewVitals(): void {
    const vitalsCard = this.vitalsCard();
    if (!vitalsCard) {
      throw new Error('Recent Vitals card is unavailable');
    }

    vitalsCard.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    vitalsCard.nativeElement.focus();
  }

  public openLabTestDialog(): void {
    if (!this.patient) {
      throw new Error('Cannot request labs without a loaded patient');
    }

    this.labTestDialogOpened = true;
  }

  public closeLabTestDialog(): void {
    this.labTestDialogOpened = false;
  }

  public handleLabTestRequest(_request: LabTestRequest): void {
    void _request;
    this.closeLabTestDialog();
  }

  public scheduleFollowUp(): void {
    if (!this.patient) {
      throw new Error('Cannot schedule follow-up without a loaded patient');
    }

    this.router.navigate(['/schedule'], {
      queryParams: { intent: 'follow-up', patientId: this.patient.id },
    });
  }

  public exportToExcel(): void {
    this.grid.saveAsExcel();
  }

  public allData = (): ExcelExportData => {
    return {
      data: this.labResults,
    };
  };
}
