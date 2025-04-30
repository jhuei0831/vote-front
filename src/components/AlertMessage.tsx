import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

/**
 * 共用警示訊息元件
 * @param props.variant 警示樣式
 * @param props.isOpen 是否顯示
 * @param props.description 警示內容
 * @param props.onClose 關閉事件
 */
export default function AlertMessage({
  variant = "default",
  isOpen,
  description,
  onClose,
}: {
  variant?: "default" | "destructive" | "info" | "success" | "warning";
  isOpen: boolean;
  description: string;
  onClose: () => void;
}) {
  return (
    <Alert variant={variant} className={isOpen ? "" : "hidden"} onClose={onClose}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Message</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
}