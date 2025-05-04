import React from 'react';

export interface FacePerson {
  id: number;
  name: string;
  imageSrc: string;
  matchPercentage?: number;
}

interface FaceGalleryProps {
  faces: FacePerson[];
  bestMatch?: FacePerson | null;
  onSelectFace?: (face: FacePerson) => void;
  className?: string;
}

const FaceGallery: React.FC<FaceGalleryProps> = ({
  faces,
  bestMatch,
  onSelectFace,
  className = ''
}) => {
  return (
    <div className={`w-full ${className}`}>
      {/* Best match display */}
      {bestMatch && (
        <div 
          className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg animate-fadeDown"
        >
          <h3 className="text-lg font-medium text-green-800 mb-2">Best Match</h3>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img 
                src={bestMatch.imageSrc} 
                alt={bestMatch.name}
                className="w-24 h-24 object-cover rounded-lg shadow-sm"
              />
              <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold py-1 px-2 rounded-tr-lg rounded-bl-lg">
                {bestMatch.matchPercentage 
                  ? `${Math.round(bestMatch.matchPercentage * 100)}%` 
                  : 'Match'}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{bestMatch.name}</h4>
              <p className="text-sm text-gray-500">ID: {bestMatch.id}</p>
              <button
                onClick={() => onSelectFace && onSelectFace(bestMatch)}
                className="mt-2 text-sm bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gallery heading */}
      <h3 className="text-lg font-medium text-gray-900 mb-3">Face Gallery</h3>
      
      {/* Face grid */}
      {faces.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {faces.map((face) => (
            <div
              key={face.id}
              className={`relative cursor-pointer group animate-fadeIn ${
                bestMatch?.id === face.id ? 'ring-2 ring-green-500' : ''
              }`}
              onClick={() => onSelectFace && onSelectFace(face)}
            >
              <img 
                src={face.imageSrc} 
                alt={face.name}
                className="w-full aspect-square object-cover rounded-lg shadow-sm transition-transform group-hover:scale-105"
              />
              
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 rounded-b-lg">
                <p className="text-sm font-medium text-white">{face.name}</p>
                {face.matchPercentage && (
                  <p className="text-xs text-green-300">
                    {Math.round(face.matchPercentage * 100)}% match
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 text-center">
          <p className="text-gray-500">No faces in the gallery yet</p>
        </div>
      )}
    </div>
  );
};

export default FaceGallery; 