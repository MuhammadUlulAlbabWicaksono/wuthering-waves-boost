export default function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-bg-secondary">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Footer content — akan diisi di tahap slicing */}
        <div className="text-center text-text-muted text-sm">
          &copy; {new Date().getFullYear()} Wuthering Waves Boosting Service. All
          rights reserved.
        </div>
      </div>
    </footer>
  );
}
