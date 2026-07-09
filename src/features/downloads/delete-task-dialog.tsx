import { Trash2Icon } from 'lucide-react'

import { ConfirmDialog } from '@/components/confirm-dialog'
import { Button } from '@/components/ui/button'

export function DeleteTaskDialog({
  comicTitle,
  disabled,
  onConfirm
}: {
  comicTitle: string
  disabled: boolean
  onConfirm: () => void
}) {
  return (
    <ConfirmDialog
      trigger={
        <Button variant="ghost" size="icon" disabled={disabled}>
          <Trash2Icon className="size-4" />
        </Button>
      }
      title="删除下载任务"
      description={`将删除“${comicTitle}”的下载任务和已保存文件，此操作不可撤销。`}
      confirmText="删除"
      variant="destructive"
      onConfirm={onConfirm}
    />
  )
}
