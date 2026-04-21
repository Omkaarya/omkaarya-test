"use client";
import React, { useState } from "react";
import { Icon } from "@/components/atoms/Icon";
import { UploadCloud01Icon, File02Icon, CheckCircleIcon, AlertCircleIcon, Trash01Icon, RefreshCcw01Icon } from "@/icons/duotone";

export interface FileUploadProps {
  onFilesSelected?: (files: File[]) => void;
  maxSizeMB?: number;
  accept?: string;
  className?: string;
}

export const FileUploadDropzone: React.FC<FileUploadProps> = ({
  onFilesSelected,
  maxSizeMB = 10,
  accept,
  className = "",
}) => {
  const [isDragActive, setIsDragActive] = useState(false);

  return (
    <div
      className={`
        w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-8 transition-colors cursor-pointer
        ${isDragActive ? "border-brand bg-brand/5" : "border-border bg-surface hover:bg-subtle"}
        ${className}
      `}
      onDragEnter={() => setIsDragActive(true)}
      onDragLeave={() => setIsDragActive(false)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragActive(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) onFilesSelected?.(files);
      }}
    >
      <div className="h-10 w-10 flex items-center justify-center rounded-full bg-subtle text-text-secondary mb-4 shadow-xs border border-border">
        <Icon icon={UploadCloud01Icon} size="md" />
      </div>
      <p className="text-sm font-semibold text-text-primary mb-1">
        <span className="text-brand">Click to upload</span> or drag and drop
      </p>
      <p className="text-xs text-text-tertiary">
        SVG, PNG, JPG or GIF (max. 800x400px)
      </p>
    </div>
  );
};

export type FileUploadState = "uploading" | "complete" | "failed";

export interface FileUploadItemProps {
  fileName: string;
  fileSize: string; // e.g. "200 KB"
  progress?: number; // 0-100
  state?: FileUploadState;
  onRemove?: () => void;
  onRetry?: () => void;
}

export const FileUploadItem: React.FC<FileUploadItemProps> = ({
  fileName,
  fileSize,
  progress = 0,
  state = "complete",
  onRemove,
  onRetry,
}) => {
  const isFailed = state === "failed";
  const isUploading = state === "uploading";
  const isComplete = state === "complete";

  return (
    <div className={`relative w-full p-4 rounded-xl border transition-colors ${isFailed ? "border-status-danger-border bg-status-danger-bg/5" : "border-border bg-surface"}`}>
      
      <div className="flex items-start gap-4">
        {/* File Icon */}
        <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-lg bg-red-100 text-status-danger-text">
           {/* Mocking a generic PDF icon visual */}
           <Icon icon={File02Icon} size="md" />
        </div>

        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <div className="flex flex-col min-w-0 pr-4">
               <span className={`text-sm font-semibold truncate ${isFailed ? "text-status-danger-text" : "text-text-primary"}`}>
                 {fileName}
               </span>
               <span className="text-xs text-text-tertiary mt-0.5">
                 {fileSize}
                 {isUploading && <span className="ml-2">— {progress}% uploading</span>}
                 {isComplete && <span className="ml-2 text-status-success-text flex items-center inline-flex gap-1"><Icon icon={CheckCircleIcon} size="sm" /> Complete</span>}
                 {isFailed && <span className="ml-2 text-status-danger-text">— Failed</span>}
               </span>
            </div>
            
            <button onClick={onRemove} className="text-text-tertiary hover:text-text-secondary transition-colors p-1">
              <Icon icon={Trash01Icon} size="sm" />
            </button>
          </div>

          {/* Progress Bar or Action */}
          {isUploading && (
            <div className="w-full h-2 bg-subtle rounded-full overflow-hidden mt-2">
              <div 
                className="h-full bg-brand transition-all duration-300 rounded-full" 
                style={{ width: `${progress}%` }} 
              />
            </div>
          )}

          {isFailed && (
            <button 
              onClick={onRetry}
              className="text-sm font-semibold text-status-danger-text text-left mt-2 hover:opacity-80 transition-opacity flex items-center gap-1.5"
            >
              <Icon icon={RefreshCcw01Icon} size="sm" /> Try again
            </button>
          )}

        </div>
      </div>
    </div>
  );
};
