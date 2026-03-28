import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-200 mb-4">404</h1>
        <p className="text-lg text-gray-600 mb-6">Page not found</p>
        <Link href="/">
          <Button variant="msc">Go Home</Button>
        </Link>
      </div>
    </div>
  );
}
