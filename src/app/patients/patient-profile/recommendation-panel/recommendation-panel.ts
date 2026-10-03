import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { KENDO_BUTTONS } from '@progress/kendo-angular-buttons';
import { KENDO_ICONS } from '@progress/kendo-angular-icons';
import { KENDO_LAYOUT } from '@progress/kendo-angular-layout';
import { sparklesIcon, SVGIcon } from '@progress/kendo-svg-icons';

import { PatientRecommendation, RecommendationActionId } from '../../../data/patients.data';

@Component({
  selector: 'app-recommendation-panel',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './recommendation-panel.html',
  styleUrls: ['./recommendation-panel.css'],
  imports: [CommonModule, KENDO_BUTTONS, KENDO_ICONS, KENDO_LAYOUT],
})
export class RecommendationPanelComponent {
  @Input() recommendations: PatientRecommendation[] = [];
  @Output() actionSelected = new EventEmitter<RecommendationActionId>();

  public sparklesIcon: SVGIcon = sparklesIcon;

  public get hasUrgentActions(): boolean {
    return this.recommendations.some((recommendation) => recommendation.urgency === 'high');
  }

  public onActionClick(id: RecommendationActionId): void {
    this.actionSelected.emit(id);
  }

  public trackById = (_: number, item: PatientRecommendation): RecommendationActionId => item.id;
}
