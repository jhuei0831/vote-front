import Layout from "@/components/backstage/BackLayout";
import * as React from "react";
import {
  ColumnDef,
  SortingState,
  VisibilityState,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Pagination from "@/components/Pagination";
import { Link } from "@tanstack/react-router";
import { Vote, useVoteById, fetchVotes, handleDelete } from "@/utils/vote";

export default function Home() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(10);
  const [data, setData] = React.useState<Vote[]>([]);
  const [pagination, setPagination] = React.useState({
    total: 0,
    total_pages: 0,
  });
  const [selectedVoteId, setSelectedVoteId] = React.useState('');
  const {data: vote} = useVoteById(selectedVoteId);

  function handleVoteClick(id: string) {
    setSelectedVoteId(id);
    // Use the proper route param format for TanStack Router
    window.location.href = `/backstage/vote/${id}`;
  }

  React.useEffect(() => {
    async function loadData() {
      const response = await fetchVotes(pageIndex + 1, pageSize);
      setData(response.data);
      setPagination(response.pagination);
    }
    loadData();
  }, [pageIndex, pageSize]);

  const columns: ColumnDef<Vote>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <div className="capitalize">{row.getValue("id")}</div>,
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => 
        <div>
          <span 
            onClick={() => handleVoteClick(row.getValue("id"))} 
            className="text-blue-500 hover:underline cursor-pointer"
            style={
              vote?.id === row.getValue("id")
                ? {
                    fontWeight: 'bold',
                  }
                : {}
            }
          >
            {row.getValue("title")}
          </span>
        </div>,
    },
    {
      accessorKey: "start_time",
      header: () => <div className="text-center">Start Time</div>,
      cell: ({ row }) => (
        <div className="text-center font-medium">
          {new Date(row.getValue("start_time")).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "end_time",
      header: () => <div className="text-center">End Time</div>,
      cell: ({ row }) => (
        <div className="text-center font-medium">
          {new Date(row.getValue("end_time")).toLocaleString()}
        </div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const vote = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleDelete(vote.id)}>
                Delete
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(vote.id)}
              >
                Copy Vote ID
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    rowCount: pagination.total,
    pageCount: pagination.total_pages,
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnVisibility,
      pagination: { pageIndex, pageSize },
    },
  });

  return (
    <Layout>
      <div className="w-full">
        <div className="flex items-center py-4">
          <Link to="/backstage/vote/create">
            <Button variant="outline" className="mr-auto">
              <Plus />
              New Vote
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-2">
                Page size <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {[5, 10, 20, 50].map((size) => (
                <DropdownMenuItem
                  key={size}
                  onClick={() => setPageSize(size)}
                  className={`capitalize ${
                    pageSize === size ? "bg-gray-100 font-bold" : ""
                  }`}
                >
                  {size}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setPageSize(10);
                  setPageIndex(0);
                }}
              >
                Reset
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            Showing {pageIndex * pageSize + 1} to{" "}
            {Math.min((pageIndex + 1) * pageSize, pagination.total)} of{" "}
            {pagination.total} entries
          </div>
          <Pagination
            pageIndex={pageIndex}
            pageCount={pagination.total_pages}
            onPageChange={setPageIndex}
          />
        </div>
      </div>
    </Layout>
  );
}