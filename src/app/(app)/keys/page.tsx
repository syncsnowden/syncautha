export default function KeysPage() {
  return (
    <>
      <div className="page-header">
        <h1 className="page-title">License Keys</h1>
        <p className="page-subtitle">Manage and generate license keys for your users.</p>
      </div>
      <div className="page-body">
        <div className="card">
          <div className="card-header">
            <span className="card-title">All keys</span>
            <button className="btn btn-primary btn-sm" style={{ width: "auto" }}>
              <i className="fa-solid fa-plus" />
              Generate key
            </button>
          </div>
          <div className="empty-state">
            <div className="empty-icon"><i className="fa-solid fa-key" /></div>
            <div className="empty-title">No keys generated</div>
            <div className="empty-desc">Generate your first license key to start protecting your scripts.</div>
          </div>
        </div>
      </div>
    </>
  );
}
