import { BookExample } from "@/components/book-example";
import { FloatingAgent } from "@/components/floating-agent";
import { PromptbookBrand } from "@/components/promptbook-brand";

export default function Home() {
  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="container header-inner">
          <PromptbookBrand />
          <nav className="header-nav" aria-label="Main navigation">
            <a href="https://www.ptbk.io/">ptbk.io</a>
            <a href="https://github.com/webgptorg/boilerplate">GitHub ↗</a>
          </nav>
        </div>
      </header>

      <main className="container main-content">
        <div className="page-intro">
          <h1>Promptbook starter</h1>
          <p>Next.js starter with Promptbook components and branding.</p>
        </div>

        <BookExample />
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <PromptbookBrand />
          <span>Promptbook · 2026</span>
        </div>
      </footer>

      <FloatingAgent />
    </div>
  );
}
