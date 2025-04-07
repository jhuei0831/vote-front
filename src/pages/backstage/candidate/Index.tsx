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
import { fetchQuestions } from "@/pages/backstage/question/Index";
import api from "@/utils/api";
import { Link } from "react-router";

async function fetchCandidates(page: number, size: number) {
  try {
    const voteId = new URLSearchParams(window.location.search).get("voteId");
    const response = await api.get("/v1/candidate/list/"+voteId, { params: { page, size } });
    return response.data;
  } catch (err) {
    console.error(err);
    return { data: [], pagination: { total: 0, total_pages: 0 } };
  }
}

async function handleDelete(id: string) {
  if (confirm("Are you sure you want to delete this candidate?")) {
    try {
      const response = await api.delete(`/v1/candidate/`, { data: [id] });
      alert(response.data.msg);
      window.location.reload();
    } catch (err) {
      alert("Failed to delete candidate.");
      console.log(err);
    }
  }
}

export type Candidate = {
  id: string;
  question_id: string;
  name: string;
  updated_at: string;
};

export default function CandidateIndex() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(10);
  const [data, setData] = React.useState<Candidate[]>([]);
  const [pagination, setPagination] = React.useState({
    total: 0,
    total_pages: 0,
  });
  
  const [questionsArray, setQuestionsArray] = React.useState<
    { id: string; title: string }[]
  >([]);

  React.useEffect(() => {
    fetchQuestions(1, 100).then((res) => {
      const formattedQuestions = res.data.map((question: { id: string; title: string }) => ({
        id: question.id,
        title: question.title,
      }));
      setQuestionsArray(formattedQuestions);
    });
  }, []);

  const questionMap = React.useMemo(() => {
    return questionsArray.reduce((map, question) => {
      map[question.id] = question.title;
      return map;
    }, {} as Record<string, string>);
  }, [questionsArray]);

  const columns: ColumnDef<Candidate>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <div className="capitalize">{row.getValue("id")}</div>,
    },
    {
      accessorKey: "question_id",
      header: "Question",
      cell: ({ row }) => {
        const questionId = row.getValue("question_id");
        return <div className="capitalize">{questionMap[questionId as string] || "N/A"}</div>;
      },
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="lowercase">
          <a
            href={`/backstage/candidate/update?voteId=${new URLSearchParams(window.location.search).get(
              "voteId"
            )}&candidateId=${row.getValue("id")}`}
            className="text-blue-500 hover:underline"
          >
            {row.getValue("name")}
          </a>
        </div>
      ),
    },
    {
      accessorKey: "updated_at",
      header: () => <div className="text-center">Start Time</div>,
      cell: ({ row }) => (
        <div className="text-center font-medium">
          {new Date(row.getValue("updated_at")).toLocaleString()}
        </div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const candidate = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleDelete(candidate.id)}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  React.useEffect(() => {
    async function loadData() {
      const response = await fetchCandidates(pageIndex + 1, pageSize);
      setData(response.data);
      setPagination(response.pagination);
    }
    loadData();
  }, [pageIndex, pageSize]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    // manualPagination: true,
    // rowCount: pagination.total,
    // pageCount: pagination.total_pages,
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnVisibility,
      // pagination: { pageIndex, pageSize },
    },
  });

  return (
    <Layout>
      <div className="w-full">
        <div className="flex items-center py-4">
          <Link to={"/backstage/candidate/create?voteId=" + (new URLSearchParams(window.location.search).get('voteId'))}>
            <Button variant="outline" className="mr-auto">
              <Plus />
              New Candidate
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
        {/* <div className="flex items-center justify-end space-x-2 py-4">
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
        </div> */}
      </div>
    </Layout>
  );
}