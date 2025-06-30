'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Pill, 
  Calendar, 
  ExternalLink, 
  Camera, 
  Upload, 
  MapPin, 
  Phone, 
  Luggage, 
  CreditCard, 
  Smartphone, 
  Shirt, 
  Zap, 
  Scissors,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  Loader2,
  Shield
} from 'lucide-react';
import { ImageUploadTask } from '@/components/dashboard/checklist/ImageUploadTask';
import { PatientImageUpload } from '@/components/ui/patient-image-upload';
import { useAuth } from '@/contexts/AuthContext';
import { DatabaseService } from '@/lib/supabase/database';
import { toast } from 'sonner';

interface ChecklistProps {
  user: any;
}

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  category: 'medical' | 'preparation' | 'documentation';
  dueDate?: string;
  link?: {
    url: string;
    text: string;
  };
  recurring?: {
    startDate: string;
    endDate: string;
    frequency: 'daily' | 'weekly';
    totalDays: number;
  };
  accommodationInfo?: {
    name: string;
    address: string;
    phone: string;
  };
  packingList?: {
    category: string;
    items: string[];
    icon: string;
  }[];
  imageUpload?: {
    type: 'quotation' | 'progress' | 'medical' | 'identification';
    title: string;
    description: string;
  };
  isPreOp?: boolean;
}

interface NewTaskForm {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'medical' | 'preparation' | 'documentation';
  dueDate: string;
  isPreOp: boolean;
}

// Helper functions moved outside the main component
const sortTasksByDate = (tasks: ChecklistItem[]) => {
  return [...tasks].sort((a, b) => {
    // Tasks without due dates go to the end
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    
    // Sort by due date
    const dateA = new Date(a.dueDate);
    const dateB = new Date(b.dueDate);
    
    return dateA.getTime() - dateB.getTime();
  });
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-800 border-red-200';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'medical': return <Pill className="w-4 h-4" />;
    case 'preparation': return <Clock className="w-4 h-4" />;
    case 'documentation': return <FileText className="w-4 h-4" />;
    default: return <CheckCircle className="w-4 h-4" />;
  }
};

const getPackingIcon = (iconName: string) => {
  switch (iconName) {
    case 'FileText': return <FileText className="w-4 h-4 text-blue-600" />;
    case 'Smartphone': return <Smartphone className="w-4 h-4 text-green-600" />;
    case 'Shirt': return <Shirt className="w-4 h-4 text-purple-600" />;
    case 'Pill': return <Pill className="w-4 h-4 text-orange-600" />;
    default: return <Luggage className="w-4 h-4 text-gray-600" />;
  }
};

const formatRecurringInfo = (recurring: ChecklistItem['recurring']) => {
  if (!recurring) return null;
  
  const startDate = new Date(recurring.startDate);
  const endDate = new Date(recurring.endDate);
  
  return (
    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center space-x-2 mb-2">
        <Camera className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-medium text-blue-900">Daily Task Schedule</span>
      </div>
      <div className="text-sm text-blue-800 space-y-1">
        <div>📅 Start: {startDate.toLocaleDateString()}</div>
        <div>📅 End: {endDate.toLocaleDateString()}</div>
        <div>🔄 Frequency: {recurring.frequency} for {recurring.totalDays} days</div>
        <div className="mt-2 text-xs text-blue-700">
          💡 Tip: Take photos at the same time each day for consistent progress tracking
        </div>
      </div>
    </div>
  );
};

