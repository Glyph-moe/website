import type { APIContext } from 'astro'
import { getPublishedPosts } from '../../../lib/blog'
import { renderOgImage } from '../../../lib/og'
import type { BlogPost } from '../../../lib/blog'

/** One share card per post, generated at build time from the cover template. */
export const prerender = true

export async function getStaticPaths() {
  const posts = await getPublishedPosts()
  return posts.map(post => ({ params: { slug: post.id }, props: { post } }))
}

interface Props {
  post: BlogPost
}

export async function GET({ props }: APIContext<Props>) {
  const { post } = props
  const image = await renderOgImage({
    title: post.data.title,
    category: post.data.category,
    date: post.data.date,
    mood: post.data.mood,
  })

  return new Response(new Uint8Array(image), {
    headers: {
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
