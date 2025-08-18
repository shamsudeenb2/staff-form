// "use client";

// import { Home, ChevronRight } from "lucide-react";
// import Link from "next/link";

// interface NavbarProps {
//   breadcrumbs?: { label: string; href?: string }[];
// }

// export default function Navbar({ breadcrumbs = [] }: NavbarProps) {
//   return (
//     <nav className="w-full bg-white shadow-sm border-b">
//       <div className="max-w-3xl mx-auto px-4 py-3 flex items-center text-gray-700">
//         <Link href="/" className="flex items-center gap-1 text-blue-600 hover:text-blue-800">
//           <Home size={18} /> Home
//         </Link>
//         {breadcrumbs.map((crumb, idx) => (
//           <div key={idx} className="flex items-center gap-1">
//             <ChevronRight size={16} className="text-gray-400" />
//             {crumb.href ? (
//               <Link href={crumb.href} className="text-blue-600 hover:underline">
//                 {crumb.label}
//               </Link>
//             ) : (
//               <span className="text-gray-500">{crumb.label}</span>
//             )}
//           </div>
//         ))}
//       </div>
//     </nav>
//   );
// }


"use client";
import Link from "next/link";
import { Home, ChevronRight } from "lucide-react";

export default function Navbar({ breadcrumbs = [] }: { breadcrumbs?: { label: string; href?: string }[] }) {
  return (
    <nav className="w-full bg-white shadow-sm border-b">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4 text-gray-700">
        <Link href="/" className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
          <Home size={18} /> <span className="font-semibold">NIPOST</span>
        </Link>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          {breadcrumbs.map((b, i) => (
            <span key={i} className="flex items-center gap-2">
              <ChevronRight size={14} /> {b.href ? <Link href={b.href} className="text-blue-600">{b.label}</Link> : <span>{b.label}</span>}
            </span>
          ))}
        </div>
      </div>
    </nav>
  );
}