'use client';

import { Block, BlockNoteEditor, PartialBlock } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import "@blocknote/core/fonts/inter.css";
import { useEffect, useMemo, useState } from 'react';
import { db } from '@/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import debounce from 'lodash/debounce';
import { FiFileText } from 'react-icons/fi';

interface ProjectPlanningProps {
  projectId: string;
  userId: string;
}

// save to firebase
async function saveToFirebase(blocks: Block[], userId: string, projectId: string) {
  const docRef = doc(db, 'users', userId, 'projects', projectId, 'projectPlan', 'plan');
  await setDoc(docRef, { content: blocks }, { merge: true });
}

// load from firebase
async function loadFromFirebase(userId: string, projectId: string) {
  const docRef = doc(db, 'users', userId, 'projects', projectId, 'projectPlan', 'plan');
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data().content as PartialBlock[]) : undefined;
}

const ProjectPlanning = ({ projectId, userId }: ProjectPlanningProps) => {
  const [initialContent, setInitialContent] = useState<PartialBlock[] | undefined | "loading">("loading");

  // load from firebase
  useEffect(() => {
    loadFromFirebase(userId, projectId).then((content) => {
      setInitialContent(content);
    });
  }, [userId, projectId]);

  // create editor instance
  const editor = useMemo(() => {
    if (initialContent === "loading") {
      return undefined;
    }
    return BlockNoteEditor.create({ initialContent });
  }, [initialContent]);

  // debounce save function
  const debouncedSave = useMemo(
    () => debounce((blocks: Block[]) => {
      saveToFirebase(blocks, userId, projectId);
    }, 1000),
    [userId, projectId]
  );

  if (editor === undefined) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="mt-4 border rounded-lg p-4 min-h-[500px] bg-white flex items-center justify-center">
          loading...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FiFileText className="w-5 h-5 text-blue-500" />
            Project Plan
        </h2>
      <div className="mt-4 border rounded-lg p-4 min-h-[500px] bg-white">
        <BlockNoteView
          editor={editor}
          onChange={() => {
            debouncedSave(editor.document);
          }}
        />
      </div>
    </div>
  );
};

export default ProjectPlanning; 