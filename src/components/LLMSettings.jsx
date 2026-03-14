import { useState } from 'react';
import { getApiKey, setApiKey } from '../logic/llmCommentary';

export default function LLMSettings({ onClose }) {
  const [key, setKey] = useState(getApiKey());

  const handleSave = () => {
    setApiKey(key);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-6 w-96" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">AI Commentary Settings</h3>
        <p className="text-xs text-gray-500 mb-3">
          Enter your Anthropic API key to enable AI-generated commentary. Without a key, hardcoded commentary is used.
        </p>
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="sk-ant-..."
          className="input-field w-full mb-4"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1.5 text-xs bg-teal-600 text-white rounded-md hover:bg-teal-700 cursor-pointer"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
