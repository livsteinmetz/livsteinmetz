// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { AuthProvider, ProtectedRoute } from './auth';
import Academic from './components/Academic/Academic';
import Liv from './components/Liv/Liv';
import Admin from './pages/Admin/Admin';
import EditReflection from './pages/Admin/EditReflection';
import NewReflection from './pages/Admin/NewReflection';
import SignIn from './pages/Admin/SignIn';
import ReflectionPublic from './pages/Reflections/ReflectionPublic';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Liv />} />
          <Route path="/signin" element={<SignIn />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/new"
            element={
              <ProtectedRoute>
                <NewReflection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/edit/:id"
            element={
              <ProtectedRoute>
                <EditReflection />
              </ProtectedRoute>
            }
          />
          <Route path="/r/:id" element={<ReflectionPublic />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
