"use client";

import React, { useRef, useState } from "react";
import { chatApi } from "@/lib/api/chat-api";

interface FileUpload {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  fileUrl?: string;
  error?: string;
}

interface FileUploadManagerProps {
  onFileUploaded: (fileUrl: string, fileType: string, fileName: string) => void;
  maxFiles?: number;
  maxFileSize?: number; // in bytes
}

export function FileUploadManager({
  onFileUploaded,
  maxFiles = 5,
  maxFileSize = 10 * 1024 * 1024, // 10MB
}: FileUploadManagerProps) {
  const [uploads, setUploads] = useState<FileUpload[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;
    
    // Check file count
    if (uploads.length + files.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Check file sizes
    for (const file of files) {
      if (file.size > maxFileSize) {
        alert(`File ${file.name} exceeds ${maxFileSize / 1024 / 1024}MB limit`);
        return;
      }
    }

    // Create upload entries
    const newUploads: FileUpload[] = files.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      progress: 0,
      status: "pending" as const,
    }));

    setUploads((prev) => [...prev, ...newUploads]);

    // Start uploading
    for (const upload of newUploads) {
      await uploadFile(upload);
    }

    // Clear input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadFile = async (upload: FileUpload) => {
    try {
      // Update status to uploading
      setUploads((prev) =>
        prev.map((u) =>
          u.id === upload.id ? { ...u, status: "uploading" as const } : u
        )
      );

      // Get presigned URL
      const presignedData = await chatApi.getPresignedUploadUrl({
        fileName: upload.file.name,
        fileType: upload.file.type,
        fileSize: upload.file.size,
      });

      // Upload file to S3 (or mock URL)
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploads((prev) =>
            prev.map((u) => (u.id === upload.id ? { ...u, progress } : u))
          );
        }
      });

      await new Promise<void>((resolve, reject) => {
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Upload failed"));
        });

        xhr.open("PUT", presignedData.uploadUrl);
        xhr.setRequestHeader("Content-Type", upload.file.type);
        xhr.send(upload.file);
      });

      // Update status to success
      setUploads((prev) =>
        prev.map((u) =>
          u.id === upload.id
            ? {
                ...u,
                status: "success" as const,
                progress: 100,
                fileUrl: presignedData.fileUrl,
              }
            : u
        )
      );

      // Notify parent
      onFileUploaded(
        presignedData.fileUrl,
        upload.file.type,
        upload.file.name
      );
    } catch (error) {
      console.error("Upload error:", error);
      setUploads((prev) =>
        prev.map((u) =>
          u.id === upload.id
            ? {
                ...u,
                status: "error" as const,
                error: (error as Error).message || "Upload failed",
              }
            : u
        )
      );
    }
  };

  const removeUpload = (id: string) => {
    setUploads((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <div className="space-y-2">
      {/* Upload list */}
      {uploads.length > 0 && (
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {uploads.map((upload) => (
            <div
              key={upload.id}
              className="flex items-center gap-2 bg-gray-100 rounded p-2"
            >
              {/* File icon */}
              <div className="flex-shrink-0">
                {upload.file.type.startsWith("image/") ? (
                  <svg
                    className="w-5 h-5 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                )}
              </div>

              {/* File info */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {upload.file.name}
                </div>
                <div className="text-xs text-gray-500">
                  {(upload.file.size / 1024).toFixed(1)} KB
                </div>

                {/* Progress bar */}
                {upload.status === "uploading" && (
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-1">
                    <div
                      className="bg-blue-600 h-1 rounded-full transition-all"
                      style={{ width: `${upload.progress}%` }}
                    />
                  </div>
                )}

                {/* Error message */}
                {upload.status === "error" && (
                  <div className="text-xs text-red-600 mt-1">
                    {upload.error}
                  </div>
                )}
              </div>

              {/* Status icon / Remove button */}
              <div className="flex-shrink-0">
                {upload.status === "success" && (
                  <svg
                    className="w-5 h-5 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}

                {upload.status === "uploading" && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                )}

                {(upload.status === "pending" || upload.status === "error") && (
                  <button
                    onClick={() => removeUpload(upload.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
      />

      {/* Trigger button (optional - can be triggered from parent) */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="hidden" // Hidden because we'll trigger from ChatInput
      >
        Upload Files
      </button>
    </div>
  );
}

// Hook for easier usage
export function useFileUpload() {
  const [uploads, setUploads] = useState<FileUpload[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerFilePicker = () => {
    fileInputRef.current?.click();
  };

  return {
    uploads,
    triggerFilePicker,
    fileInputRef,
  };
}
