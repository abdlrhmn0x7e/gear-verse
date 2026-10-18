import { Bold } from "@tiptap/extension-bold";
import Document from "@tiptap/extension-document";
import { Heading } from "@tiptap/extension-heading";
import { Highlight } from "@tiptap/extension-highlight";
import { Image } from "@tiptap/extension-image";
import { Italic } from "@tiptap/extension-italic";
import { Link } from "@tiptap/extension-link";
import { BulletList, ListItem, OrderedList } from "@tiptap/extension-list";
import { Paragraph } from "@tiptap/extension-paragraph";
import { Strike } from "@tiptap/extension-strike";
import { Text } from "@tiptap/extension-text";
import { TextAlign } from "@tiptap/extension-text-align";
import { Underline } from "@tiptap/extension-underline";

/**
 * The nodes and marks a product description can hold. The admin editor adds
 * its editing-only extensions (undo, file drops) on top, and the storefront
 * renders stored descriptions with exactly this list, on the server.
 */
export const contentExtensions = [
  Document,
  Text,
  Paragraph,
  Heading.configure({
    levels: [1, 2, 3],
  }),
  BulletList,
  OrderedList,
  ListItem,

  Bold,
  Italic,
  Strike,
  Underline,
  Highlight,
  Link.configure({
    openOnClick: true,
    autolink: true,
    defaultProtocol: "https",
    protocols: ["https", "http"],
    HTMLAttributes: {
      class: "text-brand-text underline underline-offset-4 cursor-pointer",
    },
  }),

  TextAlign.configure({
    types: ["heading", "paragraph"],
  }),

  Image.configure({
    inline: false,
    HTMLAttributes: {
      class: "size-full object-contain rounded-md overflow-hidden",
      width: "200px",
      // description images sit below the fold: no eager fetch, and no
      // <link rel="preload"> from React for each of them
      loading: "lazy",
      decoding: "async",
    },
  }),
];
