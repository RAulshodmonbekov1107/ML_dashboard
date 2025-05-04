import React, { useState, useRef } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  buttonText?: string;
  dropzoneText?: string;
  accept?: string;
  multiple?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  buttonText = 'Select File',
  dropzoneText = 'or drag and drop your file here',
  accept = '*',
  multiple = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = event.target.files;
      if (!files || files.length === 0) {
        console.log('No files selected');
        return;
      }

      setUploadError(null);
      
      // Handle multiple or single files based on props
      if (multiple) {
        // Process multiple files if needed
        Array.from(files).forEach(file => {
          validateAndSelectFile(file);
        });
      } else {
        // Just handle the first file
        validateAndSelectFile(files[0]);
      }
    } catch (error) {
      console.error('Error handling file input:', error);
      setUploadError('Error processing the selected file');
    }
  };

  const validateAndSelectFile = (file: File) => {
    // Validate file type based on accept prop
    if (accept !== '*') {
      const acceptTypes = accept.split(',').map(type => type.trim());
      const fileType = file.type;
      
      // Handle special cases like image/* or application/*
      const isValidType = acceptTypes.some(type => {
        if (type.endsWith('/*')) {
          const category = type.split('/')[0];
          return fileType.startsWith(`${category}/`);
        }
        return type === fileType;
      });
      
      if (!isValidType) {
        setUploadError(`Invalid file type. Please select a ${accept} file.`);
        return;
      }
    }
    
    // Call the parent component's handler
    onFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setUploadError(null);
    
    const dt = e.dataTransfer;
    const files = dt.files;

    if (!files || files.length === 0) {
      console.log('No files dropped');
      return;
    }

    try {
      if (multiple) {
        Array.from(files).forEach(file => {
          validateAndSelectFile(file);
        });
      } else {
        validateAndSelectFile(files[0]);
      }
    } catch (error) {
      console.error('Error handling dropped file:', error);
      setUploadError('Error processing the dropped file');
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept={accept}
        multiple={multiple}
      />
      
      <div 
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <button
          type="button"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          {buttonText}
        </button>
        
        <p className="mt-2 text-sm text-gray-500">
          {dropzoneText}
        </p>
        
        {accept !== '*' && (
          <p className="mt-1 text-xs text-gray-400">
            Accepted file types: {accept.replace(/\*/g, 'all')}
          </p>
        )}
        
        {uploadError && (
          <p className="mt-2 text-xs text-red-500">
            {uploadError}
          </p>
        )}
      </div>
    </div>
  );
};

export default FileUpload; 