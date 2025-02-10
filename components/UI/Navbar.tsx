import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex space-x-4">
        <Link href="/" className="hover:underline">Home</Link>
        <Link href="/map" className="hover:underline">Map</Link>
        <Link href="/about" className="hover:underline">About</Link>
      </div>
    </nav>
  );
}
