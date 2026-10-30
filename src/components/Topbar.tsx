import './Topbar.css'

export function Topbar() {
  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark" aria-hidden="true">∑</div>
        <div>
          <div className="brand-name">glass<span className="brand-dot">.</span></div>
          <div className="brand-sub">Precision, refined</div>
        </div>
      </div>
      <div className="status"><span className="status-dot" /> System ready</div>
    </header>
  )
}
