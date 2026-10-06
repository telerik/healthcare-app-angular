import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation, inject } from '@angular/core';
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
import { downloadIcon, homeIcon, sparklesIcon, SVGIcon, userIcon } from '@progress/kendo-svg-icons';

import { LabResult, PatientProfile } from '../../data/patients.data';
import { PageHeaderService } from '../../services/page-header.service';
import { PatientsService } from '../../services/patients.service';

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
  ],
})
export class PatientProfileComponent implements OnInit, OnDestroy {
  @ViewChild(GridComponent) private grid!: GridComponent;

  public downloadIcon: SVGIcon = downloadIcon;
  public sparklesIcon: SVGIcon = sparklesIcon;

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
  public patientNoteContent = '';
  public saveNotesStatus: 'success' | 'error' | null = null;
  private saveNotesStatusTimeoutId: ReturnType<typeof setTimeout> | undefined;

  private pageHeaderService = inject(PageHeaderService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private patientsService = inject(PatientsService);

  ngOnInit(): void {
    this.pageHeaderService.title.set('Patients');
    this.pageHeaderService.subtitle.set('');

    // Subscribe to route parameter changes to handle navigation between different patients
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.patientId = parseInt(id, 10);
        this.loadPatientData();
      }
    });
  }

  ngOnDestroy(): void {
    this.pageHeaderService.title.set('');
    this.pageHeaderService.subtitle.set('');

    if (this.saveNotesStatusTimeoutId !== undefined) {
      clearTimeout(this.saveNotesStatusTimeoutId);
    }
  }

  private loadPatientData(): void {
    const patientData = this.patientsService.getPatientById(this.patientId);
    if (patientData) {
      this.patient = patientData;
      this.labResults = patientData.labResults;
      this.patientNoteContent = patientData.notes ?? '';
      this.saveNotesStatus = null;
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
    const success = this.patientsService.updatePatientNotes(this.patientId, this.patientNoteContent);
    this.saveNotesStatus = success ? 'success' : 'error';

    if (this.saveNotesStatusTimeoutId !== undefined) {
      clearTimeout(this.saveNotesStatusTimeoutId);
    }
    this.saveNotesStatusTimeoutId = setTimeout(() => {
      this.saveNotesStatus = null;
      this.saveNotesStatusTimeoutId = undefined;
    }, 4000);
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
