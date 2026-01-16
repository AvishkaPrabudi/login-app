
import React, { useEffect, useRef, useState } from 'react';

type User = {
  name: string;
  email: string;
  imageUrl: string;
};


const LoginForm = () => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [error, setError] = useState<string>('');
  const googleBtnRef = useRef<HTMLDivElement>(null);
  // Store token for session management
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));

  // Google Identity Services (wait for script load)
  useEffect(() => {
    if (user) return;
    function renderGoogleButton() {
      // @ts-ignore
      if (window.google && googleBtnRef.current) {
        // @ts-ignore
        window.google.accounts.id.initialize({
          client_id: '188770635170-v8g57o75ehs34jl6u04biuoddfat1hd5.apps.googleusercontent.com',
          callback: (response: any) => {
            // Decode JWT to get user info
            const base64Url = response.credential.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split('')
                .map(function (c) {
                  return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                })
                .join('')
            );
            const profile = JSON.parse(jsonPayload);
            const userObj = {
              name: profile.name,
              email: profile.email,
              imageUrl: profile.picture,
            };
            setUser(userObj);
            setError('');
            setToken(response.credential);
            localStorage.setItem('user', JSON.stringify(userObj));
            localStorage.setItem('token', response.credential);
            // Optionally, send token to backend:
            // fetch('/api/auth/google', { method: 'POST', body: JSON.stringify({ token: response.credential }) })
          },
        });
        // @ts-ignore
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          width: 340,
        });
      }
    }

    if (window.google && googleBtnRef.current) {
      renderGoogleButton();
    } else {
      const interval = setInterval(() => {
        if (window.google && googleBtnRef.current) {
          renderGoogleButton();
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Load Google Identity script
  useEffect(() => {
    if (document.getElementById('google-identity')) return;
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.id = 'google-identity';
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // GitHub OAuth
  const handleGitHubLogin = () => {
    const clientId = 'Ov23lixHBs6kNFJXbKQo';
    const redirectUri = window.location.origin;
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
    window.location.href = githubAuthUrl;
  };

  // GitHub OAuth callback handling (optional backend integration)
  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    if (code && !user) {
      // Optionally, send code to backend to exchange for access token and user info
      // fetch('/api/auth/github', { method: 'POST', body: JSON.stringify({ code }) })
      //   .then(res => res.json())
      //   .then(data => { setUser(data.user); setToken(data.token); localStorage.setItem('user', JSON.stringify(data.user)); localStorage.setItem('token', data.token); })
      //   .catch(() => setError('GitHub login failed.'));
      // For demo, just clear code from URL
      window.history.replaceState({}, document.title, url.pathname);
    }
  }, [user]);

  // Logout handler
  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setError('');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #2bc32b 0%, #4ad7e9 100%)' }}>
      <div style={{ width: '100%', maxWidth: 400, background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: 32, border: '1px solid #eee' }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: 'center', color: '#4f46e5', marginBottom: 32 }}>Sign In</h2>
        <div ref={googleBtnRef} style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: 16 }} />
        <button
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 16px', marginBottom: 16, background: '#222', color: '#fff', borderRadius: 8, fontWeight: 600, border: 'none', cursor: 'pointer' }}
          onClick={handleGitHubLogin}
        >
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .5C5.73.5.5 5.74.5 12.02c0 5.1 3.29 9.43 7.86 10.96.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.73 1.27 3.4.97.11-.75.41-1.27.74-1.56-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a10.9 10.9 0 0 1 2.9-.39c.98 0 1.97.13 2.9.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.41-5.25 5.7.42.36.79 1.09.79 2.2 0 1.59-.01 2.87-.01 3.26 0 .31.21.68.8.56C20.71 21.45 24 17.12 24 12.02 24 5.74 18.27.5 12 .5z"/></svg>
          Sign in with GitHub
        </button>
        {error && <div style={{ color: '#e11d48', textAlign: 'center', marginTop: 16 }}>{error}</div>}
        {user && (
          <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img src={user.imageUrl} alt="Profile" style={{ width: 80, height: 80, borderRadius: '50%', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: 16 }} />
            <div style={{ fontSize: 18, fontWeight: 600, color: '#222' }}>{user.name}</div>
            <div style={{ color: '#666', marginBottom: 8 }}>{user.email}</div>
            <button style={{ marginTop: 16, padding: '8px 24px', background: '#e11d48', color: '#fff', borderRadius: 8, border: 'none', fontWeight: 600, cursor: 'pointer' }} onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginForm;
