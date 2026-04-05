import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ProfileComingSoon({
  title,
  description = "This section is not available yet. Check back soon.",
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="container mx-auto max-w-lg px-4 py-16 text-center">
      <Link
        href="/profile"
        className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700 mb-8"
      >
        <ArrowLeft size={18} />
        Back to profile
      </Link>
      <h1 className="text-2xl font-black text-gray-900 mb-3">{title}</h1>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}
