import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { useAuth } from '../../auth';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as any;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate(location.state?.from?.pathname || '/admin');
    } catch {
      setError('Invalid email or password');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '4rem auto' }}>
      <h1>Admin Sign In</h1>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Sign in</button>
      </form>
    </div>
  );
}
