import React, { useState } from 'react';
import './ContentViewer.css';
import { Scissors, AlignJustify, Text, Code } from 'lucide-react';
import { EPUBChapter, SMILFragment } from '../types/epub';

import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';
import 'prismjs/components/prism-markup';

interface ContentViewerProps {
  chapter: EPUBChapter | null;
  fragments: SMILFragment[];
  selectedFragment: SMILFragment | null;
  onFragmentSelect: (fragment: SMILFragment) => void;
  isCutToolActive: boolean;
  setIsCutToolActive: (isActive: boolean) => void;
  onFragmentSplitByText: (fragmentId: string, splitIndex: number) => void;
  onHtmlUpdate?: (newHtml: string) => void;
  isHtmlEditMode: boolean;
  setIsHtmlEditMode: React.Dispatch<React.SetStateAction<boolean>>;
  isBlockDisplay: boolean;
  setIsBlockDisplay: (isBlock: boolean) => void;
}

export const ContentViewer: React.FC<ContentViewerProps> = ({
  chapter,
  fragments,
  selectedFragment,
  onFragmentSelect,
  isCutToolActive,
  setIsCutToolActive,
  onFragmentSplitByText,
  onHtmlUpdate,
  isHtmlEditMode,
  setIsHtmlEditMode,
  isBlockDisplay,
  setIsBlockDisplay
}) => {
  const [editedHtml, setEditedHtml] = useState<string | null>(null);

  if (!chapter) {
    return (
      <div className="flex-1 bg-gray-50 flex items-center justify-center dark:bg-gray-800">
        <p className="text-gray-600 dark:text-gray-300">Select a chapter to view its content</p>
      </div>
    );
  }

  const getHighlightedContent = () => {
    if (!chapter.content) return '';

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(chapter.content, 'text/html');

      fragments.forEach((fragment) => {
        const textSrc = fragment.textSrc;
        if (!textSrc || !textSrc.includes('#')) return;

        const id = textSrc.split('#')[1];
        if (!id) return;

        const element = doc.getElementById(id);
        if (element) {
          const isSelected = selectedFragment?.id === fragment.id;
          const wrapper = doc.createElement('span');
          wrapper.setAttribute('data-fragment-id', fragment.id);
          let className = isSelected
            ? 'bg-blue-200 dark:bg-blue-800 border border-blue-400 dark:border-blue-600 rounded px-1'
            : `${isBlockDisplay ? 'block ' : ''}bg-gray-100 dark:bg-gray-800 border border-green-300 w-fit ${isBlockDisplay ? 'my-2 ' : ''}dark:border-gray-600 rounded px-1 hover:bg-green-200 dark:hover:bg-gray-700`;

          if (isCutToolActive) {
            className += ' cursor-crosshair';
          } else {
            className += ' cursor-pointer';
          }

          wrapper.className = className;
          
          // Move children from original element to wrapper
          while (element.firstChild) {
            wrapper.appendChild(element.firstChild);
          }
          // Append wrapper to the now-empty element
          element.appendChild(wrapper);
        }
      });

      return doc.body.innerHTML;
    } catch (error) {
      console.error("Error parsing or modifying chapter content:", error);
      return chapter.content; // Fallback to original content on error
    }
  };

  const handleContentClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const fragmentWrapper = target.closest('[data-fragment-id]');
    if (!fragmentWrapper) return;

    const fragmentId = fragmentWrapper.getAttribute('data-fragment-id');
    if (!fragmentId) return;

    if (isCutToolActive) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(fragmentWrapper);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        const splitIndex = preCaretRange.toString().length;
        
        onFragmentSplitByText(fragmentId, splitIndex);
        setIsCutToolActive(false); // Deactivate tool after use
      }
    } else {
      const fragment = fragments.find(f => f.id === fragmentId);
      if (fragment) {
        onFragmentSelect(fragment);
      }
    }
  };

  return (
    <div className="content-viewer flex-1 bg-white flex flex-col dark:bg-gray-900">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 z-10 bg-white dark:bg-gray-900">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{chapter.title}</h2>
          <p className="text-sm text-gray-600 mt-1 dark:text-gray-300">{chapter.href}</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsCutToolActive(!isCutToolActive)}
            className={`p-2 rounded-md transition-colors ${
              isCutToolActive 
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
            }`}
            title={isCutToolActive ? 'Deactivate Cut Tool' : 'Activate Cut Tool'}
          >
            <Scissors className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsBlockDisplay(!isBlockDisplay)}
            className={`p-2 rounded-md transition-colors ${
              'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
            }`}
            title={isBlockDisplay ? 'Show fragments in flow text' : 'Show fragments as lines'}
          >
            {isBlockDisplay ? <AlignJustify className="w-5 h-5" /> : <Text className="w-5 h-5" />}
          </button>
          <button
            onClick={() => {
              if (!isHtmlEditMode) setEditedHtml(chapter.content);
              setIsHtmlEditMode((v) => !v);
            }}
            className={`p-2 rounded-md transition-colors ${
              isHtmlEditMode
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
            }`}
            title={isHtmlEditMode ? 'Exit HTML Edit Mode' : 'Edit HTML Source'}
          >
            <Code className="w-5 h-5" />
          </button>
          {isHtmlEditMode && (
            <>
              <button
                className="ml-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => {
                  if (editedHtml && onHtmlUpdate) {
                    onHtmlUpdate(editedHtml);
                  }
                  setIsHtmlEditMode(false);
                }}
              >Save</button>
              <button
                className="ml-1 px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
                onClick={() => {
                  setIsHtmlEditMode(false);
                  setEditedHtml(null);
                }}
              >Cancel</button>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {isHtmlEditMode && editedHtml !== null ? (
          <Editor
            value={editedHtml}
            onValueChange={setEditedHtml}
            highlight={code => Prism.highlight(code, Prism.languages.markup, 'markup')}
            padding={12}
            style={{
              fontFamily: 'Fira Mono, Menlo, Monaco, Consolas, monospace',
              fontSize: 14,
              minHeight: 300,
              background: '#1a202c',
              color: '#f8f8f2',
              borderRadius: 8,
              marginBottom: 16
            }}
            textareaId="html-editor"
            textareaClassName="w-full border border-gray-300 dark:border-gray-700 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <div 
            className="prose max-w-none dark:prose-invert"
            onClick={handleContentClick}
            dangerouslySetInnerHTML={{ __html: getHighlightedContent() }}
          />
        )}
      </div>

      {fragments.length > 0 && (
        <div className="border-t border-gray-200 p-4 dark:border-gray-700">
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
            <span className="ml-auto">{fragments.length} fragments total</span>
          </div>
        </div>
      )}
    </div>
  );
};