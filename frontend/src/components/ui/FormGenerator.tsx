import React, { useState, useEffect } from 'react';

interface FormField {
  name: string;
  label: string;
  type: 'number' | 'text' | 'select' | 'range' | 'checkbox';
  defaultValue?: any;
  min?: number;
  max?: number;
  step?: number;
  options?: Array<{ value: string | number; label: string }>;
  unit?: string;
}

interface FormGeneratorProps {
  fields: FormField[];
  onSubmit: (formData: Record<string, any>) => void;
  loading: boolean;
  submitButtonText?: string;
}

const FormGenerator: React.FC<FormGeneratorProps> = ({
  fields,
  onSubmit,
  loading,
  submitButtonText = 'Submit'
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});

  // Initialize form data with default values
  useEffect(() => {
    const initialData: Record<string, any> = {};
    fields.forEach(field => {
      initialData[field.name] = field.defaultValue !== undefined ? field.defaultValue : 
        field.type === 'checkbox' ? false : 
        field.type === 'number' || field.type === 'range' ? 0 : '';
    });
    setFormData(initialData);
  }, [fields]);

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const renderField = (field: FormField) => {
    const { name, label, type, min, max, step, options, unit } = field;
    const value = formData[name];

    switch (type) {
      case 'number':
        return (
          <div className="mb-4" key={name}>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
              {label}
            </label>
            <div className="flex items-center">
              <input
                type="number"
                id={name}
                name={name}
                value={value}
                min={min}
                max={max}
                step={step}
                onChange={(e) => handleChange(name, parseFloat(e.target.value))}
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {unit && <span className="ml-2 text-gray-600">{unit}</span>}
            </div>
          </div>
        );
        
      case 'range':
        return (
          <div className="mb-4" key={name}>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
              {label}
            </label>
            <div className="flex items-center">
              <input
                type="range"
                id={name}
                name={name}
                value={value}
                min={min}
                max={max}
                step={step}
                onChange={(e) => handleChange(name, parseFloat(e.target.value))}
                className="w-full mr-4"
              />
              <input
                type="number"
                value={value}
                min={min}
                max={max}
                step={step}
                onChange={(e) => handleChange(name, parseFloat(e.target.value))}
                className="w-24 rounded-md border-gray-300 shadow-sm px-3 py-2 text-right"
              />
              {unit && <span className="ml-2 text-gray-600">{unit}</span>}
            </div>
          </div>
        );
        
      case 'text':
        return (
          <div className="mb-4" key={name}>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
              {label}
            </label>
            <input
              type="text"
              id={name}
              name={name}
              value={value}
              onChange={(e) => handleChange(name, e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        );
        
      case 'select':
        return (
          <div className="mb-4" key={name}>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
              {label}
            </label>
            <select
              id={name}
              name={name}
              value={value}
              onChange={(e) => handleChange(name, e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              {options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );
        
      case 'checkbox':
        return (
          <div className="mb-4 flex items-center" key={name}>
            <input
              type="checkbox"
              id={name}
              name={name}
              checked={value}
              onChange={(e) => handleChange(name, e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor={name} className="ml-2 block text-sm font-medium text-gray-700">
              {label}
            </label>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {fields.map(renderField)}
      
      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </>
        ) : (
          submitButtonText
        )}
      </button>
    </form>
  );
};

export default FormGenerator; 