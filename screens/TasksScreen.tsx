import React from 'react';
import { Task } from '../types';
import TaskItem from '../components/TaskItem';
import SystemTerminal from '../components/SystemTerminal';

interface TasksScreenProps {
    tasks: Task[];
    systemMessages: string[];
    isTasksLoading: boolean;
    onCompleteTask: (taskId: string) => void;
    onNewTasks: () => void;
    isEncounterAvailable: boolean;
    isEncounterLoading: boolean;
    onNewEncounter: () => void;
}

const TasksScreen: React.FC<TasksScreenProps> = ({ 
    tasks, 
    systemMessages, 
    isTasksLoading, 
    onCompleteTask, 
    onNewTasks,
    isEncounterAvailable,
    isEncounterLoading,
    onNewEncounter
}) => {
    const eventTasks = tasks.filter(t => t.isEventTask && !t.completed);
    const activeTasks = tasks.filter(t => !t.isEventTask && !t.completed);

    // FIX: Explicitly typed `groupedEventTasks` to resolve a TypeScript inference issue with the `reduce` method.
    const groupedEventTasks: Record<string, Task[]> = eventTasks.reduce((acc, task) => {
        const eventName = task.eventName || 'Sự kiện Đặc biệt';
        if (!acc[eventName]) {
            acc[eventName] = [];
        }
        acc[eventName].push(task);
        return acc;
    }, {} as Record<string, Task[]>);
    
    return (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
            <div className="lg:col-span-2 space-y-8">
                {Object.keys(groupedEventTasks).length > 0 && (
                    <div>
                        {Object.entries(groupedEventTasks).map(([eventName, eventTasks]) => (
                            <div key={eventName} className="mb-8">
                                <h2 className="text-2xl font-bold mb-4 text-purple-300">
                                    Nhiệm Vụ Sự Kiện: {eventName}
                                </h2>
                                <div className="space-y-4">
                                    {eventTasks.map(task => (
                                        <TaskItem key={task.id} task={task} onComplete={onCompleteTask} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <div>
                    <h2 className="text-2xl font-bold mb-4 text-[var(--color-text-base)]">Nhiệm Vụ Hiện Tại</h2>
                    <div className="space-y-4 max-h-[calc(100vh-350px)] overflow-y-auto pr-2">
                         {activeTasks.length > 0 ? (
                            activeTasks.map(task => (
                                <TaskItem key={task.id} task={task} onComplete={onCompleteTask} />
                            ))
                        ) : (
                            <div className="text-center py-10 bg-[var(--color-surface)]/50 rounded-lg">
                                <p className="text-[var(--color-text-muted)]">Không có nhiệm vụ nào. Hãy yêu cầu nhiệm vụ mới từ hệ thống.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="lg:col-span-1 h-96 lg:h-auto">
                 <SystemTerminal 
                    messages={systemMessages} 
                    onNewTasks={onNewTasks} 
                    isLoading={isTasksLoading}
                    isEncounterAvailable={isEncounterAvailable}
                    isEncounterLoading={isEncounterLoading}
                    onNewEncounter={onNewEncounter}
                />
            </div>
        </div>
    );
};

export default TasksScreen;