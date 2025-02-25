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

// create initial content
const initialBlocks: PartialBlock[] = [{
  type: "paragraph",
  content: "Start writing your project plan..."
}];

// save to firebase
async function saveToFirebase(blocks: Block[], userId: string, projectId: string) {
  const docRef = doc(db, 'users', userId, 'projects', projectId, 'projectPlan', 'plan');
  await setDoc(docRef, { content: blocks }, { merge: true });
}

// load from firebase
async function loadFromFirebase(userId: string, projectId: string): Promise<PartialBlock[] | undefined> {
  try {
    const docRef = doc(db, 'users', userId, 'projects', projectId, 'projectPlan', 'plan');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().content as PartialBlock[];
    } else {
      // if the document does not exist, create a new document
      await setDoc(docRef, { content: initialBlocks });
      return initialBlocks;
    }
  } catch (error) {
    console.error('Error loading project plan:', error);
    return initialBlocks;
  }
}

const ProjectPlanning = ({ projectId, userId }: ProjectPlanningProps) => {
  const [initialContent, setInitialContent] = useState<PartialBlock[] | undefined | "loading">("loading");
  const [error, setError] = useState<string | null>(null);

  // load content
  useEffect(() => {
    loadFromFirebase(userId, projectId)
      .then(content => {
        setInitialContent(content || initialBlocks);
      })
      .catch(err => {
        console.error('Error loading content:', err);
        setError('Failed to load project plan');
        setInitialContent(initialBlocks);
      });
  }, [userId, projectId]);

  // create editor instance
  const editor = useMemo(() => {
    if (initialContent === "loading") {
      return undefined;
    }
    return BlockNoteEditor.create({ initialContent: initialContent || initialBlocks });
  }, [initialContent]);

  // debounce save function
  const debouncedSave = useMemo(
    () => debounce((blocks: Block[]) => {
      saveToFirebase(blocks, userId, projectId).catch(err => {
        console.error('Error saving content:', err);
        setError('Failed to save, please try again later');
      });
    }, 1000),
    [userId, projectId]
  );

  if (editor === undefined) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="mt-4 border rounded-lg p-4 min-h-[500px] bg-white flex items-center justify-center">
          <div className="animate-pulse">Loading...</div>
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
      {error && (
        <div className="mt-2 p-3 bg-red-50 text-red-500 rounded-lg">
          {error}
        </div>
      )}
      <div className="mt-4 border rounded-lg p-4 min-h-[500px] bg-white">
        <BlockNoteView
          editor={editor}
          onChange={() => {
            setError(null);
            debouncedSave(editor.document);
          }}
        />
      </div>
    </div>
  );
};

export default ProjectPlanning; 