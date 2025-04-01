import { Button } from "@/components/ui/button";

type PaginationProps = {
  pageIndex: number;
  pageCount: number;
  onPageChange: (newPageIndex: number) => void;
};

export default function Pagination({ pageIndex, pageCount, onPageChange }: PaginationProps) {
  return (
    <div className="flex items-center justify-end space-x-2 py-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.max(pageIndex - 1, 0))}
        disabled={pageIndex === 0}
      >
        Previous
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.min(pageIndex + 1, pageCount - 1))}
        disabled={pageIndex >= pageCount - 1}
      >
        Next
      </Button>
    </div>
  );
}