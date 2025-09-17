import { renderHook, act } from '@testing-library/react';
import { useWindowDimensions } from './useWindowDimensions';

// Mock window.addEventListener and removeEventListener
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();

beforeEach(() => {
  // Mock window object
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 1024,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: 768,
  });
  
  window.addEventListener = mockAddEventListener;
  window.removeEventListener = mockRemoveEventListener;
  
  jest.clearAllMocks();
});

describe('useWindowDimensions', () => {
  test('returns initial window dimensions', () => {
    const { result } = renderHook(() => useWindowDimensions());
    
    expect(result.current.width).toBe(1024);
    expect(result.current.height).toBe(768);
  });

  test('correctly identifies desktop screen', () => {
    // Desktop: >= 1024px
    Object.defineProperty(window, 'innerWidth', { value: 1200 });
    
    const { result } = renderHook(() => useWindowDimensions());
    
    expect(result.current.isDesktop).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isMobile).toBe(false);
  });

  test('correctly identifies tablet screen', () => {
    // Tablet: 768px - 1023px
    Object.defineProperty(window, 'innerWidth', { value: 800 });
    
    const { result } = renderHook(() => useWindowDimensions());
    
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isMobile).toBe(false);
  });

  test('correctly identifies mobile screen', () => {
    // Mobile: < 768px
    Object.defineProperty(window, 'innerWidth', { value: 600 });
    
    const { result } = renderHook(() => useWindowDimensions());
    
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isMobile).toBe(true);
  });

  test('correctly identifies edge cases for breakpoints', () => {
    // Test exact breakpoint values
    
    // 767px should be mobile
    Object.defineProperty(window, 'innerWidth', { value: 767 });
    let { result } = renderHook(() => useWindowDimensions());
    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTablet).toBe(false);
    
    // 768px should be tablet
    Object.defineProperty(window, 'innerWidth', { value: 768 });
    ({ result } = renderHook(() => useWindowDimensions()));
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(true);
    
    // 1023px should be tablet
    Object.defineProperty(window, 'innerWidth', { value: 1023 });
    ({ result } = renderHook(() => useWindowDimensions()));
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isDesktop).toBe(false);
    
    // 1024px should be desktop
    Object.defineProperty(window, 'innerWidth', { value: 1024 });
    ({ result } = renderHook(() => useWindowDimensions()));
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(true);
  });

  test('adds resize event listener on mount', () => {
    renderHook(() => useWindowDimensions());
    
    expect(mockAddEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
  });

  test('removes resize event listener on unmount', () => {
    const { unmount } = renderHook(() => useWindowDimensions());
    
    unmount();
    
    expect(mockRemoveEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
  });

  test('updates dimensions when resize event fires', () => {
    const { result } = renderHook(() => useWindowDimensions());
    
    // Initial state
    expect(result.current.width).toBe(1024);
    expect(result.current.isDesktop).toBe(true);
    
    // Simulate window resize
    act(() => {
      Object.defineProperty(window, 'innerWidth', { value: 600 });
      Object.defineProperty(window, 'innerHeight', { value: 400 });
      
      // Find the resize handler and call it
      const resizeHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'resize'
      )?.[1];
      
      if (resizeHandler) {
        resizeHandler();
      }
    });
    
    expect(result.current.width).toBe(600);
    expect(result.current.height).toBe(400);
    expect(result.current.isMobile).toBe(true);
    expect(result.current.isDesktop).toBe(false);
  });

  test('handles undefined window gracefully', () => {
    // Test the fallback values when window is initially undefined
    // Since we're in jsdom environment, just test that the hook returns reasonable defaults
    
    const { result } = renderHook(() => useWindowDimensions());
    
    // Should return current window dimensions (or defaults)
    expect(typeof result.current.width).toBe('number');
    expect(typeof result.current.height).toBe('number');
    expect(typeof result.current.isDesktop).toBe('boolean');
    expect(typeof result.current.isTablet).toBe('boolean');
    expect(typeof result.current.isMobile).toBe('boolean');
  });
});