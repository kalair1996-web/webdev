export default function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <a className="logo" href="#top">
          0 <span className="arrow">→</span> Shipped
        </a>
        <nav className="nav">
          <a href="#upload">Parser</a>
          <a href="#results">Results</a>
        </nav>
      </div>
    </header>
  );
}
