'use client';

import React, { useState, useEffect } from 'react';
import { doc, getDocs, setDoc, updateDoc, deleteDoc, collection } from 'firebase/firestore';
import { db } from '@/firebase';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { useParams } from 'next/navigation';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

type Task = {
  id: string;
  name: string;
  assignedTo: string;
  dueDate: string;
};

export default function TaskList() {
  const { data: session } = useSession();
  const params = useParams();
  const projectId = params.id as string;
  const userEmail = session?.user?.email || ''; // 从会话中获取用户邮箱

  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [taskData, setTaskData] = useState<Partial<Task>>({});
  const [newTaskData, setNewTaskData] = useState<Partial<Task>>({
    name: '',
    assignedTo: 'Virtual Assistant',
    dueDate: new Date().toISOString().split('T')[0],
  });

  const availableAssignees = ['Virtual Assistant']; 

  // 获取任务数据
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

  // 保存编辑后的任务
  const saveTask = async (id: string) => {
    if (!userEmail) return;
    try {
      const taskRef = doc(db, 'users', userEmail, 'projects', projectId, 'tasks', id);
      await updateDoc(taskRef, taskData);
      toast.success('Task updated successfully!');
      setEditingTask(null);
      setTaskData({});
      setTasks(tasks.map((task) => (task.id === id ? { ...task, ...taskData } : task)));
    } catch (error) {
      toast.error('Failed to update task.');
      console.error(error);
    }
  };

  // 删除任务
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

  // 添加新任务
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

  // 生成 Telegram 链接
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
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300 text-sm text-left">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="border border-gray-300 px-4 py-2">Task</th>
              <th className="border border-gray-300 px-4 py-2">Assigned To</th>
              <th className="border border-gray-300 px-4 py-2">Due Date</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-gray-50">
                {editingTask === task.id ? (
                  <>
                    <td className="border border-gray-300 px-4 py-2">
                      <input
                        type="text"
                        className="w-full border px-2 py-1"
                        value={taskData.name || task.name}
                        onChange={(e) => setTaskData({ ...taskData, name: e.target.value })}
                      />
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <select
                        className="w-full border px-2 py-1"
                        value={taskData.assignedTo || task.assignedTo}
                        onChange={(e) => setTaskData({ ...taskData, assignedTo: e.target.value })}
                      >
                        {availableAssignees.map((assignee) => (
                          <option key={assignee} value={assignee}>
                            {assignee}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <DatePicker
                        className="w-full border px-2 py-1"
                        selected={new Date(taskData.dueDate || task.dueDate)}
                        onChange={(date) =>
                          setTaskData({
                            ...taskData,
                            dueDate: date?.toISOString().split('T')[0] || '',
                          })
                        }
                        dateFormat="yyyy-MM-dd"
                      />
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <button
                        className="text-green-500 hover:underline"
                        onClick={() => saveTask(task.id)}
                      >
                        Save
                      </button>
                      <button
                        className="text-gray-500 hover:underline ml-2"
                        onClick={() => setEditingTask(null)}
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="border border-gray-300 px-4 py-2">{task.name}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      {task.assignedTo === 'Virtual Assistant' ? (
                        <a
                          href={getTelegramLink('Oksana242402')} // 替换为实际的 Telegram 用户名
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          {task.assignedTo}
                        </a>
                      ) : (
                        task.assignedTo
                      )}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">{task.dueDate}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <button
                        className="text-blue-500 hover:underline"
                        onClick={() => {
                          setEditingTask(task.id);
                          setTaskData(task);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-500 hover:underline ml-2"
                        onClick={() => deleteTask(task.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}