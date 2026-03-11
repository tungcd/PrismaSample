/**
 * InfiniteSelectBox Types
 * Generic types for infinite scroll select component with search and pagination
 */

/**
 * Base entity interface - all entities must have id and name (or displayName)
 * ID can be string or number to support both cuid and auto-increment IDs
 */
export interface SelectableEntity {
  id: string | number;
  name: string;
}

/**
 * Result from fetch function
 */
export interface InfiniteSelectResult<T extends SelectableEntity> {
  data: T[];
  hasMore: boolean;
}

/**
 * Fetch function type - Server Action or custom async function
 */
export type InfiniteSelectFetchFn<T extends SelectableEntity> = (
  page: number,
  search: string,
) => Promise<InfiniteSelectResult<T>>;

/**
 * Props for InfiniteSelectBox component
 */
export interface InfiniteSelectBoxProps<T extends SelectableEntity> {
  /**
   * Server Action or async function to fetch data
   * @param page - Current page number (starts from 1)
   * @param search - Search query string
   * @returns Promise with data array and hasMore flag
   */
  fetchFn: InfiniteSelectFetchFn<T>;

  /**
   * Enable multiple selection
   * @default false
   */
  multiple?: boolean;

  /**
   * Current value (single mode: string|number, multiple mode: (string|number)[])
   */
  value?: string | number | (string | number)[];

  /**
   * Default value when component mounts
   */
  defaultValue?: string | number | (string | number)[];

  /**
   * Callback when selection changes
   * @param value - Selected ID(s)
   */
  onChange?: (value: string | number | (string | number)[] | undefined) => void;

  /**
   * Placeholder text for select input
   */
  placeholder?: string;

  /**
   * Placeholder text for search input
   */
  searchPlaceholder?: string;

  /**
   * Disabled state
   */
  disabled?: boolean;

  /**
   * Custom renderer for option display
   * @default (item) => item.name
   */
  renderOption?: (item: T) => React.ReactNode;

  /**
   * Page size for pagination
   * @default 20
   */
  pageSize?: number;

  /**
   * Fetch function to get single item by ID (for smart default value)
   * If not provided, will try to find in loaded items
   */
  fetchByIdFn?: (id: string | number) => Promise<T | null>;

  /**
   * Custom class name
   */
  className?: string;

  /**
   * Error state
   */
  error?: string;
}
