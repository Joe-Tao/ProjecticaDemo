'use client'

import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Zap, Filter, ArrowUpDown, LayoutGrid, Settings2 } from 'lucide-react';
import { useSession } from "next-auth/react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";

interface Member {
  id: string;
  name: string;
  email: string;
  image: string;
}

interface Task {
  id: string;
  name: string;
  assignee: string;
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low' | undefined;
  isEditing: boolean;
}

interface Section {
  id: string;
  name: string;
  icon: JSX.Element;
  isOpen: boolean;
  tasks: Task[];
}

// 修改默认的项目步骤模板
const defaultSections: Section[] = [
  {
    id: '1',
    name: 'Marketing initiation',
    icon: <Zap className="h-4 w-4 text-yellow-400" />,
    isOpen: true,
    tasks: [
      { id: '1-1', name: 'Project kickoff completed', assignee: '', dueDate: '', priority: undefined, isEditing: false },
      { id: '1-2', name: 'Define project scope and objectives', assignee: '', dueDate: '', priority: undefined, isEditing: false },
      { id: '1-3', name: 'Assign roles and responsibilities', assignee: '', dueDate: '', priority: 'Medium', isEditing: false },
    ]
  },
  {
    id: '2',
    name: 'Marketing execution',
    icon: <Zap className="h-4 w-4 text-yellow-400" />,
    isOpen: true,
    tasks: [
      { id: '2-1', name: 'Develop project timeline and milestones', assignee: '', dueDate: '', priority: 'High', isEditing: false },
      { id: '2-2', name: 'Set up project tracking tools', assignee: '', dueDate: '', priority: undefined, isEditing: false },
      { id: '2-3', name: 'Conduct weekly team check-ins', assignee: '', dueDate: '', priority: 'Medium', isEditing: false },
      { id: '2-4', name: 'Monitor project progress and adjust plans', assignee: '', dueDate: '', priority: undefined, isEditing: false },
    ]
  },
  {
    id: '3',
    name: 'Marketing closure',
    icon: <Zap className="h-4 w-4 text-yellow-400" />,
    isOpen: true,
    tasks: [
      { id: '3-1', name: 'Conduct project retrospective meeting', assignee: '', dueDate: '', priority: 'Medium', isEditing: false },
      { id: '3-2', name: 'Document lessons learned and best practices', assignee: '', dueDate: '', priority: undefined, isEditing: false },
    ]
  }
];

const Button = ({ children, variant = 'default', size = 'default', className = '', ...props }: { children: React.ReactNode, variant?: 'default' | 'outline', size?: 'default' | 'sm' | 'lg' | 'icon', className?: string, props?: React.ButtonHTMLAttributes<HTMLButtonElement> }) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background'
  const variantStyles = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-input hover:bg-accent hover:text-accent-foreground'
  }
  const sizeStyles = {
    default: 'h-10 py-2 px-4',
    sm: 'h-9 px-3 rounded-md',
    lg: 'h-11 px-8 rounded-md',
    icon: 'h-10 w-10'
  }
  
  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

interface TaskListProps {
  projectId: string;
  readOnly?: boolean;
  ownerEmail?: string;
}

