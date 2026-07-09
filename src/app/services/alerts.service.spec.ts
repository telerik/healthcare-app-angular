import { TestBed } from '@angular/core/testing';
import { AlertsService } from './alerts.service';

describe('AlertsService', () => {
  let service: AlertsService;
  let localStorageMock: Record<string, string>;

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = {};

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: (key: string) => localStorageMock[key] || null,
        setItem: (key: string, value: string) => {
          localStorageMock[key] = value;
        },
        removeItem: (key: string) => {
          delete localStorageMock[key];
        },
        clear: () => {
          localStorageMock = {};
        },
      },
      writable: true,
    });

    TestBed.configureTestingModule({});
    service = TestBed.inject(AlertsService);
  });

  afterEach(() => {
    localStorageMock = {};
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return all alerts with default Open state', () => {
    const alerts = service.alerts();

    expect(Array.isArray(alerts)).toBe(true);
    expect(alerts.length).toBeGreaterThan(0);
    expect(alerts.every((alert) => alert.caseState === 'Open')).toBe(true);
  });

  it('should get case state for specific alert', () => {
    const state = service.getCaseState(1);

    expect(state).toBe('Open');
  });

  it('should set and persist case state', () => {
    service.setCaseState(1, 'In Progress');

    const state = service.getCaseState(1);
    expect(state).toBe('In Progress');

    // Verify persistence in localStorage
    const stored = localStorage.getItem('healthcare-alerts-case-state');
    expect(stored).toBeTruthy();
    if (stored) {
      const parsed = JSON.parse(stored);
      expect(parsed['1']).toBe('In Progress');
    }
  });

  it('should update computed alerts signal when state changes', () => {
    service.setCaseState(1, 'Resolved');

    const alerts = service.alerts();
    const alert = alerts.find((a) => a.id === 1);

    expect(alert?.caseState).toBe('Resolved');
  });

  it('should filter alerts by state', () => {
    service.setCaseState(1, 'In Progress');
    service.setCaseState(2, 'In Progress');
    service.setCaseState(3, 'Resolved');

    const inProgressAlerts = service.getFilteredAlerts('In Progress');
    expect(inProgressAlerts.length).toBe(2);
    expect(inProgressAlerts.every((alert) => alert.caseState === 'In Progress')).toBe(true);

    const resolvedAlerts = service.getFilteredAlerts('Resolved');
    expect(resolvedAlerts.length).toBe(1);
    expect(resolvedAlerts[0].caseState).toBe('Resolved');

    const openAlerts = service.getFilteredAlerts('Open');
    expect(openAlerts.length).toBeGreaterThan(0);
  });

  it('should return all alerts when filter is "All"', () => {
    service.setCaseState(1, 'In Progress');
    service.setCaseState(2, 'Resolved');

    const allAlerts = service.getFilteredAlerts('All');
    const directAlerts = service.alerts();

    expect(allAlerts.length).toBe(directAlerts.length);
  });

  it('should load persisted state from localStorage on initialization', () => {
    // Set up localStorage with pre-existing data before creating service
    const testStates = { '1': 'Resolved', '2': 'In Progress' };
    localStorage.setItem('healthcare-alerts-case-state', JSON.stringify(testStates));

    // Create new service instance with TestBed's resetTestingModule to get fresh instance
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const newService = TestBed.inject(AlertsService);

    expect(newService.getCaseState(1)).toBe('Resolved');
    expect(newService.getCaseState(2)).toBe('In Progress');
  });

  it('should handle invalid data in localStorage gracefully', () => {
    // Set invalid JSON in localStorage
    localStorage.setItem('healthcare-alerts-case-state', 'invalid-json');

    // Create new service instance with fresh TestBed
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const newService = TestBed.inject(AlertsService);

    // Should not throw error and return default states
    expect(newService.getCaseState(1)).toBe('Open');
  });

  it('should filter out invalid states from localStorage', () => {
    // Set localStorage with invalid state values
    const testStates = {
      '1': 'InvalidState',
      '2': 'In Progress',
      '3': 'Open',
    };
    localStorage.setItem('healthcare-alerts-case-state', JSON.stringify(testStates));

    // Create new service instance with fresh TestBed
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const newService = TestBed.inject(AlertsService);

    // Alert 1 should fallback to default 'Open' (invalid state ignored)
    expect(newService.getCaseState(1)).toBe('Open');
    // Alert 2 and 3 should have their valid states
    expect(newService.getCaseState(2)).toBe('In Progress');
    expect(newService.getCaseState(3)).toBe('Open');
  });

  it('should reset all states', () => {
    service.setCaseState(1, 'In Progress');
    service.setCaseState(2, 'Resolved');

    service.resetAllStates();

    expect(service.getCaseState(1)).toBe('Open');
    expect(service.getCaseState(2)).toBe('Open');
    expect(localStorage.getItem('healthcare-alerts-case-state')).toBeNull();
  });

  it('should handle non-existent alert IDs gracefully', () => {
    const state = service.getCaseState(9999);
    expect(state).toBe('Open');
  });
});
