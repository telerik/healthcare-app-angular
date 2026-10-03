import { TestBed } from '@angular/core/testing';
import { PatientRecommendation } from '../../../data/patients.data';
import { RecommendationPanelComponent } from './recommendation-panel';

describe('RecommendationPanelComponent', () => {
  const recommendations: PatientRecommendation[] = [
    {
      id: 'review-vitals',
      label: 'Review vitals',
      reason: 'One or more recent vitals are outside the expected range.',
      urgency: 'high',
    },
    {
      id: 'request-lab',
      label: 'Request lab',
      reason: 'No flagged lab results; consider routine testing.',
      urgency: 'normal',
    },
    {
      id: 'schedule-follow-up',
      label: 'Schedule follow-up',
      reason: 'Consider a routine follow-up appointment.',
      urgency: 'normal',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecommendationPanelComponent],
    }).compileComponents();
  });

  it('renders nothing when recommendations are empty', () => {
    const fixture = TestBed.createComponent(RecommendationPanelComponent);
    fixture.componentInstance.recommendations = [];
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.recommendation-card')).toBeNull();
  });

  it('renders one button per recommendation with its label', () => {
    const fixture = TestBed.createComponent(RecommendationPanelComponent);
    fixture.componentInstance.recommendations = recommendations;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const buttons = compiled.querySelectorAll('.recommendation-item button');

    expect(buttons.length).toBe(recommendations.length);
    expect(Array.from(buttons).map((b) => b.textContent?.trim())).toEqual(
      recommendations.map((r) => r.label),
    );
  });

  it('exposes an accessible region', () => {
    const fixture = TestBed.createComponent(RecommendationPanelComponent);
    fixture.componentInstance.recommendations = recommendations;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const region = compiled.querySelector('[role="region"]');

    expect(region).toBeTruthy();
    expect(region?.getAttribute('aria-label')).toBe('Recommended next actions');
  });

  it('emits actionSelected with the action id on click', () => {
    const fixture = TestBed.createComponent(RecommendationPanelComponent);
    fixture.componentInstance.recommendations = recommendations;
    fixture.detectChanges();

    const emitted: string[] = [];
    fixture.componentInstance.actionSelected.subscribe((id) => emitted.push(id));

    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('[data-action-id="request-lab"]') as HTMLButtonElement;
    button.click();

    expect(emitted).toEqual(['request-lab']);
  });

  it('shows the no-urgent-actions message when all urgencies are normal', () => {
    const fixture = TestBed.createComponent(RecommendationPanelComponent);
    fixture.componentInstance.recommendations = recommendations.map((r) => ({
      ...r,
      urgency: 'normal',
    }));
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.recommendation-subtitle')?.textContent).toContain(
      'No urgent actions — routine follow-up only.',
    );
  });

  it('renders native buttons so they are keyboard focusable', () => {
    const fixture = TestBed.createComponent(RecommendationPanelComponent);
    fixture.componentInstance.recommendations = recommendations;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const buttons = compiled.querySelectorAll('.recommendation-item button');

    expect(buttons.length).toBeGreaterThan(0);
    buttons.forEach((button) => {
      expect(button.tagName).toBe('BUTTON');
      expect((button as HTMLButtonElement).disabled).toBe(false);
    });
  });
});
