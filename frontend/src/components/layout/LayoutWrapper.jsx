export function LayoutWrapper({ children }) {
  return (
    <div className="flex h-screen">
      <div className="w-24 bg-primary p-4">Sidebar</div>
      <div className="flex-1 py-4 bg-primary">
        <div className="bg-background rounded-tl-4xl rounded-bl-4xl h-full overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
