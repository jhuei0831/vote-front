import * as React from "react";
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Toaster, toast } from "sonner"
import api from "@/utils/api";
import { Checkbox } from "@/components/ui/checkbox";
import { defineStepper } from "@/components/ui/stepper";

// 型別定義
export type Candidate = {
  id: number;
  question_id: number;
  name: string;
  result: string;
  created_at: string;
  updated_at: string;
};

export type Question = {
  id: number;
  vote_id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  candidates?: Candidate[];
};

// 候選人表格組件
const CandidateTable = ({
  questionId,
  candidates,
  rowSelection,
  onRowSelectionChange,
}: {
  questionId: number;
  candidates: Candidate[];
  rowSelection: Record<string, boolean>;
  onRowSelectionChange: (newSelection: Record<string, boolean>) => void;
}) => {
  const columns: ColumnDef<Candidate>[] = [
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
      cell: ({ row }) => <div>{row.getValue("name")}</div>,
    },
  ];

  const table = useReactTable({
    data: candidates,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: updaterOrValue => {
      // 這裡支援函數型與物件型的 updaterOrValue
      if (typeof updaterOrValue === "function") {
        onRowSelectionChange(updaterOrValue(rowSelection));
      } else {
        onRowSelectionChange(updaterOrValue);
      }
    },
    getRowId: row => row.id.toString(),
    state: {
      rowSelection,
    },
  });

  return (
    <div className="rounded-md border mt-4">
      <div className="text-sm text-muted-foreground mx-2 mt-2">
        已選擇 {Object.keys(rowSelection || {}).length} 位候選人
      </div>
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
                無候選人
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

// 將 CandidateTable 包裝在 React.memo 中
const MemoizedCandidateTable = React.memo(CandidateTable);

// 將 StepContent 移到外部並使用 React.memo
const StepContent = React.memo(({
  questions,
  rowSelections,
  onRowSelectionChange,
  useStepper,
  StepperPanel,
  StepperControls,
}: {
  questions: Question[];
  rowSelections: Record<number, Record<string, boolean>>;
  onRowSelectionChange: (questionId: number, newSelection: Record<string, boolean>) => void;
  useStepper: any;
  StepperPanel: any;
  StepperControls: any;
}) => {
  const { current, next, prev, isFirst, isLast } = useStepper();
  const currentQuestion = questions.find(q => q.id.toString() === current.id);

  if (!currentQuestion) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await api.post("/v1/voter/ballot/create", rowSelections)
      console.log(response)
      if (response.data.msg) {
        toast.success("投票成功，將自動跳轉至首頁", {position: "top-right"})
        // 5秒後跳轉至首頁
        setTimeout(() => {
          window.location.href = "/"
        }, 5000)
      }
    } catch (err: any) {
      console.error(err)
      toast.error("投票失敗: "+err.response.data.msg, {position: "top-right"})
      // 登入過期，導向投票登入頁面
      if (err.response.data.code === 100) {
        var voteId = localStorage.getItem("vote_id")
        window.location.href = "/vote/login/"+voteId
      }
    }
  }

  return (
    <div className="space-y-6">
      <StepperPanel>
        <div className="p-4 border rounded-lg">
          <p className="text-gray-600 mb-4">{currentQuestion.description}</p>
          {currentQuestion.candidates && (
            <MemoizedCandidateTable
              questionId={currentQuestion.id}
              candidates={currentQuestion.candidates}
              rowSelection={rowSelections[currentQuestion.id] || {}}
              onRowSelectionChange={(newSelection) => 
                onRowSelectionChange(currentQuestion.id, newSelection)
              }
            />
          )}
        </div>
      </StepperPanel>

      <StepperControls>
        <Button
          variant="outline"
          onClick={() => prev()}
          disabled={isFirst}
        >
          上一題
        </Button>
        <Button
          onClick={() => next()}
          disabled={isLast}
        >
          下一題
        </Button>
        {isLast && (
          <Button variant="default" onClick={handleSubmit}>
            提交投票
          </Button>
        )}
      </StepperControls>
    </div>
  );
});

// 主要投票組件
export default function Voting() {
  const [questions, setQuestions] = React.useState<Question[]>([]);
  const [rowSelections, setRowSelections] = React.useState<Record<number, Record<string, boolean>>>({});
  const [currentStep, setCurrentStep] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchCandidates() {
      try {
        const response = await api.get("/v1/voter/questions");
        setQuestions(response.data.data);
        
        const initialSelections: Record<number, Record<string, boolean>> = {};
        response.data.data.forEach((question: Question) => {
          if (question.candidates) {
            initialSelections[question.id] = {};
          }
        });
        setRowSelections(initialSelections);
        // 設置初始步驟
        if (response.data.data.length > 0) {
          setCurrentStep(response.data.data[0].id.toString());
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchCandidates();
  }, []);

  const handleRowSelectionChange = React.useCallback((questionId: number, newSelection: Record<string, boolean>) => {
    setRowSelections(prev => ({
      ...prev,
      [questionId]: newSelection
    }));
  }, []);

  // 用 useMemo 只在 questions 變動時建立 stepper
  const stepper = React.useMemo(() => {
    return defineStepper(
      ...questions.map(q => ({ id: q.id.toString(), title: q.title }))
    );
  }, [questions]);

  const {
    StepperProvider,
    StepperNavigation,
    StepperStep,
    StepperTitle,
    StepperDescription,
    StepperPanel,
    StepperControls,
    useStepper,
  } = stepper;

  if (questions.length === 0 || !currentStep) {
    return <div>載入中...</div>;
  }

  return (
    <>
      <Toaster richColors />
      <StepperProvider 
        variant="horizontal" 
        labelOrientation="vertical" 
        className="w-full max-w-3xl mx-auto mt-4"
        defaultValue={currentStep}
      >
        <div className="space-y-8">
          <StepperNavigation>
            {questions.map((question) => (
              <StepperStep key={question.id} of={question.id.toString()}>
                <StepperTitle>{question.title}</StepperTitle>
              </StepperStep>
            ))}
          </StepperNavigation>

          <StepContent 
            questions={questions}
            rowSelections={rowSelections}
            onRowSelectionChange={handleRowSelectionChange}
            useStepper={useStepper}
            StepperPanel={StepperPanel}
            StepperControls={StepperControls}
          />
        </div>
      </StepperProvider>
    </>
  );
}