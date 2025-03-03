'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { doc, getDocs, setDoc, updateDoc, deleteDoc, collection } from 'firebase/firestore';
import { db } from '@/firebase';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { useParams } from 'next/navigation';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { systemAgents } from '@/config/systemAgents';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Agent {
  id?: string;
  name: string;
  description: string;
  model: string;
  instructions: string;
  isSystem?: boolean;
  userId?: string;
}

type Task = {
  id: string;
  name: string;
  assignedTo: string;
  dueDate: string;
  agentResponse?: string;
};

export default function TaskList() {
  const { data: session } = useSession();
  const params = useParams();
  const projectId = params.id as string;
  const userEmail = session?.user?.email || ''; 

  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [taskData, setTaskData] = useState<Partial<Task>>({});
  const [newTaskData, setNewTaskData] = useState<Partial<Task>>({
    name: '',
    assignedTo: 'Virtual Assistant',
    dueDate: new Date().toISOString().split('T')[0],
  });
  const [agents, setAgents] = useState<Agent[]>([]);
  const [automating, setAutomating] = useState(false);
  const [agentResponses, setAgentResponses] = useState<{[key: string]: string}>({});
  const [processingTasks, setProcessingTasks] = useState<{[key: string]: boolean}>({});

  const availableAssignees = useMemo(() => {
    return ['Virtual Assistant', ...agents.map(agent => agent.name)];
  }, [agents]);

  
  useEffect(() => {
    const fetchTasks = async () => {
      if (!userEmail) return;
      try {
        const tasksCollection = collection(db, 'users', userEmail, 'projects', projectId, 'tasks');
        const taskSnapshot = await getDocs(tasksCollection);
        const taskList = taskSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Task[];
        setTasks(taskList);
      } catch (error) {
        toast.error('Failed to fetch tasks.');
        console.error(error);
      }
    };
    fetchTasks();
  }, [userEmail, projectId]);

  // retrieve user agents
  useEffect(() => {
    const fetchAgents = async () => {
      if (!userEmail) return;
      try {
        setAgents([...systemAgents]);
      } catch (error) {
        console.error("Error fetching agents:", error);
        toast.error("Failed to load agents");
      }
    };

    fetchAgents();
  }, [userEmail]);

  //  saveTask function
  const saveTask = async (id: string) => {
    if (!userEmail || !taskData.name || !taskData.assignedTo || !taskData.dueDate) {
      toast.error('Please fill out all fields');
      return;
    }

    try {
      const taskRef = doc(db, 'users', userEmail, 'projects', projectId, 'tasks', id);
      await updateDoc(taskRef, {
        name: taskData.name,
        assignedTo: taskData.assignedTo,
        dueDate: taskData.dueDate
      });
      
      // update local state
      setTasks(tasks.map((task) => 
        task.id === id ? { ...task, ...taskData } : task
      ));
      
      toast.success('Task updated successfully!');
      setEditingTask(null);
      setTaskData({});
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  // delete task
  const deleteTask = async (id: string) => {
    if (!userEmail) return;

    const isConfirmed = window.confirm('Are you sure you want to delete this task?')
    if (!isConfirmed) return
    try {
      const taskRef = doc(db, 'users', userEmail, 'projects', projectId, 'tasks', id);
      await deleteDoc(taskRef);
      toast.success('Task deleted successfully!');
      setTasks(tasks.filter((task) => task.id !== id));
    } catch (error) {
      toast.error('Failed to delete task.');
      console.error(error);
    }
  };

  // add new task
  const addTask = async () => {
    if (!userEmail || !newTaskData.name || !newTaskData.dueDate) {
      toast.error('Please fill out all fields for the new task.');
      return;
    }
    try {
      const tasksCollection = collection(db, 'users', userEmail, 'projects', projectId, 'tasks');
      const newTaskRef = doc(tasksCollection);
      const newTask = { ...newTaskData, id: newTaskRef.id };
      await setDoc(newTaskRef, newTask);
      toast.success('Task added successfully!');
      setTasks([...tasks, newTask as Task]);
      setNewTaskData({
        name: '',
        assignedTo: 'Virtual Assistant',
        dueDate: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      toast.error('Failed to add task.');
      console.error(error);
    }
  };

  // handle single task running
  const handleSingleTask = async (task: Task) => {
    const agent = agents.find(a => a.name === task.assignedTo);
    if (!agent || !userEmail) {
      toast.error('Invalid agent or user not authenticated');
      return;
    }

    setProcessingTasks(prev => ({ ...prev, [task.id]: true }));
    
    try {
      let response;
      if (agent.name === "Market Research Expert") {
        response = await fetch(`/api/agent/market/search`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: task.name,
            taskId: task.id,
            projectId: projectId
          }),
        });
      } else {
        response = await fetch(`/api/agent/${agent.name.toLowerCase()}/task`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input: `Please help with this task: ${task.name}. Due date: ${task.dueDate}`,
            taskId: task.id,
            projectId: projectId
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API request failed: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      
      // 更新Firestore
      const taskRef = doc(db, 'users', userEmail, 'projects', projectId, 'tasks', task.id);
      const agentResponse = data.analysis || data.response;
      await updateDoc(taskRef, { agentResponse });
      
      // 更新本地状态
      setTasks(prevTasks => 
        prevTasks.map(t => 
          t.id === task.id 
            ? { ...t, agentResponse } 
            : t
        )
      );
      
      setAgentResponses(prev => ({
        ...prev,
        [task.id]: agentResponse
      }));

      toast.success('Task processed successfully');
    } catch (error) {
      console.error(`Error processing task ${task.id}:`, error);
      toast.error(error instanceof Error ? error.message : 'Failed to process task');
    } finally {
      setProcessingTasks(prev => ({ ...prev, [task.id]: false }));
    }
  };

  // automate all tasks
  const handleAutomate = async () => {
    if (!userEmail) return;
    setAutomating(true);

    try {
      // get tasks assigned to agents
      const agentTasks = tasks.filter(task => agents.some(agent => agent.name === task.assignedTo));
      
      // create separate processing promises for each task
      const taskPromises = agentTasks.map(async (task) => {
        const agent = agents.find(a => a.name === task.assignedTo);
        if (!agent || !agent.id) return;

        // set task to processing state
        setProcessingTasks(prev => ({ ...prev, [task.id]: true }));

        try {
          let response;
          if (agent.name === "Market Research Expert") {
            
            response = await fetch(`/api/agent/market`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                query: task.name,
                taskId: task.id,
                projectId: projectId
              }),
            });
          } else {
            // handle other agents
            response = await fetch(`/api/agent/${agent.id}/task`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                input: `Please help with this task: ${task.name}. Due date: ${task.dueDate}`,
                taskId: task.id
              }),
            });
          }

          if (response.ok) {
            const data = await response.json();
            // update task response
            const taskRef = doc(db, 'users', userEmail, 'projects', projectId, 'tasks', task.id);
            await updateDoc(taskRef, {
              agentResponse: data.analysis || data.response
            });
            
            // update response state
            setAgentResponses(prev => ({
              ...prev,
              [task.id]: data.analysis || data.response
            }));
          }
        } catch (error) {
          console.error(`Error processing task ${task.id}:`, error);
          toast.error(`Failed to process task: ${task.name}`);
        } finally {
          // clear processing state
          setProcessingTasks(prev => ({ ...prev, [task.id]: false }));
        }
      });

      // process all tasks in parallel
      await Promise.all(taskPromises);
      toast.success('Tasks automation completed');
    } catch (error) {
      console.error('Error automating tasks:', error);
      toast.error('Failed to complete task automation');
    } finally {
      setAutomating(false);
    }
  };

  // handle task response change
  const handleResponseChange = async (taskId: string, newResponse: string) => {
    if (!userEmail) return;
    
    try {
      const taskRef = doc(db, 'users', userEmail, 'projects', projectId, 'tasks', taskId);
      await updateDoc(taskRef, {
        agentResponse: newResponse
      });
      setAgentResponses(prev => ({
        ...prev,
        [taskId]: newResponse
      }));
      // toast.success('Response updated');
    } catch (error) {
      console.error('Error updating response:', error);
      toast.error('Failed to update response');
    }
  };

  // generate Telegram link
  const getTelegramLink = (username: string) => {
    return `https://t.me/${username}`;
  };

  return (
    <div className="w-3/4 mx-auto">
      <div className="my-4">
        <h2 className="text-lg font-bold mb-2">Add New Task</h2>
        <div className="flex flex-col gap-4 mb-4">
          <DatePicker
            className="w-1/4 border px-2 py-1"
            selected={new Date(newTaskData.dueDate || '')}
            onChange={(date) =>
              setNewTaskData({
                ...newTaskData,
                dueDate: date?.toISOString().split('T')[0] || '',
              })
            }
            dateFormat="yyyy-MM-dd"
          />
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Task Name"
              className="w-1/4 border px-2 py-1"
              value={newTaskData.name}
              onChange={(e) => setNewTaskData({ ...newTaskData, name: e.target.value })}
            />
            <select
              className="w-1/4 border px-2 py-1"
              value={newTaskData.assignedTo}
              onChange={(e) => setNewTaskData({ ...newTaskData, assignedTo: e.target.value })}
            >
              {availableAssignees.map((assignee) => (
                <option key={assignee} value={assignee}>
                  {assignee}
                </option>
              ))}
            </select>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={addTask}
            >
              +
            </button>
          </div>
        </div>
      </div>
      <div className="mb-4 flex justify-end">
        <button
          onClick={handleAutomate}
          disabled={automating}
          className="bg-blue-500 text-gray-700 px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {automating ? 'Processing...' : 'Automate Tasks'}
        </button>
      </div>
      <div className="space-y-4">
        {tasks.map((task) => {
          const isProcessing = processingTasks[task.id];
          const hasResponse = agentResponses[task.id];
          const isAgent = agents.some(a => a.name === task.assignedTo);

          return (
            <div key={task.id} className="bg-white rounded-lg p-4 shadow">
              <div className="flex justify-between items-start mb-2">
                <div>
                  {editingTask === task.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={taskData.name || ''}
                        onChange={(e) => setTaskData({ ...taskData, name: e.target.value })}
                        className="w-full border rounded px-2 py-1"
                        placeholder="Task name"
                      />
                      <select
                        value={taskData.assignedTo || ''}
                        onChange={(e) => setTaskData({ ...taskData, assignedTo: e.target.value })}
                        className="w-full border rounded px-2 py-1"
                      >
                        {availableAssignees.map((assignee) => (
                          <option key={assignee} value={assignee}>
                            {assignee}
                          </option>
                        ))}
                      </select>
                      <DatePicker
                        selected={taskData.dueDate ? new Date(taskData.dueDate) : null}
                        onChange={(date) =>
                          setTaskData({
                            ...taskData,
                            dueDate: date ? date.toISOString().split('T')[0] : '',
                          })
                        }
                        dateFormat="yyyy-MM-dd"
                        className="w-full border rounded px-2 py-1"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => saveTask(task.id)}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingTask(null);
                            setTaskData({});
                          }}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h4 className="font-medium">{task.name}</h4>
                      <p className="text-sm text-gray-600">Assigned to: {task.assignedTo}</p>
                      <p className="text-sm text-gray-600">Due date: {task.dueDate}</p>
                    </>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {isProcessing && (
                    <span className="text-blue-500">Processing...</span>
                  )}
                  {task.assignedTo === 'Virtual Assistant' ? (
                    <a
                      href={getTelegramLink('Oksana242402')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      Contact
                    </a>
                  ) : isAgent && !editingTask && (
                    <button
                      onClick={() => handleSingleTask(task)}
                      disabled={isProcessing}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
                    >
                      Run
                    </button>
                  )}
                  {!editingTask && (
                    <>
                      <button
                        onClick={() => {
                          setEditingTask(task.id);
                          setTaskData(task);
                        }}
                        className="px-2 py-1 text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                         
                            deleteTask(task.id);
                          
                        }}
                        className="px-2 py-1 text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              {(hasResponse || task.agentResponse) && (
                <div className="mt-4 bg-gray-50 rounded p-4">
                    <ReactMarkdown className="prose max-w-none text-black prose-h1:text-black prose-h2:text-black prose-h3:text-black" remarkPlugins={[remarkGfm]}>
                      {agentResponses[task.id] || task.agentResponse}
                    </ReactMarkdown>

                                    {/* <textarea
                    className="w-full min-h-[100px] p-2 border rounded text-gray-800"
                    value={agentResponses[task.id] || task.agentResponse}
                    onChange={(e) => handleResponseChange(task.id, e.target.value)}
                    placeholder="Agent response..."
                  /> */}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}