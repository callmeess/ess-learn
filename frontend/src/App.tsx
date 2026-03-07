import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import FieldsPage from './pages/FieldsPage';
import FieldDetailPage from './pages/FieldDetailPage';
import PlaylistPage from './pages/PlaylistPage';
import ImportPage from './pages/ImportPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="fields" element={<FieldsPage />} />
          <Route path="fields/:id" element={<FieldDetailPage />} />
          <Route path="playlists/:id" element={<PlaylistPage />} />
          <Route path="import" element={<ImportPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
