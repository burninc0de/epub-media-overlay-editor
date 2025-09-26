import React from 'react';
import { BookOpen, Volume2 } from 'lucide-react';
import { EPUBChapter } from '../types/epub';

interface ChapterListProps {
  chapters: EPUBChapter[];
  selectedChapter: string | null;
  onChapterSelect: (chapterId: string) => void;
}

export const ChapterList: React.FC<ChapterListProps> = ({
  chapters,
  selectedChapter,
  onChapterSelect
}) => {
  return (
    <div className="bg-white border-r border-gray-200 flex flex-col h-full dark:bg-gray-800 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center dark:text-white">
          <BookOpen className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
          Chapters
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {chapters.map((chapter) => (
          <button
            key={chapter.id}
            onClick={() => onChapterSelect(chapter.id)}
            className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 dark:border-gray-700 dark:hover:bg-gray-700 ${
              selectedChapter === chapter.id ? 'bg-blue-50 border-l-4 border-l-blue-600 dark:bg-blue-900 dark:border-l-blue-400' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate dark:text-white">{chapter.title}</h3>
                <p className="text-sm text-gray-500 mt-1 dark:text-gray-300">{chapter.href}</p>
              </div>
              {chapter.mediaOverlay && (
                <Volume2 className="w-4 h-4 text-green-600 ml-2 flex-shrink-0 dark:text-green-400" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};