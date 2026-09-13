import type { ReferenceVideo } from '../lib/referenceVideos'
import { Card } from './ui'

export function ReferenceVideoList({ title, videos }: { title: string; videos: ReferenceVideo[] }) {
  return (
    <Card className="border-sky-700/60 bg-sky-500/5">
      <p className="mb-2 font-semibold text-sky-300">{title}</p>
      <ul className="space-y-1.5">
        {videos.map((v) => (
          <li key={v.id}>
            <a
              href={v.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-emerald-400 underline decoration-dotted"
            >
              ▶ {v.titulo}
            </a>
          </li>
        ))}
      </ul>
    </Card>
  )
}
