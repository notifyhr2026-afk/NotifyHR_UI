import React from 'react';

const UserDetails: React.FC = () => {
  return (
    <div className="container">
      <h3>User Management</h3>

      <ul className="nav nav-tabs mt-4" id="userTabs" role="tablist">
        <li className="nav-item" role="presentation">
          <button
            className="nav-link active"
            id="profile-tab"
            data-bs-toggle="tab"
            data-bs-target="#profile"
            type="button"
            role="tab"
          >
            Profile
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className="nav-link"
            id="roles-tab"
            data-bs-toggle="tab"
            data-bs-target="#roles"
            type="button"
            role="tab"
          >
            Roles
          </button>
        </li>
      </ul>

      <div className="tab-content border p-3 border-top-0" id="userTabsContent">
        <div className="tab-pane fade show active" id="profile" role="tabpanel">
          <dl className="row">
            <dt className="col-sm-3">Name</dt>
            <dd className="col-sm-9">John Doe</dd>

            <dt className="col-sm-3">Email</dt>
            <dd className="col-sm-9">john@example.com</dd>
          </dl>
        </div>

        <div className="tab-pane fade" id="roles" role="tabpanel">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Role</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Admin</td>
                <td>Full access</td>
              </tr>
              <tr>
                <td>Viewer</td>
                <td>Read only</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
