import React, { useCallback, useEffect, useRef } from 'react';
import AIRecommendationEngine, { UserBehavior, CompletedTrip } from '../services/AIRecommendationEngine';

interface UserBehaviorTrackerProps {
  userId: string;
  children: React.ReactNode;
  onLearningUpdate?: (profile: any) => void;
}

interface TrackingEvent {
  element: HTMLElement;
  action: string;
  data?: any;
  timestamp: number;
}

const UserBehaviorTracker: React.FC<UserBehaviorTrackerProps> = ({ 
  userId, 
  children, 
  onLearningUpdate 
}) => {
  const sessionStart = useRef<number>(Date.now());
  const currentSession = useRef<TrackingEvent[]>([]);
  const interactionBuffer = useRef<UserBehavior[]>([]);
  const lastActivity = useRef<number>(Date.now());

  // Track user interactions
  const trackInteraction = useCallback(async (
    action: UserBehavior['action'],
    targetType: UserBehavior['targetType'],
    targetId: string,
    additionalData?: any
  ) => {
    const behavior: UserBehavior = {
      timestamp: new Date().toISOString(),
      action,
      targetType,
      targetId,
      context: {
        sessionDuration: Date.now() - sessionStart.current,
        deviceType: getDeviceType(),
        timeOfDay: getTimeOfDay(),
        ...additionalData
      }
    };

    interactionBuffer.current.push(behavior);
    lastActivity.current = Date.now();

    // Batch process interactions every 5 behaviors or 30 seconds
    if (interactionBuffer.current.length >= 5) {
      await processBehaviorBatch();
    }
  }, [userId]);

  // Process batch of behaviors for training
  const processBehaviorBatch = useCallback(async () => {
    if (interactionBuffer.current.length === 0) return;

    try {
      const behaviors = [...interactionBuffer.current];
      interactionBuffer.current = [];

      const updatedProfile = await AIRecommendationEngine.trainOnUserData(userId, behaviors, []);
      onLearningUpdate?.(updatedProfile);

      console.log(`Processed ${behaviors.length} interactions for user ${userId}`);
    } catch (error) {
      console.error('Error processing behavior batch:', error);
    }
  }, [userId, onLearningUpdate]);

  // Track completed trips for deep learning
  const trackCompletedTrip = useCallback(async (trip: CompletedTrip) => {
    try {
      await AIRecommendationEngine.trainOnUserData(userId, [], [trip]);
      console.log('Completed trip tracked:', trip.destination);
    } catch (error) {
      console.error('Error tracking completed trip:', error);
    }
  }, [userId]);

  // Track page/component views
  const trackView = useCallback((targetId: string, targetType: UserBehavior['targetType'] = 'destination') => {
    trackInteraction('view', targetType, targetId);
  }, [trackInteraction]);

  // Track likes/favorites
  const trackLike = useCallback((targetId: string, targetType: UserBehavior['targetType'] = 'destination') => {
    trackInteraction('like', targetType, targetId);
  }, [trackInteraction]);

  // Track saves/bookmarks
  const trackSave = useCallback((targetId: string, targetType: UserBehavior['targetType'] = 'destination') => {
    trackInteraction('save', targetType, targetId);
  }, [trackInteraction]);

  // Track bookings/conversions
  const trackBooking = useCallback((targetId: string, targetType: UserBehavior['targetType'] = 'destination', bookingData?: any) => {
    trackInteraction('book', targetType, targetId, bookingData);
  }, [trackInteraction]);

  // Track rejections (swipe left, dismiss, etc.)
  const trackReject = useCallback((targetId: string, targetType: UserBehavior['targetType'] = 'destination', reason?: string) => {
    trackInteraction('reject', targetType, targetId, { reason });
  }, [trackInteraction]);

  // Track ratings and feedback
  const trackRating = useCallback((
    targetId: string, 
    rating: number,
    targetType: UserBehavior['targetType'] = 'destination',
    comments?: string,
    tags?: string[]
  ) => {
    trackInteraction('rate', targetType, targetId, {
      feedback: { rating, comments, tags }
    });
  }, [trackInteraction]);

  // Track search queries for implicit preferences
  const trackSearch = useCallback((query: string, filters?: any, resultsCount?: number) => {
    trackInteraction('view', 'destination', 'search_results', {
      searchQuery: query,
      filters,
      resultsCount
    });
  }, [trackInteraction]);

  // Track scroll depth and engagement
  const trackEngagement = useCallback((targetId: string, engagementLevel: 'low' | 'medium' | 'high') => {
    const engagementScore = { low: 0.2, medium: 0.5, high: 0.8 }[engagementLevel];
    trackInteraction('view', 'destination', targetId, { engagementScore });
  }, [trackInteraction]);

  // Set up automatic tracking for common elements
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const trackingData = getTrackingDataFromElement(target);
      
      if (trackingData) {
        const { action, targetType, targetId } = trackingData;
        trackInteraction(action, targetType, targetId, {
          clickPosition: { x: event.clientX, y: event.clientY },
          elementText: target.textContent?.slice(0, 100)
        });
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        // Process any pending interactions when page becomes hidden
        processBehaviorBatch();
      }
    };

    // Track scroll behavior for engagement
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollPercentage = (window.scrollY + window.innerHeight) / document.body.scrollHeight;
        if (scrollPercentage > 0.8) {
          // High engagement - user scrolled most of the page
          const currentPage = window.location.pathname.split('/').pop() || 'unknown';
          trackEngagement(currentPage, 'high');
        }
      }, 1000);
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('scroll', handleScroll);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('scroll', handleScroll);
      processBehaviorBatch(); // Process any remaining behaviors
    };
  }, [trackInteraction, trackEngagement, processBehaviorBatch]);

  // Auto-save interactions periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (interactionBuffer.current.length > 0) {
        processBehaviorBatch();
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [processBehaviorBatch]);

  // Session timeout tracking
  useEffect(() => {
    const interval = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivity.current;
      if (timeSinceLastActivity > 5 * 60 * 1000) { // 5 minutes inactive
        // Session expired, process remaining interactions
        processBehaviorBatch();
        sessionStart.current = Date.now(); // Start new session
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [processBehaviorBatch]);

  return (
    <TrackingContext.Provider value={{
      trackView,
      trackLike,
      trackSave,
      trackBooking,
      trackReject,
      trackRating,
      trackSearch,
      trackEngagement,
      trackCompletedTrip,
      userId
    }}>
      {children}
    </TrackingContext.Provider>
  );
};

// Helper functions
const getTrackingDataFromElement = (element: HTMLElement): {
  action: UserBehavior['action'];
  targetType: UserBehavior['targetType'];
  targetId: string;
} | null => {
  // Look for tracking attributes
  const action = element.getAttribute('data-track-action') as UserBehavior['action'];
  const targetType = element.getAttribute('data-track-type') as UserBehavior['targetType'];
  const targetId = element.getAttribute('data-track-id');

  if (action && targetType && targetId) {
    return { action, targetType, targetId };
  }

  // Fallback - analyze element structure
  if (element.closest('[data-destination-id]')) {
    const destinationId = element.closest('[data-destination-id]')?.getAttribute('data-destination-id');
    if (destinationId) {
      if (element.matches('button[aria-label*="like"], .like-button')) {
        return { action: 'like', targetType: 'destination', targetId: destinationId };
      }
      if (element.matches('button[aria-label*="save"], .save-button')) {
        return { action: 'save', targetType: 'destination', targetId: destinationId };
      }
      if (element.matches('button[aria-label*="book"], .book-button')) {
        return { action: 'book', targetType: 'destination', targetId: destinationId };
      }
      // Default to view
      return { action: 'view', targetType: 'destination', targetId: destinationId };
    }
  }

  return null;
};

const getDeviceType = (): string => {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

const getTimeOfDay = (): string => {
  const hour = new Date().getHours();
  if (hour < 6) return 'night';
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
};

// React Context for easy access to tracking functions
export const TrackingContext = React.createContext<{
  trackView: (targetId: string, targetType?: UserBehavior['targetType']) => void;
  trackLike: (targetId: string, targetType?: UserBehavior['targetType']) => void;
  trackSave: (targetId: string, targetType?: UserBehavior['targetType']) => void;
  trackBooking: (targetId: string, targetType?: UserBehavior['targetType'], bookingData?: any) => void;
  trackReject: (targetId: string, targetType?: UserBehavior['targetType'], reason?: string) => void;
  trackRating: (targetId: string, rating: number, targetType?: UserBehavior['targetType'], comments?: string, tags?: string[]) => void;
  trackSearch: (query: string, filters?: any, resultsCount?: number) => void;
  trackEngagement: (targetId: string, engagementLevel: 'low' | 'medium' | 'high') => void;
  trackCompletedTrip: (trip: CompletedTrip) => Promise<void>;
  userId: string;
} | null>(null);

// Hook for using tracking context
export const useTracking = () => {
  const context = React.useContext(TrackingContext);
  if (!context) {
    throw new Error('useTracking must be used within a UserBehaviorTracker');
  }
  return context;
};

// Higher-order component for automatic tracking
export const withTracking = <P extends object>(
  Component: React.ComponentType<P>,
  defaultTrackingProps?: {
    targetId?: string;
    targetType?: UserBehavior['targetType'];
    autoTrackView?: boolean;
  }
) => {
  return React.forwardRef<any, P>((props, ref) => {
    const tracking = useTracking();
    const hasTracked = useRef(false);

    useEffect(() => {
      if (defaultTrackingProps?.autoTrackView && !hasTracked.current && defaultTrackingProps.targetId) {
        tracking.trackView(
          defaultTrackingProps.targetId, 
          defaultTrackingProps.targetType || 'destination'
        );
        hasTracked.current = true;
      }
    }, [tracking, defaultTrackingProps]);

    return <Component {...(props as P)} ref={ref} />;
  });
};

// Component for tracking specific interactions
export const TrackingTrigger: React.FC<{
  action: UserBehavior['action'];
  targetType: UserBehavior['targetType'];
  targetId: string;
  children: React.ReactElement;
  additionalData?: any;
}> = ({ action, targetType, targetId, children, additionalData }) => {
  const tracking = useTracking();

  const handleInteraction = useCallback((event: React.MouseEvent) => {
    switch (action) {
      case 'view':
        tracking.trackView(targetId, targetType);
        break;
      case 'like':
        tracking.trackLike(targetId, targetType);
        break;
      case 'save':
        tracking.trackSave(targetId, targetType);
        break;
      case 'book':
        tracking.trackBooking(targetId, targetType, additionalData);
        break;
      case 'reject':
        tracking.trackReject(targetId, targetType, additionalData?.reason);
        break;
    }
  }, [action, targetType, targetId, tracking, additionalData]);

  return React.cloneElement(children, {
    onClick: (event: React.MouseEvent) => {
      handleInteraction(event);
      children.props.onClick?.(event);
    },
    'data-track-action': action,
    'data-track-type': targetType,
    'data-track-id': targetId
  });
};

export default UserBehaviorTracker;