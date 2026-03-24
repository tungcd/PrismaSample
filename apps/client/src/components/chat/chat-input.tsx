"use client";

import React, { useState, useRef, useEffect } from "react";
import { EmojiPicker } from "./emoji-picker";
import { FileUploadManager } from "./file-upload-manager";

interface FileAttachment {
  url: string;
  type: string;
  name: string;
}

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (attachments?: FileAttachment[]) => void;
  onTyping: () => void;
  onStopTyping: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  onTyping,
  onStopTyping,
  disabled = false,
  placeholder = "Type a message...",
}: ChatInputProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = inputRef.current.scrollHeight + "px";
    }
  }, [value]);

  const handleEmojiSelect = (emoji: string) => {
    onChange(value + emoji);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && (value.trim() || attachments.length > 0)) {
        handleSend();
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    onTyping();
  };

  const handleSend = () => {
    if (disabled || (!value.trim() && attachments.length === 0)) return;
    onSend(attachments.length > 0 ? attachments : undefined);
    setAttachments([]);
  };

  const handleFileUploaded = (fileUrl: string, fileType: string, fileName: string) => {
    setAttachments((prev) => [...prev, { url: fileUrl, type: fileType, name: fileName }]);
    setShowFileUpload(false);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="border-t bg-white">
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="px-4 pt-3 pb-2 bg-gray-50 border-b">
          <div className="flex flex-wrap gap-2">
            {attachments.map((attachment, index) => (
              <div
                key={index}
                className="relative bg-white rounded border border-gray-200 p-2 flex items-center gap-2 pr-8"
              >
                {attachment.type.startsWith("image/") ? (
                  <img
                    src={attachment.url}
                    alt={attachment.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                    {attachment.name}
                  </div>
                </div>
                <button
                  onClick={() => removeAttachment(index)}
                  className="absolute top-1 right-1 p-1 bg-gray-200 hover:bg-gray-300 rounded-full"
                >
                  <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File Upload Manager */}
      {showFileUpload && (
        <div className="px-4 pt-3 pb-2 bg-gray-50 border-b">
          <FileUploadManager
            onFileUploaded={handleFileUploaded}
            maxFiles={5}
            maxFileSize={10 * 1024 * 1024}
          />
          <button
            onClick={() => setShowFileUpload(false)}
            className="mt-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="p-4">
      <div className="flex items-end space-x-2">
        {/* Emoji Picker Button */}
        <div className="relative flex-shrink-0">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>

          {showEmojiPicker && (
            <EmojiPicker
              onEmojiSelect={handleEmojiSelect}
              onClose={() => setShowEmojiPicker(false)}
            />
          )}
        </div>

        {/* Attach File Button */}
        <button
          type="button"
          onClick={() => setShowFileUpload(!showFileUpload)}
          className="p-2 hover:bg-gray-100 rounded-full flex-shrink-0 transition-colors"
          title="Attach file"
        >
          <svg
            className="w-6 h-6 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
            />
          </svg>
        </button>

        {/* Text input */}
        <div className="flex-1 bg-gray-100 rounded-lg px-4 py-2">
          <textarea
            ref={inputRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full bg-transparent outline-none resize-none max-h-32 text-gray-900 disabled:opacity-50"
            rows={1}
          />
        </div>

        {/* Send button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={disabled || (!value.trim() && attachments.length === 0)}
          className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-full flex-shrink-0 transition-colors"
        >
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </div>
    </div>
    </div>
  );
}
