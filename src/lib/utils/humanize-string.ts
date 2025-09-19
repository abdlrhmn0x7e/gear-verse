export function humanizeString(
  str: string,
  convention: "camel" | "snake" = "camel",
) {
  switch (convention) {
    case "camel":
      return str.charAt(0).toUpperCase() + str.slice(1);
    case "snake":
      const humanized = str.replace(/_/g, " ").toLowerCase();
      return humanized.charAt(0).toUpperCase() + humanized.slice(1);
  }
}
