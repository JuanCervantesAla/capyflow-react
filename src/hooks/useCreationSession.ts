import { useEffect, useRef, useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  startCreationSession,
  endCreationSession,
  updateSessionActivity,
  incrementSessionSave,
  updateCreationTime,
  calculateComplexity,
  type WorkflowCreationSession,
} from '../api/Analytics/analytics.api';

interface UseCreationSessionOptions {
  flowId: string;
  creationMethod: 'manual' | 'ai';
  enabled?: boolean;
}

interface SessionActivityTracker {
  nodeAdditions: number;
  nodeDeletions: number;
  edgeAdditions: number;
  edgeDeletions: number;
  lastNodeCount: number;
  lastEdgeCount: number;
}

export const useCreationSession = ({ flowId, creationMethod, enabled = true }: UseCreationSessionOptions) => {
  const [session, setSession] = useState<WorkflowCreationSession | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<number | null>(null);
  const activityTrackerRef = useRef<SessionActivityTracker>({
    nodeAdditions: 0,
    nodeDeletions: 0,
    edgeAdditions: 0,
    edgeDeletions: 0,
    lastNodeCount: 0,
    lastEdgeCount: 0,
  });
  const queryClient = useQueryClient();

  // Start session mutation
  const startSessionMutation = useMutation({
    mutationFn: () => startCreationSession(flowId, creationMethod),
    onSuccess: (data) => {
      setSession(data);
      setElapsedTime(0);
      
      // Start timer
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }

      timerRef.current = window.setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    },
  });

  // End session mutation
  const endSessionMutation = useMutation({
    mutationFn: (sessionId: string) => endCreationSession(sessionId),
    onSuccess: () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
      
      // Update creation time and calculate complexity
      updateCreationTime(flowId);
      calculateComplexity(flowId);
      
      setSession(null);
      setElapsedTime(0);
      
      // Invalidate analytics queries
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  // Update activity mutation
  const updateActivityMutation = useMutation({
    mutationFn: (activity: {
      nodeAdded?: number;
      nodeDeleted?: number;
      edgeAdded?: number;
      edgeDeleted?: number;
    }) => {
      if (!session) throw new Error('No active session');
      return updateSessionActivity(session.id, activity);
    },
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: () => {
      if (!session) throw new Error('No active session');
      return incrementSessionSave(session.id);
    },
  });

  // Start session on mount if enabled
  useEffect(() => {
    if (enabled && flowId) {
      startSessionMutation.mutate();
    }

    // Cleanup on unmount
    return () => {
      if (session?.id) {
        endSessionMutation.mutate(session.id);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [enabled, flowId]); // Only run on mount/unmount

  // Track node/edge changes
  const trackActivity = useCallback((nodeCount: number, edgeCount: number) => {
    if (!session) return;

    const tracker = activityTrackerRef.current;
    const activity: any = {};

    // Calculate changes
    if (nodeCount > tracker.lastNodeCount) {
      activity.nodeAdded = nodeCount - tracker.lastNodeCount;
    } else if (nodeCount < tracker.lastNodeCount) {
      activity.nodeDeleted = tracker.lastNodeCount - nodeCount;
    }

    if (edgeCount > tracker.lastEdgeCount) {
      activity.edgeAdded = edgeCount - tracker.lastEdgeCount;
    } else if (edgeCount < tracker.lastEdgeCount) {
      activity.edgeDeleted = tracker.lastEdgeCount - edgeCount;
    }

    // Update tracker
    tracker.lastNodeCount = nodeCount;
    tracker.lastEdgeCount = edgeCount;

    // Send update if there are changes
    if (Object.keys(activity).length > 0) {
      updateActivityMutation.mutate(activity);
    }
  }, [session, updateActivityMutation]);

  // Track save
  const trackSave = useCallback(() => {
    if (session) {
      saveMutation.mutate();
    }
  }, [session, saveMutation]);

  // End session manually
  const endSession = useCallback(() => {
    if (session) {
      endSessionMutation.mutate(session.id);
    }
  }, [session, endSessionMutation]);

  // Format elapsed time as HH:MM:SS
  const formatTime = useCallback(() => {
    const hours = Math.floor(elapsedTime / 3600);
    const minutes = Math.floor((elapsedTime % 3600) / 60);
    const seconds = elapsedTime % 60;
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, [elapsedTime]);

  return {
    session,
    elapsedTime,
    formatTime,
    trackActivity,
    trackSave,
    endSession,
    isActive: !!session,
  };
};