export default function TaskList({ projectId, readOnly = false, ownerEmail }: TaskListProps) {
  const { data: session } = useSession();
  const [sections, setSections] = useState<Section[]>(defaultSections);
  const [members, setMembers] = useState<Member[]>([]);
  const [showDatePicker, setShowDatePicker] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // 加载项目成员
  useEffect(() => {
    const fetchMembers = async () => {
      if (!session?.user?.email) return;
      try {
        const membersRef = doc(db, "users", session.user.email, "projects", projectId, "members", "list");
        const membersDoc = await getDoc(membersRef);
        if (membersDoc.exists()) {
          setMembers(membersDoc.data().members || []);
        }
      } catch (error) {
        console.error("Error fetching members:", error);
      }
    };
    fetchMembers();
  }, [projectId, session?.user?.email]);

  // 修改数据获取逻辑
  useEffect(() => {
    const fetchSections = async () => {
      try {
        // 使用 ownerEmail（如果提供）或当前用户的邮箱
        const userEmail = ownerEmail || session?.user?.email;
        if (!userEmail) return;

        const sectionsRef = doc(db, "users", userEmail, "projects", projectId, "sections", "data");
        const sectionsDoc = await getDoc(sectionsRef);
        
        if (sectionsDoc.exists()) {
          const data = sectionsDoc.data();
          if (data && data.sections) {
            const loadedSections = data.sections.map((section: Section) => ({
              ...section,
              icon: <Zap className="h-4 w-4 text-yellow-400" />,
              tasks: section.tasks.map((task: Task) => ({
                ...task,
                isEditing: false
              }))
            }));
            setSections(loadedSections);
          }
        }
      } catch (error) {
        console.error("Error loading sections:", error);
      }
    };

    fetchSections();
  }, [projectId, session?.user?.email, ownerEmail]);

  // 修改 debounce 函数，专门用于处理 Section[] 类型
  function debounce(
    func: (sections: Section[]) => Promise<void>,
    delay: number
  ) {
    let timeoutId: NodeJS.Timeout | undefined;

    function debouncedFunction(sections: Section[]): void {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        func(sections);
      }, delay);
    }

    debouncedFunction.cancel = function(): void {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };

    return debouncedFunction;
  }

  // 修改 saveSectionsToDb 函数
  const saveSectionsToDb = async (updatedSections: Section[]): Promise<void> => {
    if (!session?.user?.email) {
      console.log("No user session found");
      return;
    }
    
    try {
      const sectionsData = updatedSections.map(section => ({
        id: section.id,
        name: section.name,
        isOpen: section.isOpen,
        tasks: section.tasks.map(task => ({
          id: task.id,
          name: task.name,
          assignee: task.assignee || '',
          dueDate: task.dueDate || '',
          priority: task.priority || null
        }))
      }));

      const docRef = doc(db, "users", session.user.email, "projects", projectId, "sections", "data");
      await setDoc(docRef, {
        sections: sectionsData,
        updatedAt: new Date().toISOString()
      });

      toast.success("Changes saved successfully!");
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving sections:", error);
      toast.error("Failed to save changes. Please try again.");
    }
  };

  // 创建防抖保存函数
  const debouncedSave = debounce(saveSectionsToDb, 1000);

  // 添加清理函数
  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, []);

  // 修改处理函数，添加只读检查
  const handleNameChange = (sectionId: string, taskId: string, newName: string) => {
    if (readOnly) return;  // 只读模式下不允许修改
    
    if (!newName.trim()) {
      toast.error("Task name cannot be empty");
      return;
    }

    const updatedSections = sections.map(section => ({
      ...section,
      tasks: section.tasks.map(task =>
        task.id === taskId ? { ...task, name: newName, isEditing: false } : task
      )
    }));
    setSections(updatedSections);
    setHasChanges(true);
    debouncedSave(updatedSections);
    toast.success("Task name updated");
  };

  const handleAssigneeChange = (sectionId: string, taskId: string, assigneeEmail: string) => {
    const updatedSections = sections.map(section => ({
      ...section,
      tasks: section.tasks.map(task =>
        task.id === taskId ? { ...task, assignee: assigneeEmail } : task
      )
    }));
    setSections(updatedSections);
    setHasChanges(true);
    debouncedSave(updatedSections);
  };

  const handleDueDateChange = (sectionId: string, taskId: string, date: Date) => {
    const updatedSections = sections.map(section => ({
      ...section,
      tasks: section.tasks.map(task =>
        task.id === taskId ? { 
          ...task, 
          dueDate: date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          })
        } : task
      )
    }));
    setSections(updatedSections);
    setHasChanges(true);
    debouncedSave(updatedSections);
    setShowDatePicker(null);
  };

  const handlePriorityChange = (sectionId: string, taskId: string, priority: 'High' | 'Medium' | 'Low' | undefined) => {
    const updatedSections = sections.map(section => ({
      ...section,
      tasks: section.tasks.map(task =>
        task.id === taskId ? { ...task, priority } : task
      )
    }));
    setSections(updatedSections);
    setHasChanges(true);
    debouncedSave(updatedSections);
  };

  const toggleSection = (sectionId: string) => {
    const updatedSections = sections.map(section => 
      section.id === sectionId ? { ...section, isOpen: !section.isOpen } : section
    );
    setSections(updatedSections);
    setHasChanges(true);
    debouncedSave(updatedSections);
  };

  // 修改 startEditing 函数
  const startEditing = (sectionId: string, taskId: string) => {
    if (readOnly) return;  // 只读模式下不允许编辑
    
    const updatedSections = sections.map(section => ({
      ...section,
      tasks: section.tasks.map(task => 
        task.id === taskId ? { ...task, isEditing: true } : { ...task, isEditing: false }
      )
    }));
    setSections(updatedSections);
  };

  // 添加取消编辑功能
  const handleCancelEdit = (sectionId: string, taskId: string) => {
    const updatedSections = sections.map(section => ({
      ...section,
      tasks: section.tasks.map(task =>
        task.id === taskId ? { ...task, isEditing: false } : task
      )
    }));
    setSections(updatedSections);
  };

  return (
    <div className="w-1/2">
      {/* 只在非只读模式下显示操作按钮 */}
      {!readOnly && (
        <div className="flex justify-between items-center mb-6">
          <div className="relative">
            <Button variant="outline" className="gap-2">
              + Add task
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <ArrowUpDown className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Settings2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* 表头 */}
      <div className="grid grid-cols-[1fr,120px,180px,120px,40px] gap-4 px-4 py-2 text-sm text-muted-foreground sticky top-0 bg-gray-800 z-10">
        <div>Task name</div>
        <div>Assignee</div>
        <div>Due date</div>
        <div>Priority</div>
        <div>+</div>
      </div>

      {/* 任务列表 */}
      <div className="space-y-4 mt-2 h-[calc(100vh-24rem)] overflow-y-auto">
        {sections.map(section => (
          <div key={section.id} className="space-y-1">
            {/* Section 标题 */}
            <button
              onClick={() => !readOnly && toggleSection(section.id)}
              className={`w-full flex items-center gap-2 px-4 py-2 ${
                !readOnly ? 'hover:bg-accent' : ''
              } rounded-md text-sm font-medium`}
            >
              {section.isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              {section.name}
              {section.icon}
            </button>

            {section.isOpen && (
              <div className="space-y-1">
                {section.tasks.map(task => (
                  <div
                    key={task.id}
                    className="grid grid-cols-[1fr,120px,180px,120px,40px] gap-4 px-4 py-2 hover:bg-accent rounded-md items-center"
                  >
                    {/* 任务名称 */}
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full border-2" />
                      {task.isEditing && !readOnly ? (
                        <div className="flex-1 flex items-center gap-2">
                          <input
                            type="text"
                            value={task.name}
                            onChange={(e) => {
                              if (readOnly) return;
                              const updatedSections = sections.map(section => ({
                                ...section,
                                tasks: section.tasks.map(t =>
                                  t.id === task.id ? { ...t, name: e.target.value } : t
                                )
                              }));
                              setSections(updatedSections);
                            }}
                            className="flex-1 bg-transparent focus:outline-none border border-gray-600 rounded px-2 py-1"
                            autoFocus
                            placeholder="Enter task name..."
                          />
                          <button
                            onClick={() => handleNameChange(section.id, task.id, task.name)}
                            className="text-green-500 hover:text-green-400 p-1"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => handleCancelEdit(section.id, task.id)}
                            className="text-red-500 hover:text-red-400 p-1"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => !readOnly && startEditing(section.id, task.id)}
                          className={`flex-1 ${!readOnly ? 'cursor-text hover:bg-gray-700/50' : ''} px-2 py-1 rounded`}
                        >
                          {task.name}
                        </div>
                      )}
                    </div>

                    {/* Assignee */}
                    <select
                      value={task.assignee}
                      onChange={(e) => !readOnly && handleAssigneeChange(section.id, task.id, e.target.value)}
                      disabled={readOnly}
                      className="w-full bg-transparent border border-gray-600 rounded-md p-1"
                    >
                      <option value="unassigned">Unassigned</option>
                      <option value="virtual-assistant">Virtual Assistant</option>
                      {members.map(member => (
                        <option key={member.id} value={member.email}>
                          {member.name}
                        </option>
                      ))}
                    </select>

                    {/* Due date */}
                    <div className="relative">
                      <div
                        onClick={() => !readOnly && setShowDatePicker(task.id)}
                        className={!readOnly ? 'cursor-pointer' : ''}
                      >
                        {task.dueDate || 'Set date'}
                      </div>
                      {showDatePicker === task.id && (
                        <div className="absolute z-50">
                          <DatePicker
                            selected={task.dueDate ? new Date(task.dueDate) : null}
                            onChange={(date) => date && handleDueDateChange(section.id, task.id, date)}
                            onClickOutside={() => setShowDatePicker(null)}
                            inline
                          />
                        </div>
                      )}
                    </div>

                    {/* Priority */}
                    <select
                      value={task.priority || ''}
                      onChange={(e) => !readOnly && handlePriorityChange(
                        section.id,
                        task.id,
                        e.target.value as 'High' | 'Medium' | 'Low' | undefined
                      )}
                      disabled={readOnly}
                      className="bg-transparent border border-gray-600 rounded-md p-1"
                    >
                      <option value="">No priority</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>

                    <div>+</div>
                  </div>
                ))}
                {/* 只在非只读模式下显示添加任务选项 */}
                {!readOnly && (
                  <div className="px-4 py-2 text-sm text-muted-foreground">
                    Add task...
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

