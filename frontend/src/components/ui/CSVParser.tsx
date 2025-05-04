import React, { useState } from 'react';
import FileUpload from './FileUpload';
import Papa from 'papaparse';

interface CSVData {
  headers: string[];
  rows: string[][];
}

interface CSVParserProps {
  onDataParsed: (data: CSVData) => void;
  label?: string;
  description?: string;
  className?: string;
}

const CSVParser: React.FC<CSVParserProps> = ({
  onDataParsed,
  label = 'Upload CSV Data',
  description = 'Upload a CSV file to analyze',
  className = ''
}) => {
  const [csvData, setCsvData] = useState<CSVData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const parseCSV = (file: File) => {
    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          if (results.data.length < 2) {
            throw new Error('CSV file must have at least headers and one data row');
          }
          
          // Convert all data to strings
          const data = results.data as string[][];
          
          // Extract headers from the first row
          const headers = data[0];
          
          // Get the rest of the rows
          const rows = data.slice(1);
          
          const parsedData = { headers, rows };
          setCsvData(parsedData);
          setError(null);
          onDataParsed(parsedData);
        } catch (error) {
          if (error instanceof Error) {
            setError(error.message);
          } else {
            setError('Failed to parse CSV file');
          }
          setCsvData(null);
        }
      },
      error: (error) => {
        setError(`Error parsing CSV: ${error.message}`);
        setCsvData(null);
      }
    });
  };

  const handleFileUpload = (file: File) => {
    // Accept any file with .csv extension or text/csv MIME type
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      setError('Please upload a valid CSV file');
      setCsvData(null);
      return;
    }
    
    parseCSV(file);
  };

  return (
    <div className={className}>
      <div className="mb-6">
        <FileUpload
          accept=".csv"
          onFileSelect={handleFileUpload}
          buttonText="Upload CSV File"
          dropzoneText="or drag and drop your CSV here"
        />
      </div>
      
      {error && (
        <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
          {error}
        </div>
      )}
      
      {csvData && (
        <div className="mt-4 overflow-x-auto">
          <h4 className="text-sm font-medium text-gray-700 mb-2">CSV Preview (first 5 rows)</h4>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {csvData.headers.map((header, index) => (
                  <th 
                    key={index}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {csvData.rows.slice(0, 5).map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td 
                      key={cellIndex}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          
          {csvData.rows.length > 5 && (
            <p className="mt-2 text-sm text-gray-500">
              Showing 5 of {csvData.rows.length} rows
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CSVParser; 