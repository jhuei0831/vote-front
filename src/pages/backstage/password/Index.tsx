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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PasswordCreateDialog} from "@/pages/backstage/password/Create";
import PasswordStatus from "@/pages/backstage/password/Status";
import Pagination from "@/components/Pagination";
import { Checkbox } from "@/components/ui/checkbox";
import { Password, fetchPasswords, decryptPasswords, handleDelete } from "@/utils/password";

export function PasswordChangeStatusDialog({
  voteId,
  selections,
  onSuccess,
}: {
  voteId: string;
  selections: string[];
  onSuccess: () => void;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Change Status</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Password Status</DialogTitle>
          <DialogDescription>
            Are you sure you want to change the status of the selected passwords?
          </DialogDescription>
        </DialogHeader>
        <PasswordStatus
          voteId={voteId}
          selections={selections}
          onSuccess={onSuccess}
        />
        <DialogFooter>
          <Button type="submit" form="password-status-form">Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function PasswordIndex({voteId}: { voteId: string }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(10);
  const [data, setData] = React.useState<Password[]>([]);
  const [pagination, setPagination] = React.useState({
    total: 0,
    total_pages: 0,
  });
  const [rowSelection, setRowSelection] = React.useState({})
  const [isDecrypting, setIsDecrypting] = React.useState(false);
  const [decryptedPasswords, setDecryptedPasswords] = React.useState<Record<string, string>>({});
  
  const refreshData = React.useCallback(async () => {
    const response = await fetchPasswords(voteId, pageIndex + 1, pageSize);
    setData(response.data);
    setPagination(response.pagination);
  }, [pageIndex, pageSize]);

  const decryptPasswordsHandler = async () => {
    setIsDecrypting(true);
    const decrypted = await decryptPasswords(data);
    setDecryptedPasswords(decrypted.data || {});
    setIsDecrypting(false);
  };

  const clearDecryptedPasswords = () => {
    setDecryptedPasswords({});
  };

  const columns: ColumnDef<Password>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <div className="capitalize">{row.getValue("id")}</div>,
    },
    {
      accessorKey: "password",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Password
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => {
        const originalPassword = row.getValue("password") as string;
        
        // 查找解密後的密碼
        const decryptedPassword = decryptedPasswords[originalPassword];
        
        return (
          <div className="font-medium">{decryptedPassword || originalPassword}</div>
        );
      },
    },
    {
      accessorKey: "status",
      header: () => <div className="text-center">Status</div>,
      cell: ({ row }) => (
        <div className="text-center font-medium">
          {row.getValue("status") === true ? (
            <span className="text-green-500">Active</span>
          ) : (
            <span className="text-red-500">Inactive</span>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const password = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleDelete(password.id)}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  React.useEffect(() => {
    refreshData();
  }, [pageIndex, pageSize]);
  
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
    onRowSelectionChange: setRowSelection,
    getRowId: row => row.id.toString(),
    state: {
      sorting,
      columnVisibility,
      pagination: { pageIndex, pageSize },
      rowSelection,
    },
  });

  return (
    <Layout>
      <div className="w-full">
        <div className="flex items-center py-4 gap-2">
          <PasswordCreateDialog voteId={voteId} onSuccess={refreshData} />
          <PasswordChangeStatusDialog
            voteId={voteId}
            selections={Object.keys(rowSelection)}
            onSuccess={refreshData}
          />
          
          <Button 
            variant="outline" 
            className={`${Object.keys(decryptedPasswords).length !== 0 ? "text-amber-600" : ""}`}
            onClick={Object.keys(decryptedPasswords).length !== 0 ? clearDecryptedPasswords : decryptPasswordsHandler}
            disabled={isDecrypting || data.length === 0}
          >
            {isDecrypting ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin">⟳</span>
                Decrypting...
              </>
            ) : (
              Object.keys(decryptedPasswords).length !== 0 ? "Reset Display" : "Decrypt Passwords"
            )}
          </Button>
          
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
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
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