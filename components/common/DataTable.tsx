import React from 'react';

interface DataTableProps<T> {
  columns: { 
    key: keyof T | string; 
    header: string; 
    render?: (item: T) => React.ReactNode;
    sortable?: boolean;
  }[];
  data: T[];
  renderActions?: (item: T) => React.ReactNode;
  sortConfig?: { key: keyof T | string; direction: 'ascending' | 'descending' } | null;
  onSort?: (key: keyof T | string) => void;
}

const DataTable = <T extends { id: number | string }>(
  { columns, data, renderActions, sortConfig, onSort }: DataTableProps<T>
) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-base-300">
      <table className="table table-zebra w-full">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={String(col.key)}>
                 {col.sortable && onSort ? (
                  <button 
                    onClick={() => onSort(col.key)}
                    className="flex items-center gap-1"
                  >
                    <span>{col.header}</span>
                    {sortConfig?.key === col.key && (
                      <span>{sortConfig.direction === 'ascending' ? '▲' : '▼'}</span>
                    )}
                  </button>
                ) : (
                  col.header
                )}
              </th>
            ))}
            {renderActions && (
              <th>
                <span className="sr-only">Actions</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={item.id} className="hover">
              {columns.map((col) => (
                <td key={String(col.key)}>
                  {col.render ? col.render(item) : String(item[col.key as keyof T] ?? '')}
                </td>
              ))}
              {renderActions && (
                <td className="text-right">
                  {renderActions(item)}
                </td>
              )}
            </tr>
          ))}
            {data.length === 0 && (
                <tr>
                    <td colSpan={columns.length + (renderActions ? 1 : 0)} className="text-center py-10">
                        No data available.
                    </td>
                </tr>
            )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;