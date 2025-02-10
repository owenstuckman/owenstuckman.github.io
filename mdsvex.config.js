import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

export const mdsvexOptions = {
  extensions: ['.svx', '.md'],
  smartypants: {
    dashes: 'oldschool'
  },
  remarkPlugins: [remarkGfm],
  rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
  layout: {
    _: './src/lib/layouts/default.svelte'
  }
}; 