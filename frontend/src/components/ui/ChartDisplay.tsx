import React from 'react';

interface ChartDisplayProps {
  data: {
    type: 'bar' | 'line' | 'pie' | 'doughnut' | 'radar' | 'polarArea';
    labels: string[];
    datasets: {
      label?: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string | string[];
      borderWidth?: number;
      tension?: number;
      fill?: boolean;
    }[];
  };
  height?: number;
  width?: number;
  title?: string;
  className?: string;
}

const ChartDisplay: React.FC<ChartDisplayProps> = ({
  data,
  height = 300,
  width,
  title,
  className = ''
}) => {
  // Find the maximum value for scaling
  const maxValue = Math.max(...data.datasets.flatMap(dataset => dataset.data));
  
  return (
    <div className={`bg-white p-4 rounded-md border border-gray-200 ${className}`}>
      {title && <h4 className="text-sm font-medium text-gray-700 mb-3">{title}</h4>}
      
      <div style={{ height: `${height}px`, width: width ? `${width}px` : '100%' }} className="relative">
        {data.type === 'bar' && (
          <div className="flex h-full items-end justify-around">
            {data.labels.map((label, idx) => {
              const value = data.datasets[0]?.data[idx] || 0;
              const percentage = (value / maxValue) * 100;
              const bgColor = Array.isArray(data.datasets[0]?.backgroundColor) 
                ? data.datasets[0]?.backgroundColor[idx] || '#3B82F6'
                : data.datasets[0]?.backgroundColor || '#3B82F6';
              
              return (
                <div key={idx} className="flex flex-col items-center w-full mx-1">
                  <div 
                    className="w-full rounded-t-sm transition-all" 
                    style={{ 
                      height: `${percentage}%`, 
                      backgroundColor: bgColor,
                      minHeight: '5px'
                    }}
                  />
                  <div className="text-xs text-gray-600 mt-1 truncate w-full text-center">
                    {label}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {data.type === 'doughnut' && (
          <div className="flex justify-center items-center h-full">
            <div className="text-center">
              <div className="font-medium text-lg">{data.labels[0]}</div>
              <div className="text-3xl font-bold text-blue-600">
                {data.datasets[0]?.data[0]?.toFixed(2)}
              </div>
              <div className="text-sm text-gray-500 mt-2">
                {data.datasets[0]?.label || 'Value'}
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap justify-center mt-4 gap-2">
          {data.datasets.map((dataset, datasetIdx) => (
            <div key={datasetIdx} className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-1"
                style={{ 
                  backgroundColor: Array.isArray(dataset.backgroundColor) 
                    ? dataset.backgroundColor[0] 
                    : dataset.backgroundColor as string || '#3B82F6'
                }}
              />
              <span className="text-xs text-gray-700">{dataset.label || 'Dataset'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChartDisplay; 