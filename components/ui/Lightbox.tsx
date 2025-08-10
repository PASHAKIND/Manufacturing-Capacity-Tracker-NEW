
import React, { useState, useEffect, useCallback } from 'react';

interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  startIndex?: number;
}

export const Lightbox: React.FC<LightboxProps> = ({ isOpen, onClose, images, startIndex = 0 }) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(startIndex);
      // Optional: Disable body scroll
      // document.body.style.overflow = 'hidden';
    } else {
      // Optional: Re-enable body scroll
      // document.body.style.overflow = 'auto';
    }

    // Keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && images.length > 1) goToNext();
      if (e.key === 'ArrowLeft' && images.length > 1) goToPrevious();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      // document.body.style.overflow = 'auto'; // Ensure scroll is re-enabled
    };
  }, [isOpen, startIndex, onClose, images.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  }, [images.length]);

  if (!isOpen || images.length === 0) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-80 transition-opacity duration-300 ease-in-out"
      onClick={onClose} // Close on overlay click
      role="dialog"
      aria-modal="true"
      aria-labelledby="lightbox-image"
    >
      <div 
        className="relative max-w-[90vw] max-h-[90vh] p-4 bg-white shadow-2xl rounded-lg flex flex-col items-center"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the content
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-black bg-white rounded-full p-1.5 hover:bg-gray-200 transition-colors z-10"
          aria-label="Закрыть лайтбокс"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image Display */}
        <div className="relative flex items-center justify-center w-full h-full">
            <img
                id="lightbox-image"
                src={images[currentIndex]}
                alt={`Изображение ${currentIndex + 1} из ${images.length}`}
                className="max-w-full max-h-[calc(80vh-60px)] object-contain rounded" // Adjusted max-h to account for potential controls
                onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/600x400.png?text=Image+Load+Error')}
            />
        </div>


        {/* Navigation Buttons (only if multiple images) */}
        {images.length > 1 && (
          <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
             <button
              onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-30 text-white p-2 rounded-full hover:bg-opacity-50 transition-opacity pointer-events-auto"
              aria-label="Предыдущее изображение"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goToNext(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-30 text-white p-2 rounded-full hover:bg-opacity-50 transition-opacity pointer-events-auto"
              aria-label="Следующее изображение"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
        
        {/* Image Counter */}
        {images.length > 1 && (
            <div className="mt-2 text-sm text-gray-700">
                {currentIndex + 1} / {images.length}
            </div>
        )}
      </div>
    </div>
  );
};