// Removed "Images" from the import list to fix the ESLint error
import { LayoutDashboard, LetterText } from "lucide-react";

export const my_links = [
  {
    link: "Resize Images",
    path: "/admin/resize-images",
    tag: "resize-images",
    id: "resize-images",
    icon: <LayoutDashboard size={18} />,
  },
  {
    link: "Image To Text",
    path: "/admin/image-to-text",
    tag: "image-to-text",
    id: "image-to-text",
    icon: <LetterText size={18} />,
  },

];