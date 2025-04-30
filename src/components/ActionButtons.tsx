// 建立表單動作按鈕，像是"儲存"、"刪除"、"回到列表"等，可以透過設定決定列表路由，要使用那些按鈕
// 這個元件會根據 props 的設定來顯示不同的按鈕，並且在按下按鈕時會觸發相應的事件
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, X } from 'lucide-react';
import { Link } from '@tanstack/react-router';

export type ActionButtonProps = {
  save?: boolean;
  saveText?: string;
  delete?: boolean;
  back?: boolean;
  backTo?: string;
}

export default function ActionButtons({
  save,
  saveText,
  delete: deleteButton,
  back,
  backTo,
}: ActionButtonProps) {
  return (
    <div className="flex space-x-2">
      {back && (
        <Link to={backTo}>
          <Button variant="outline">
            <ArrowLeft />
            Back
          </Button>
        </Link>
      )}
      {save && (
        <Button type="submit">
          <Check />
          {saveText ?? 'Submit'}
        </Button>
      )}
      {deleteButton && (
        <Button className="bg-red-500 text-white">
          <X />
          Delete
        </Button>
      )}
    </div>
  );
}

