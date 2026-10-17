import { createCn } from "cn/config";

/** Knows the custom type scale from globals.css, so `text-title` is merged as a size, not a color. */
export const cn = createCn({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display",
            "display-sm",
            "headline",
            "headline-sm",
            "title",
            "body-lg",
          ],
        },
      ],
    },
  },
});
