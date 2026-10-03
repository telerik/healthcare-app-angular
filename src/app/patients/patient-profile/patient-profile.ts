import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChipThemeColor, KENDO_BUTTONS } from '@progress/kendo-angular-buttons';
import { KENDO_DIALOG } from '@progress/kendo-angular-dialog';
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
import { Subscription } from 'rxjs';

import {
  LabResult,
  PatientProfile,
  PatientRecommendation,
  RecommendationActionId,
} from '../../data/patients.data';
import { PageHeaderService } from '../../services/page-header.service';
import { PatientsService } from '../../services/patients.service';
import { RecommendationPanelComponent } from './recommendation-panel/recommendation-panel';

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
    KENDO_DIALOG,
    KENDO_ICONS,
    KENDO_INDICATORS,
    KENDO_LAYOUT,
    KENDO_EDITOR,
    KENDO_TOOLBAR,
    KENDO_GRID,
    KENDO_GRID_EXCEL_EXPORT,
    KENDO_PAGER,
    RecommendationPanelComponent,
  ],
})
export class PatientProfileComponent implements OnInit, OnDestroy {
  @ViewChild(GridComponent) private grid!: GridComponent;
  @ViewChild('vitalsCard', { read: ElementRef }) private vitalsCard?: ElementRef<HTMLElement>;

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

  public recommendations: PatientRecommendation[] = [];
  public isVitalsHighlighted = false;
  public isLabDialogOpen = false;

  private vitalsHighlightTimeout?: ReturnType<typeof setTimeout>;
  private routeSub?: Subscription;

  private pageHeaderService = inject(PageHeaderService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private patientsService = inject(PatientsService);

  ngOnInit(): void {
    this.pageHeaderService.title.set('Patients');
    this.pageHeaderService.subtitle.set('');

    // Subscribe to route parameter changes to handle navigation between different patients
    this.routeSub = this.route.paramMap.subscribe((params) => {
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
    clearTimeout(this.vitalsHighlightTimeout);
    this.routeSub?.unsubscribe();
  }

  private loadPatientData(): void {
    // Reset per-patient UI state so nothing leaks across rapid patient switches
    this.isVitalsHighlighted = false;
    this.isLabDialogOpen = false;

    const patientData = this.patientsService.getPatientById(this.patientId);
    if (patientData) {
      this.patient = patientData;
      this.labResults = patientData.labResults;
      this.recommendations = this.patientsService.getRecommendations(this.patientId);
    } else {
      // Patient not found, navigate back to patients list
      this.recommendations = [];
      this.router.navigate(['/patients']);
    }
  }

  public onRecommendationAction(actionId: RecommendationActionId): void {
    switch (actionId) {
      case 'review-vitals':
        this.focusVitals();
        break;
      case 'request-lab':
        this.isLabDialogOpen = true;
        break;
      case 'schedule-follow-up':
        this.router.navigate(['/schedule'], {
          queryParams: { patientId: this.patientId, patientName: this.patient?.name },
        });
        break;
    }
  }

  public closeLabDialog(): void {
    this.isLabDialogOpen = false;
  }

  private focusVitals(): void {
    const element = this.vitalsCard?.nativeElement;
    if (!element) {
      return;
    }
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // preventScroll avoids focus() cancelling/jump-cutting the smooth scroll above
    element.focus({ preventScroll: true });
    this.isVitalsHighlighted = true;
    clearTimeout(this.vitalsHighlightTimeout);
    this.vitalsHighlightTimeout = setTimeout(() => (this.isVitalsHighlighted = false), 2000);
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

  public exportToExcel(): void {
    this.grid.saveAsExcel();
  }

  public allData = (): ExcelExportData => {
    return {
      data: this.labResults,
    };
  };
}
