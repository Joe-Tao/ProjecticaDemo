import { div } from "framer-motion/client";
import React from "react";

interface Props {
  onClick?: () => void;
}

const SavePlanButton = ({ onClick }: Props) => {
  return (
    <div className="flex items-center gap-1">
      <button 
        onClick={onClick}
        className="text-sm text-gray-400 hover:text-gray-300"
      >
        Include in plan
      </button>
    </div>
  );
};

export default SavePlanButton;
