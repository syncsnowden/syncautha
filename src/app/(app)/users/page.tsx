export default function UsersPage() {
  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Users</h1>
        <p className="page-subtitle">View all users who have authenticated with your keys.</p>
      </div>
      <div className="page-body">
        <div className="card">
          <div className="card-header">
            <span className="card-title">All users</span>
            <div style={{ display: "flex", gap: 8 }}>
              <div className="input-icon-wrap" style={{ width: 220 }}>
                <i className="fa-solid fa-magnifying-glass input-prefix-icon" />
                <input className="input" placeholder="Search users..." />
              </div>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Key</th>
                  <th>Last seen</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <div className="empty-icon"><i className="fa-solid fa-users" /></div>
                      <div className="empty-title">No users yet</div>
                      <div className="empty-desc">Users will appear here once they authenticate with a license key.</div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
