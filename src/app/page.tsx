export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
      <div className="text-6xl">🏭</div>
      <h1 className="text-2xl font-semibold text-foreground">Floor Runner</h1>
      <p className="text-muted-foreground text-sm max-w-xs">
        Your CNC job tracker is ready. Select a view from the sidebar to get started.
      </p>
    </div>
  );
}
