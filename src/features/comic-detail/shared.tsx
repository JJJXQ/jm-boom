import { UI } from '@/lib/constants'

export { ComicCover } from '@/components/comic'

export function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-normal">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

export function ComicDetailSkeleton() {
  return (
    <div className="space-y-10">
      <section className="grid grid-cols-[240px_minmax(0,1fr)] gap-8">
        <div className="aspect-3/4 animate-pulse rounded-md bg-muted" />
        <div className="space-y-5 py-1">
          <div className="h-5 w-56 animate-pulse rounded bg-muted" />
          <div className="space-y-3">
            <div className="h-10 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-4 w-64 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-px bg-border" />
          <div className="h-24 max-w-3xl animate-pulse rounded-md bg-muted" />
          <div className="h-px bg-border" />
          <div className="space-y-2">
            <div className="h-4 max-w-3xl animate-pulse rounded bg-muted" />
            <div className="h-4 max-w-2xl animate-pulse rounded bg-muted" />
            <div className="h-4 max-w-xl animate-pulse rounded bg-muted" />
          </div>
        </div>
      </section>
      <div className="grid grid-cols-[minmax(0,1fr)_320px] gap-8">
        <div className="space-y-8">
          <ChapterSkeletonList />
        </div>
        <div className="h-80 animate-pulse rounded-xl bg-muted" />
      </div>
    </div>
  )
}

export function CommentSkeletonList() {
  return (
    <div className="space-y-3">
      {Array.from({ length: UI.COMMENT_SKELETON_COUNT }).map((_, index) => (
        <div key={index} className="space-y-3 px-px py-1">
          <div className="space-y-2">
            <div className="h-4 w-40 animate-pulse rounded bg-muted" />
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
          </div>
          <div className="space-y-2">
            <div className="h-4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}

function ChapterSkeletonList() {
  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <div className="h-6 w-24 animate-pulse rounded bg-muted" />
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-18 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    </section>
  )
}
