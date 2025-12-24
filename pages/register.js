// pages/register.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost/shoesEcomerce/api/register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success('注册成功，请登录');
      router.push('/login');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="nike-auth">
      {/* 左侧视觉 */}
      <div className="nike-auth-left">
        <h1>
          CREATE<br />
          YOUR<br />
          ACCOUNT<span>.</span>
        </h1>
      </div>

      {/* 右侧表单 */}
      <div className="nike-auth-right">
        <div className="nike-card">
          <h2>Sign Up</h2>

          <form onSubmit={handleRegister}>
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
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <label>Password</label>
            </div>

            <button type="submit" className="nike-btn">
              CREATE ACCOUNT
            </button>
          </form>

          <p className="nike-switch">
            Already have an account? <a href="/login">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
