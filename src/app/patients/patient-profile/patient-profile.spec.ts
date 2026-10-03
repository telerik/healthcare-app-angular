import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { BehaviorSubject } from 'rxjs';

import { RecommendationActionId } from '../../data/patients.data';
import { PatientProfileComponent } from './patient-profile';

describe('PatientProfileComponent', () => {
  let navigate: ReturnType<typeof vi.fn>;
  let paramMap$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;

  const setRouteId = (id: string | null) => {
    paramMap$.next(convertToParamMap(id ? { id } : {}));
  };

  beforeEach(() => {
    navigate = vi.fn();
    paramMap$ = new BehaviorSubject(convertToParamMap({ id: '1' }));

    TestBed.configureTestingModule({
      imports: [PatientProfileComponent],
      providers: [
        provideNoopAnimations(),
        { provide: Router, useValue: { navigate } },
        { provide: ActivatedRoute, useValue: { paramMap: paramMap$ } },
      ],
    });
  });

  const createComponent = () => {
    const fixture = TestBed.createComponent(PatientProfileComponent);
    return { fixture, component: fixture.componentInstance };
  };

  it('loads the patient and derives recommendations for a valid patient id', () => {
    const { component } = createComponent();
    component.ngOnInit();

    expect(component.patient?.id).toBe(1);
    expect(component.recommendations.map((r) => r.id)).toEqual([
      'review-vitals',
      'request-lab',
      'schedule-follow-up',
    ]);
  });

  it('clears recommendations and navigates to /patients for an unknown patient id', () => {
    setRouteId('999999');
    const { component } = createComponent();
    component.ngOnInit();

    expect(component.recommendations).toEqual([]);
    expect(navigate).toHaveBeenCalledWith(['/patients']);
  });

  it('updates recommendations and resets transient UI state when navigating between patients', () => {
    const { component } = createComponent();
    component.ngOnInit();

    component.isVitalsHighlighted = true;
    component.isLabDialogOpen = true;

    setRouteId('2');

    expect(component.patient?.id).toBe(2);
    expect(component.isVitalsHighlighted).toBe(false);
    expect(component.isLabDialogOpen).toBe(false);
    expect(component.recommendations.length).toBe(3);
  });

  it('opens the lab dialog when the request-lab action is selected', () => {
    const { component } = createComponent();
    component.ngOnInit();

    component.onRecommendationAction('request-lab' as RecommendationActionId);

    expect(component.isLabDialogOpen).toBe(true);
  });

  it('closes the lab dialog via closeLabDialog', () => {
    const { component } = createComponent();
    component.ngOnInit();
    component.isLabDialogOpen = true;

    component.closeLabDialog();

    expect(component.isLabDialogOpen).toBe(false);
  });

  it('navigates to the schedule module with patient context on schedule-follow-up', () => {
    const { component } = createComponent();
    component.ngOnInit();

    component.onRecommendationAction('schedule-follow-up' as RecommendationActionId);

    expect(navigate).toHaveBeenCalledWith(['/schedule'], {
      queryParams: { patientId: component.patientId, patientName: component.patient?.name },
    });
  });

  it('scrolls to and highlights the vitals card on review-vitals, then clears the highlight', () => {
    vi.useFakeTimers();
    const { component } = createComponent();
    component.ngOnInit();

    const scrollIntoView = vi.fn();
    const focus = vi.fn();
    (component as unknown as { vitalsCard: ElementRef<HTMLElement> }).vitalsCard = {
      nativeElement: { scrollIntoView, focus } as unknown as HTMLElement,
    };

    component.onRecommendationAction('review-vitals' as RecommendationActionId);

    expect(scrollIntoView).toHaveBeenCalled();
    expect(focus).toHaveBeenCalled();
    expect(component.isVitalsHighlighted).toBe(true);

    vi.advanceTimersByTime(2000);
    expect(component.isVitalsHighlighted).toBe(false);

    vi.useRealTimers();
  });

  it('does not throw when review-vitals is triggered before the vitals card is available', () => {
    const { component } = createComponent();
    component.ngOnInit();

    expect(() =>
      component.onRecommendationAction('review-vitals' as RecommendationActionId),
    ).not.toThrow();
    expect(component.isVitalsHighlighted).toBe(false);
  });

  it('unsubscribes from route changes and clears pending timeouts on destroy', () => {
    const { component } = createComponent();
    component.ngOnInit();

    const routeSub = (component as unknown as { routeSub: { unsubscribe: () => void } }).routeSub;
    const unsubscribeSpy = vi.spyOn(routeSub, 'unsubscribe');

    component.ngOnDestroy();

    expect(unsubscribeSpy).toHaveBeenCalled();
  });
});
