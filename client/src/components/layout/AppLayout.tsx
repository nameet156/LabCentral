import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppLayout() {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="md:ml-64">
        <Topbar />
        <main className="p-6 max-md:p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
