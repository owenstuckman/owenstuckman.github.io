import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import remarkToc from 'remark-toc';
import rehypeHighlight from 'rehype-highlight';
import remarkEmoji from 'remark-emoji';

export const mdsvexOptions = {
  extensions: ['.svx', '.md'],
  smartypants: {
    dashes: 'oldschool',
    quotes: true,
    ellipses: true
  },
  remarkPlugins: [
    remarkGfm,
    remarkToc,
    remarkEmoji
  ],
  rehypePlugins: [
    rehypeSlug,
    rehypeAutolinkHeadings,
    rehypeHighlight
  ],
  layout: {
    _: './src/lib/layouts/default.svelte'
  }
}; 