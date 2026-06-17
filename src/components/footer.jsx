export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white p-4 mt-12">
      <div className="container mx-auto grid grid-cols-3 items-center">
        <div className="flex flex-col text-left">
          <span>&copy; {new Date().getFullYear()} TerpWushu.</span>
          <div className="flex flex-col text-xs mt-1">
            <span>Created with React and Tailwind</span>
            <span>Designed by Josh Zhu</span>
            <span>Photo creds: Sherry Feng, Charles Yin, Zicong Bai</span>
          </div>
        </div>
        <div>
          <span>Disclaimer:</span>
          <p className="text-xs mt-1 text-left">
            This content is not endorsed, approved, sponsored, or provided by or on behalf of the University of Maryland or its affiliates.
          </p>
        </div>
        <div className="flex flex-col text-sm">
          <span>these will be links soon</span>
          <span>Admin Panel</span>
          <span>UWG Panel</span>
        </div>
      </div>
    </footer>
  );
}