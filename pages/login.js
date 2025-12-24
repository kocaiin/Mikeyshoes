// pages/login.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost/shoesEcomerce/api/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password}),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success('登录成功');
      router.push('/');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="nike-auth">
      <div className="nike-auth-left">
        <h1>
          JUST<br />
          DO<br />
          IT<span>.</span>
        </h1>
      </div>

      <div className="nike-auth-right">
        <div className="nike-card">
          <h2>登录</h2>

          <form onSubmit={handleLogin}>
            <div className="nike-input">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label>Email</label>
            </div>

            <div className="nike-input">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <label>Password</label>
            </div>

            <button type="submit" className="nike-btn">
              LOGIN
            </button>
          </form>

          <p className="nike-switch">
            No account? <a href="/register">Create one</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
