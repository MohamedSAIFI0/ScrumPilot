import { useState, useCallback } from 'react';
import { Task } from '../types';

export const useDragAndDrop = (tasks: Task[], onTaskUpdate: (taskId: string, updates: Partial<Task>) => void) => {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const handleDragStart = useCallback((task: Task) => {
    setDraggedTask(task);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedTask(null);
  }, []);

  const handleDrop = useCallback((newStatus: 'todo' | 'inprogress' | 'done') => {
    if (draggedTask && draggedTask.status !== newStatus) {
      onTaskUpdate(draggedTask.id, {
        status: newStatus,
        updatedAt: new Date(),
        statusHistory: [
          ...draggedTask.statusHistory,
          {
            id: Date.now().toString(),
            fromStatus: draggedTask.status,
            toStatus: newStatus,
            changedBy: draggedTask.assignee,
            changedAt: new Date()
          }
        ]
      });
    }
    setDraggedTask(null);
  }, [draggedTask, onTaskUpdate]);

  return {
    draggedTask,
    handleDragStart,
    handleDragEnd,
    handleDrop
  };
};