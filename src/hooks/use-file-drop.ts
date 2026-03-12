import { useState, useCallback, type DragEvent } from 'react';

interface UseFileDropOptions {
  onFile: (content: string, fileName: string) => void;
  accept?: string;
}

export function useFileDrop({ onFile, accept = '.xml' }: UseFileDropOptions) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const readFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (content) {
          onFile(content, file.name);
        }
      };
      reader.readAsText(file, 'UTF-8');
    },
    [onFile]
  );

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        readFile(files[0]);
      }
    },
    [readFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        readFile(files[0]);
      }
    },
    [readFile]
  );

  return {
    isDragging,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileInput,
    accept,
  };
}
