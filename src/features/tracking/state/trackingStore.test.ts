import { useTrackingStore } from './trackingStore';

describe('tracking state machine', () => {
  beforeEach(() => useTrackingStore.getState().reset());

  it('allows idle -> recording -> paused -> recording -> finishing -> finished', () => {
    const store = useTrackingStore.getState();
    store.finish();
    expect(useTrackingStore.getState().status).toBe('idle');
    store.start();
    expect(useTrackingStore.getState().status).toBe('recording');
    store.pause();
    expect(useTrackingStore.getState().status).toBe('paused');
    store.resume();
    expect(useTrackingStore.getState().status).toBe('recording');
    store.finish();
    expect(useTrackingStore.getState().status).toBe('finishing');
    store.complete();
    expect(useTrackingStore.getState().status).toBe('finished');
  });

  it('does not accept GPS points while paused', () => {
    const store = useTrackingStore.getState();
    store.start();
    store.pause();
    store.addPoint({ latitude: 0, longitude: 0, timestamp: Date.now() }, 100);
    expect(useTrackingStore.getState().points).toHaveLength(0);
    expect(useTrackingStore.getState().distanceMeters).toBe(0);
  });
});
