import { LogOutIcon } from 'lucide-react'

import { ConfirmDialog } from '@/components/confirm-dialog'
import { Button } from '@/components/ui/button'

export function LogoutConfirmDialog({ onConfirm }: { onConfirm: () => void }) {
  return (
    <ConfirmDialog
      trigger={
        <Button variant="outline" size="sm">
          <LogOutIcon className="size-4" />
          登出
        </Button>
      }
      icon={<LogOutIcon className="size-5 text-destructive" />}
      title="退出登录"
      description="退出后会清除当前账号会话，并返回首页。"
      confirmText="确认退出"
      variant="destructive"
      onConfirm={onConfirm}
    />
  )
}
