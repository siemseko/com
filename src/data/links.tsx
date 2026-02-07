// Removed "Images" from the import list to fix the ESLint error
import { BarChart3, LayoutDashboard, LetterText, Settings } from "lucide-react";

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
   {
    link: "overview",
    path: "/admin/overview",
    tag: "overview",
    id: "overview",
    icon: <BarChart3 size={18} />,
  },
    {
    link: "Setting",
    path: "/admin/setting",
    tag: "setting",
    id: "setting",
    icon: <Settings size={18} />,
  },
];