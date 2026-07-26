'use client';

import React, { useState } from 'react';
import { X, FileCode, Save, Play } from 'lucide-react';

interface ScriptEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  scriptCode: string;
  onSaveScript: (newCode: string) => void;
}

export const ScriptEditorModal: React.FC<ScriptEditorModalProps> = ({
  isOpen,
  onClose,
  scriptCode,
  onSaveScript,
}) => {
  const [code, setCode] = useState(scriptCode);

  if (!isOpen) return null;

  const lines = code.split('\n');

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0f132e] border border-[#2b335c] rounded-xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden shadow-2xl text-zinc-200">
        {/* Header */}
        <div className="p-3 border-b border-[#2b335c] flex items-center justify-between bg-[#14193d]">
          <div className="flex items-center space-x-2">
            <FileCode size={18} className="text-cyan-400" />
            <span className="font-semibold text-xs text-white font-mono">PlayerController.ts</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onSaveScript(code);
                onClose();
              }}
              className="flex items-center space-x-1.5 px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition shadow"
            >
              <Save size={13} />
              <span>Save Code</span>
            </button>
            <button onClick={onClose} className="p-1 hover:bg-[#2b335c] rounded text-zinc-400 hover:text-white">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Code Editor Box */}
        <div className="flex-1 flex overflow-hidden font-mono text-xs bg-[#090c21]">
          {/* Line Numbers */}
          <div className="w-12 py-3 bg-[#0d1029] border-r border-[#1f264e] text-right pr-3 select-none text-zinc-600 space-y-1">
            {lines.map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>

          {/* Code Textarea */}
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            className="flex-1 p-3 bg-transparent text-cyan-200 focus:outline-none resize-none leading-relaxed custom-scrollbar font-mono"
          />
        </div>
      </div>
    </div>
  );
};
