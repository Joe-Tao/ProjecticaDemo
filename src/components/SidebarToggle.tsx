"use client";
import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface SidebarToggleProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const SidebarToggle = ({ isCollapsed, onToggle }: SidebarToggleProps) => {
  return (
    <button
      onClick={onToggle}
      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-red text-gray-400 hover:text-white p-1 rounded-full shadow-lg z-50"
    >
      {isCollapsed ? <FiChevronRight size={20} /> : <FiChevronLeft size={20} />}
    </button>
  );
};

export default SidebarToggle; 