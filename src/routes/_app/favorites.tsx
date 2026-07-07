import { useQuery } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { BookmarkIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { useMemo, useState } from 'react'

import { ComicGrid, ComicGridSkeleton, FeedHeader, StatePanel } from '@/components/comic-feed'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { getFavoriteComics } from '@/lib/api/comic'
import { queryKeys } from '@/lib/query-keys'
import { useSettingsStore } from '@/stores/settings-store'
import { useUserStore } from '@/stores/user-store'

export const Route = createFileRoute('/_app/favorites')({
  beforeLoad: () => {
    if (!useUserStore.getState().user) {
      throw redirect({ to: '/' })
    }
  },
  component: FavoritesPage
})

const ALL_FAVORITES_FOLDER = '__all__'

function FavoritesPage() {
  const endpoint = useSettingsStore(state => state.api)
  const [page, setPage] = useState(1)
  const [folderId, setFolderId] = useState(ALL_FAVORITES_FOLDER)
  const activeFolderId = folderId === ALL_FAVORITES_FOLDER ? '' : folderId
  const favorites = useQuery({
    queryKey: queryKeys.favorites(endpoint, activeFolderId, page),
    queryFn: () =>
      getFavoriteComics({
        page,
        folderId: activeFolderId,
        endpoint
      }),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    refetchOnReconnect: true
  })
  const folders = useMemo(
    () => [
      { id: ALL_FAVORITES_FOLDER, name: '全部收藏' },
      ...(favorites.data?.folders ?? []).map(folder => ({
        id: folder.id,
        name: folder.name || `收藏夹 ${folder.id}`
      }))
    ],
    [favorites.data?.folders]
  )

  function changeFolder(value: string) {
    setFolderId(value)
    setPage(1)
  }

  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl grid-rows-[auto_auto_1fr] gap-6 p-[32px_32px_16px_96px]">
        <FeedHeader title="收藏" description="同步禁漫天堂云收藏" />

        <div className="flex items-center gap-3">
          <Select value={folderId} onValueChange={changeFolder}>
            <SelectTrigger>
              <BookmarkIcon className="size-4 text-muted-foreground" />
              <SelectValue placeholder="选择收藏夹" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {folders.map(folder => (
                  <SelectItem key={folder.id} value={folder.id}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <section className="min-h-0">
          {favorites.isError ? (
            <StatePanel
              title="收藏加载失败"
              description={favorites.error.message}
              onRetry={() => favorites.refetch()}
            />
          ) : favorites.isLoading ? (
            <ComicGridSkeleton />
          ) : favorites.data == null || favorites.data.items.length === 0 ? (
            <FavoritesEmptyState />
          ) : (
            <div className="space-y-6">
              <ComicGrid items={favorites.data.items} />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || favorites.isFetching}
                  onClick={() => setPage(current => Math.max(1, current - 1))}
                >
                  <ChevronLeftIcon className="size-4" />
                  上一页
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!favorites.data.hasMore || favorites.isFetching}
                  onClick={() => setPage(current => current + 1)}
                >
                  下一页
                  <ChevronRightIcon className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

function FavoritesEmptyState() {
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-4 text-center">
      <p className="text-6xl font-bold text-foreground">(･o･;)</p>
      <p className="text-sm text-muted-foreground">暂无收藏的漫画</p>
    </div>
  )
}