const formatAccommodationInfo = (accommodationInfo: ChecklistItem['accommodationInfo']) => {
  if (!accommodationInfo) return null;
  
  return (
    <div className="mt-2 p-4 bg-green-50 border border-green-200 rounded-lg">
      <div className="flex items-center space-x-2 mb-3">
        <MapPin className="w-4 h-4 text-green-600" />
        <span className="text-sm font-medium text-green-900">Your Accommodation Details</span>
      </div>
      <div className="space-y-2 text-sm text-green-800">
        <div>
          <span className="font-medium">🏨 Hotel:</span> {accommodationInfo.name}
        </div>
        <div>
          <span className="font-medium">📍 Address:</span> {accommodationInfo.address}
        </div>
        <div className="flex items-center space-x-2">
          <span className="font-medium">📞 Phone:</span>
          <a 
            href={`tel:${accommodationInfo.phone}`}
            className="text-green-700 hover:text-green-900 font-medium underline"
          >
            {accommodationInfo.phone}
          </a>
        </div>
        <div className="mt-3 p-2 bg-green-100 rounded text-xs text-green-700">
          💡 Save this contact information in your phone for easy access during your stay
        </div>
      </div>
    </div>
  );
};

const formatPackingList = (packingList: ChecklistItem['packingList']) => {
  if (!packingList) return null;
  
  return (
    <div className="mt-2 p-4 bg-orange-50 border border-orange-200 rounded-lg">
      <div className="flex items-center space-x-2 mb-3">
        <Luggage className="w-4 h-4 text-orange-600" />
        <span className="text-sm font-medium text-orange-900">Hospital Stay Packing Checklist</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {packingList.map((category, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center space-x-2">
              {getPackingIcon(category.icon)}
              <span className="text-sm font-medium text-gray-900">{category.category}</span>
            </div>
            <ul className="space-y-1 ml-6">
              {category.items.map((item, itemIndex) => (
                <li key={itemIndex} className="text-sm text-gray-700 flex items-start space-x-2">
                  <span className="text-orange-600 mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-3 p-2 bg-orange-100 rounded text-xs text-orange-700">
        💡 Pack light but include essentials. Thai hospitals provide most basics, but personal items ensure comfort during recovery
      </div>
    </div>
  );
};

const formatDueDate = (dueDate?: string) => {
  if (!dueDate) return null;
  
  const date = new Date(dueDate);
  const today = new Date();
  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  let urgencyColor = 'text-gray-600';
  let urgencyText = '';
  
  if (diffDays < 0) {
    urgencyColor = 'text-red-600';
    urgencyText = `${Math.abs(diffDays)} days overdue`;
  } else if (diffDays === 0) {
    urgencyColor = 'text-red-600';
    urgencyText = 'Due today';
  } else if (diffDays === 1) {
    urgencyColor = 'text-orange-600';
    urgencyText = 'Due tomorrow';
  } else if (diffDays <= 3) {
    urgencyColor = 'text-yellow-600';
    urgencyText = `Due in ${diffDays} days`;
  } else {
    urgencyText = `Due in ${diffDays} days`;
  }
  
  return (
    <div className={`text-xs ${urgencyColor} font-medium`}>
      📅 {date.toLocaleDateString()} ({urgencyText})
    </div>
  );
};

// TaskList component moved outside and converted to accept props
interface TaskListProps {
  tasks: ChecklistItem[];
  isPreOp: boolean;
  toggleTask: (taskId: string, isPreOp: boolean) => void;
  openEditModal: (task: ChecklistItem) => void;
  openDeleteModal: (taskId: string) => void;
  authUser: any;
  showImageUpload: { [key: string]: boolean };
  toggleImageUpload: (taskId: string) => void;
  handleUploadComplete: (taskId: string) => void;
  canManageTasks: boolean;
}

const TaskList = ({ 
  tasks, 
  isPreOp, 
  toggleTask, 
  openEditModal, 
  openDeleteModal, 
  authUser, 
  showImageUpload, 
  toggleImageUpload, 
  handleUploadComplete,
  canManageTasks
}: TaskListProps) => {
  const sortedTasks = sortTasksByDate(tasks);
  
  return (
    <div className="space-y-4">
      {sortedTasks.map((task) => (
        <Card key={task.id} className={`surgery-card ${task.completed ? 'opacity-75' : ''}`}>
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => toggleTask(task.id, isPreOp)}
                className="mt-1"
              />
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className={`font-semibold flex items-center space-x-2 ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {task.recurring && <Camera className="w-4 h-4 text-blue-600" />}
                    {task.id === '1' && <Camera className="w-4 h-4 text-purple-600" />}
                    {task.id === '2' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                    {task.id === '3' && <MapPin className="w-4 h-4 text-green-600" />}
                    {task.id === '8' && <Luggage className="w-4 h-4 text-orange-600" />}
                    {task.id === '11' && <Scissors className="w-4 h-4 text-red-600" />}
                    <span>{task.title}</span>
                  </h3>
                  {canManageTasks && (
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <div className="text-gray-400">
                        {getCategoryIcon(task.category)}
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(task)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteModal(task.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                <div className={`text-sm ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                  {task.description}
                  {task.link && (
                    <div className="mt-2">
                      <a
                        href={task.link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-primary hover:text-primary/80 font-medium transition-colors"
                      >
                        <span>{task.link.text}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
                {task.dueDate && (
                  <div className="flex items-center space-x-2">
                    {formatDueDate(task.dueDate)}
                  </div>
                )}
                {task.recurring && formatRecurringInfo(task.recurring)}
                {task.accommodationInfo && formatAccommodationInfo(task.accommodationInfo)}
                {task.packingList && formatPackingList(task.packingList)}
                
                {/* Special task content */}
                {task.id === '2' && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-medium text-red-900">Critical Pre-Surgery Requirement</span>
                    </div>
                    <div className="text-sm text-red-800 space-y-1">
                      <div>🚫 No food or drink after midnight before surgery</div>
                      <div>⏰ This includes water, gum, candy, or any oral intake</div>
                      <div>💊 Take only approved medications with minimal water</div>
                      <div>🏥 Follow your surgeon's specific fasting instructions</div>
                      <div className="mt-2 text-xs text-red-700">
                        ⚠️ Failure to fast properly may result in surgery cancellation for your safety
                      </div>
                    </div>
                  </div>
                )}
                {task.id === '11' && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Scissors className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-medium text-red-900">Important Suture Care Instructions</span>
                    </div>
                    <div className="text-sm text-red-800 space-y-1">
                      <div>⚠️ Do NOT attempt to remove sutures yourself</div>
                      <div>🏥 Only trained medical professionals should remove sutures</div>
                      <div>📅 Attend your scheduled appointment on time</div>
                      <div>🧼 Keep the area clean and dry before removal</div>
                      <div className="mt-2 text-xs text-red-700">
                        💡 Improper suture removal can cause complications, scarring, or infection
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Image Upload Section */}
                {task.imageUpload && authUser?.id && (
                  <div className="mt-3">
                    <button 
                      onClick={() => toggleImageUpload(task.id)}
                      className="inline-flex items-center space-x-2 px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium"
                    >
                      <Upload className="w-4 h-4" />
                      <span>
                        {task.id === '1' ? 'Upload Quotation Photos' : 'Upload Today\'s Photos'}
                      </span>
                    </button>
                    
                    {showImageUpload[task.id] && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                        <PatientImageUpload
                          patientId={authUser.id}
                          imageType={task.imageUpload.type}
                          onUploadComplete={(imageUrl, fileName) => handleUploadComplete(task.id)}
                          onUploadError={(error) => console.error('Upload error:', error)}
                          maxSizeInMB={10}
                          acceptedFormats={['jpg', 'jpeg', 'png', 'gif']}
                          allowMultiple={true}
                        />
                      </div>
                    )}
                  </div>
                )}
                
                {task.id === '1' && (
                  <div className="mt-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Camera className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-900">Reference Photos</span>
                    </div>
                    <div className="text-sm text-purple-800 space-y-1">
                      <div>📸 Upload the same photos used for your initial consultation</div>
                      <div>🔍 These will serve as reference points for your surgeon</div>
                      <div className="mt-2 text-xs text-purple-700">
                        💡 Ensure photos are clear and well-lit for best results
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default function Checklist({ user }: ChecklistProps) {
  const { user: authUser, hasRole } = useAuth();
  const [allTasks, setAllTasks] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Check if user can manage tasks (staff only)
  const canManageTasks = hasRole('Recovery Coordinator', 'Nurse', 'Clinic Administrator');
  const isPatient = hasRole('Patient');
  
  // Modal states
  const [showImageUpload, setShowImageUpload] = useState<{ [key: string]: boolean }>({});
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingTask, setEditingTask] = useState<ChecklistItem | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  // Form state
  const [newTaskForm, setNewTaskForm] = useState<NewTaskForm>({
    title: '',
    description: '',
    priority: 'medium',
    category: 'preparation',
    dueDate: '',
    isPreOp: true
  });

  // Load tasks from database on component mount
  useEffect(() => {
    if (authUser?.id) {
      loadTasks();
    }
  }, [authUser?.id]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      
      // Load tasks from database
      const dbTasks = await DatabaseService.getChecklistItems(authUser?.id);
      
      // Transform database tasks to match our interface
      const transformedTasks: ChecklistItem[] = dbTasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description || '',
        completed: task.completed,
        priority: (task.priority as 'high' | 'medium' | 'low') || 'medium',
        category: (task.category as 'medical' | 'preparation' | 'documentation') || 'preparation',
        dueDate: task.due_date || undefined,
        isPreOp: task.category === 'pre-op' || !task.category?.includes('post')
      }));

      // Add default tasks if no tasks exist
      if (transformedTasks.length === 0) {
        await createDefaultTasks();
        // Reload after creating default tasks
        const newDbTasks = await DatabaseService.getChecklistItems(authUser?.id);
        const newTransformedTasks: ChecklistItem[] = newDbTasks.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description || '',
          completed: task.completed,
          priority: (task.priority as 'high' | 'medium' | 'low') || 'medium',
          category: (task.category as 'medical' | 'preparation' | 'documentation') || 'preparation',
          dueDate: task.due_date || undefined,
          isPreOp: task.category === 'pre-op' || !task.category?.includes('post')
        }));
        setAllTasks(newTransformedTasks);
      } else {
        setAllTasks(transformedTasks);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const createDefaultTasks = async () => {
    const defaultPreOpTasks = [
      {
        title: 'Upload photos provided for quotation',
        description: 'Upload the photos you provided during your initial consultation for quotation. These will be used for reference during your procedure.',
        priority: 'medium' as const,
        category: 'documentation' as const,
        due_date: '2024-02-10'
      },
      {
        title: 'Stop eating 12 hours before surgery',
        description: 'No food or drink after midnight before your surgery day',
        priority: 'high' as const,
        category: 'preparation' as const,
        due_date: '2024-02-14'
      },
      {
        title: 'Information about your accommodation in Thailand',
        description: 'Review your accommodation details and contact information for your stay in Thailand during your medical treatment.',
        priority: 'high' as const,
        category: 'preparation' as const,
        due_date: '2024-02-12'
      },
      {
        title: 'Complete Thailand Arrival Card',
        description: 'Complete Thailand Arrival Card 2 days before your arrival to Thailand',
        priority: 'high' as const,
        category: 'documentation' as const,
        due_date: '2024-02-13'
      },
      {
        title: 'Complete pre-operative bloodwork',
        description: 'Lab tests required before surgery including CBC, metabolic panel',
        priority: 'high' as const,
        category: 'medical' as const,
        due_date: '2024-01-20'
      },
      {
        title: 'Review pre-operative instructions',
        description: 'Read all provided materials about your upcoming procedure',
        priority: 'medium' as const,
        category: 'documentation' as const,
        due_date: '2024-02-08'
      },
      {
        title: 'Confirm surgery time with hospital',
        description: 'Call to verify your surgery schedule 24 hours in advance',
        priority: 'high' as const,
        category: 'preparation' as const,
        due_date: '2024-02-14'
      },
      {
        title: 'Pack overnight bag',
        description: 'Prepare essential items for your hospital stay in Thailand',
        priority: 'medium' as const,
        category: 'preparation' as const,
        due_date: '2024-02-13'
      }
    ];

    const defaultPostOpTasks = [
      {
        title: 'Take prescribed medications as directed',
        description: 'Follow medication schedule provided by your surgeon',
        priority: 'high' as const,
        category: 'medical' as const,
        due_date: '2024-02-16'
      },
      {
        title: 'Attend follow-up appointment',
        description: 'Schedule and attend post-operative check-up',
        priority: 'high' as const,
        category: 'medical' as const,
        due_date: '2024-02-22'
      },
      {
        title: 'Attend follow-up appointment - Suture removal',
        description: 'Attend scheduled appointment for professional suture removal. Do not attempt to remove sutures yourself.',
        priority: 'high' as const,
        category: 'medical' as const,
        due_date: '2024-02-25'
      },
      {
        title: 'Monitor incision site daily',
        description: 'Check for signs of infection or complications',
        priority: 'high' as const,
        category: 'medical' as const,
        due_date: '2024-02-16'
      },
      {
        title: 'Begin physical therapy exercises',
        description: 'Start recommended exercises as approved by your surgeon',
        priority: 'medium' as const,
        category: 'medical' as const,
        due_date: '2024-02-20'
      },
      {
        title: 'Upload photos of recovery progress',
        description: 'Take and upload daily photos to track your healing progress. Include incision site and overall recovery status.',
        priority: 'medium' as const,
        category: 'documentation' as const,
        due_date: '2024-02-16'
      }
    ];

    // Create pre-op tasks
    for (const task of defaultPreOpTasks) {
      try {
        await DatabaseService.createChecklistItem({
          user_id: authUser!.id,
          ...task
        });
      } catch (error) {
        console.error('Error creating pre-op task:', error);
      }
    }

    // Create post-op tasks
    for (const task of defaultPostOpTasks) {
      try {
        await DatabaseService.createChecklistItem({
          user_id: authUser!.id,
          ...task
        });
      } catch (error) {
        console.error('Error creating post-op task:', error);
      }
    }
  };

  const toggleTask = async (taskId: string, isPreOp: boolean) => {
    try {
      const task = allTasks.find(t => t.id === taskId);
      if (!task) return;

      // Update in database
      await DatabaseService.updateChecklistItem(taskId, {
        completed: !task.completed
      });

      // Update local state
      setAllTasks(tasks => 
        tasks.map(task => 
          task.id === taskId ? { ...task, completed: !task.completed } : task
        )
      );

      toast.success('Task updated successfully');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const handleCreateTask = async () => {
    if (!newTaskForm.title.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    try {
      // Create in database
      const newTask = await DatabaseService.createChecklistItem({
        user_id: authUser!.id,
        title: newTaskForm.title,
        description: newTaskForm.description,
        priority: newTaskForm.priority,
        category: newTaskForm.category,
        due_date: newTaskForm.dueDate || null,
        completed: false
      });

      // Transform and add to local state
      const transformedTask: ChecklistItem = {
        id: newTask.id,
        title: newTask.title,
        description: newTask.description || '',
        completed: newTask.completed,
        priority: (newTask.priority as 'high' | 'medium' | 'low') || 'medium',
        category: (newTask.category as 'medical' | 'preparation' | 'documentation') || 'preparation',
        dueDate: newTask.due_date || undefined,
        isPreOp: newTaskForm.isPreOp
      };

      setAllTasks(prev => [...prev, transformedTask]);

      // Reset form
      setNewTaskForm({
        title: '',
        description: '',
        priority: 'medium',
        category: 'preparation',
        dueDate: '',
        isPreOp: true
      });

      setShowNewTaskModal(false);
      toast.success('Task created successfully');
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    }
  };

  const handleEditTask = async () => {
    if (!editingTask) return;

    try {
      // Update in database
      await DatabaseService.updateChecklistItem(editingTask.id, {
        title: editingTask.title,
        description: editingTask.description,
        priority: editingTask.priority,
        category: editingTask.category,
        due_date: editingTask.dueDate || null
      });

      // Update local state
      setAllTasks(tasks =>
        tasks.map(task => task.id === editingTask.id ? editingTask : task)
      );

      setShowEditModal(false);
      setEditingTask(null);
      toast.success('Task updated successfully');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async () => {
    if (!deletingTaskId) return;

    try {
      // Delete from database (soft delete)
      await DatabaseService.deleteChecklistItem(deletingTaskId);

      // Remove from local state
      setAllTasks(tasks => tasks.filter(task => task.id !== deletingTaskId));

      setShowDeleteModal(false);
      setDeletingTaskId(null);
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const openEditModal = (task: ChecklistItem) => {
    setEditingTask({ ...task });
    setShowEditModal(true);
  };

  const openDeleteModal = (taskId: string) => {
    setDeletingTaskId(taskId);
    setShowDeleteModal(true);
  };

  const toggleImageUpload = (taskId: string) => {
    setShowImageUpload(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const handleUploadComplete = (taskId: string) => {
    const task = allTasks.find(t => t.id === taskId);
    if (task) {
      toggleTask(taskId, task.isPreOp || false);
    }
    
    setShowImageUpload(prev => ({
      ...prev,
      [taskId]: false
    }));
  };

  const getProgress = (tasks: ChecklistItem[]) => {
    const completed = tasks.filter(task => task.completed).length;
    return Math.round((completed / tasks.length) * 100);
  };

  // Filter tasks by pre-op and post-op
  const preOpTasks = allTasks.filter(task => task.isPreOp !== false);
  const postOpTasks = allTasks.filter(task => task.isPreOp === false);

  if (loading) {
    return (
      <div className="space-y-6 fade-in">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-600">Loading checklist...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Surgery Checklist</h2>
          <p className="text-gray-600">Track your preparation and recovery tasks</p>
        </div>
        {canManageTasks && (
          <Button 
            onClick={() => setShowNewTaskModal(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        )}
      </div>

      {/* Patient Notice */}
      {isPatient && (
        <Card className="surgery-card bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 mb-1">Task Management</h3>
                <p className="text-sm text-blue-800">
                  Your healthcare team manages your checklist tasks. If you have questions or need to update a task, please contact your care coordinator or use the messaging system.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="pre-op" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pre-op" className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Pre-Operative</span>
          </TabsTrigger>
          <TabsTrigger value="post-op" className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>Post-Operative</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pre-op" className="space-y-6">
          <Card className="surgery-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Pre-Operative Progress</span>
                <span className="text-primary">{getProgress(preOpTasks)}%</span>
              </CardTitle>
              <CardDescription>
                Complete these tasks before your surgery date (sorted by due date)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={getProgress(preOpTasks)} className="w-full" />
              <div className="mt-2 text-sm text-gray-600">
                {preOpTasks.filter(t => t.completed).length} of {preOpTasks.length} tasks completed
              </div>
            </CardContent>
          </Card>

          <TaskList 
            tasks={preOpTasks} 
            isPreOp={true}
            toggleTask={toggleTask}
            openEditModal={openEditModal}
            openDeleteModal={openDeleteModal}
            authUser={authUser}
            showImageUpload={showImageUpload}
            toggleImageUpload={toggleImageUpload}
            handleUploadComplete={handleUploadComplete}
            canManageTasks={canManageTasks}
          />
        </TabsContent>

        <TabsContent value="post-op" className="space-y-6">
          <Card className="surgery-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Post-Operative Progress</span>
                <span className="text-primary">{getProgress(postOpTasks)}%</span>
              </CardTitle>
              <CardDescription>
                Complete these tasks during your recovery (sorted by due date)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={getProgress(postOpTasks)} className="w-full" />
              <div className="mt-2 text-sm text-gray-600">
                {postOpTasks.filter(t => t.completed).length} of {postOpTasks.length} tasks completed
              </div>
            </CardContent>
          </Card>

          <TaskList 
            tasks={postOpTasks} 
            isPreOp={false}
            toggleTask={toggleTask}
            openEditModal={openEditModal}
            openDeleteModal={openDeleteModal}
            authUser={authUser}
            showImageUpload={showImageUpload}
            toggleImageUpload={toggleImageUpload}
            handleUploadComplete={handleUploadComplete}
            canManageTasks={canManageTasks}
          />
        </TabsContent>
      </Tabs>

      {/* New Task Modal */}
      <Dialog open={showNewTaskModal} onOpenChange={setShowNewTaskModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>
              Create a new task for your checklist
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="task-title">Task Title</Label>
              <Input
                id="task-title"
                placeholder="Enter task title..."
                value={newTaskForm.title}
                onChange={(e) => setNewTaskForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="task-description">Description</Label>
              <Textarea
                id="task-description"
                placeholder="Enter task description..."
                value={newTaskForm.description}
                onChange={(e) => setNewTaskForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="task-priority">Priority</Label>
                <Select 
                  value={newTaskForm.priority} 
                  onValueChange={(value: 'high' | 'medium' | 'low') => 
                    setNewTaskForm(prev => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-category">Category</Label>
                <Select 
                  value={newTaskForm.category} 
                  onValueChange={(value: 'medical' | 'preparation' | 'documentation') => 
                    setNewTaskForm(prev => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medical">Medical</SelectItem>
                    <SelectItem value="preparation">Preparation</SelectItem>
                    <SelectItem value="documentation">Documentation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="task-type">Task Type</Label>
                <Select 
                  value={newTaskForm.isPreOp ? 'pre-op' : 'post-op'} 
                  onValueChange={(value) => 
                    setNewTaskForm(prev => ({ ...prev, isPreOp: value === 'pre-op' }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pre-op">Pre-Operative</SelectItem>
                    <SelectItem value="post-op">Post-Operative</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-due-date">Due Date</Label>
                <Input
                  id="task-due-date"
                  type="date"
                  value={newTaskForm.dueDate}
                  onChange={(e) => setNewTaskForm(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowNewTaskModal(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateTask}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Task
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Task Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Update task details
            </DialogDescription>
          </DialogHeader>
          {editingTask && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-task-title">Task Title</Label>
                <Input
                  id="edit-task-title"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask(prev => prev ? ({ ...prev, title: e.target.value }) : null)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-task-description">Description</Label>
                <Textarea
                  id="edit-task-description"
                  value={editingTask.description}
                  onChange={(e) => setEditingTask(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-task-priority">Priority</Label>
                  <Select 
                    value={editingTask.priority} 
                    onValueChange={(value: 'high' | 'medium' | 'low') => 
                      setEditingTask(prev => prev ? ({ ...prev, priority: value }) : null)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-task-category">Category</Label>
                  <Select 
                    value={editingTask.category} 
                    onValueChange={(value: 'medical' | 'preparation' | 'documentation') => 
                      setEditingTask(prev => prev ? ({ ...prev, category: value }) : null)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medical">Medical</SelectItem>
                      <SelectItem value="preparation">Preparation</SelectItem>
                      <SelectItem value="documentation">Documentation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-task-due-date">Due Date</Label>
                <Input
                  id="edit-task-due-date"
                  type="date"
                  value={editingTask.dueDate || ''}
                  onChange={(e) => setEditingTask(prev => prev ? ({ ...prev, dueDate: e.target.value || undefined }) : null)}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleEditTask}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteTask}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Task
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
