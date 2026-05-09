/**
 * Integration tests for useOnlineStatus hook and OfflineIndicator component.
 * Simulates browser online/offline events via window.dispatchEvent.
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { useOnlineStatus } from '@/shared/hooks/use-online-status';
import { OfflineIndicator } from '@/shared/components/offline-indicator';

// ---- useOnlineStatus ----

describe('useOnlineStatus', () => {
  afterEach(() => {
    // Restore online state after each test
    act(() => {
      window.dispatchEvent(new Event('online'));
    });
  });

  it('returns true when navigator.onLine is true', () => {
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);
  });

  it('updates to false when offline event fires', () => {
    const { result } = renderHook(() => useOnlineStatus());
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(result.current).toBe(false);
  });

  it('updates back to true when online event fires after going offline', () => {
    const { result } = renderHook(() => useOnlineStatus());

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(result.current).toBe(false);

    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(result.current).toBe(true);
  });

  it('removes event listeners on unmount', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useOnlineStatus());
    unmount();

    const onlineRemoved = removeSpy.mock.calls.some(
      ([event]: [string, ...unknown[]]) => event === 'online',
    );
    const offlineRemoved = removeSpy.mock.calls.some(
      ([event]: [string, ...unknown[]]) => event === 'offline',
    );

    expect(addSpy).toHaveBeenCalledWith('online', expect.any(Function));
    expect(addSpy).toHaveBeenCalledWith('offline', expect.any(Function));
    expect(onlineRemoved).toBe(true);
    expect(offlineRemoved).toBe(true);

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });
});

// ---- OfflineIndicator ----

describe('OfflineIndicator', () => {
  afterEach(() => {
    act(() => {
      window.dispatchEvent(new Event('online'));
    });
  });

  it('renders nothing when online', () => {
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
    const { container } = render(<OfflineIndicator />);
    expect(container.firstChild).toBeNull();
  });

  it('renders banner when offline event fires', () => {
    render(<OfflineIndicator />);

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/you're offline/i)).toBeInTheDocument();
  });

  it('hides banner when back online', () => {
    render(<OfflineIndicator />);

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(screen.getByRole('status')).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(screen.queryByRole('status')).toBeNull();
  });
});
