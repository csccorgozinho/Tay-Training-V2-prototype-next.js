import { useState, useEffect } from 'react';

interface UsePaginationProps<T> {
  items: T[];
  itemsPerPage: number;
  searchDependency?: any; // dependency to reset page when search changes
}

interface UsePaginationResult<T> {
  currentPage: number;
  totalPages: number;
  currentPageItems: T[];
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  setCurrentPage: (page: number) => void;
}

/**
 * Generic pagination hook for managing paginated data
 * Handles page calculations, navigation, and automatic reset on search
 * 
 * @param items - Array of items to paginate
 * @param itemsPerPage - Number of items per page
 * @param searchDependency - Optional dependency to trigger page reset (e.g., searchTerm)
 * 
 * @example
 * const { currentPageItems, currentPage, totalPages, goToNextPage, goToPreviousPage } 
 *   = usePagination({ items: exercises, itemsPerPage: 12, searchDependency: searchTerm });
 */
export function usePagination<T>({
  items,
  itemsPerPage,
  searchDependency,
}: UsePaginationProps<T>): UsePaginationResult<T> {
  const [currentPage, setCurrentPageState] = useState(1);

  // Reset to first page when search dependency changes
  useEffect(() => {
    setCurrentPageState(1);
  }, [searchDependency]);

  // Calculate total pages
  const totalPages = Math.ceil(items.length / itemsPerPage);

  // Get current page items
  const currentPageItems = (): T[] => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  };

  // Navigation functions
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPageState(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPageState(currentPage - 1);
    }
  };

  return {
    currentPage,
    totalPages,
    currentPageItems: currentPageItems(),
    goToNextPage,
    goToPreviousPage,
    setCurrentPage: setCurrentPageState,
  };
}
