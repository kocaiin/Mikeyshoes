// pages/register.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaKey, setCaptchaKey] = useState('');// 用于刷新图片

  useEffect(() => {
    setCaptchaKey(Date.now());
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost/shoesEcomerce/api/register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, captcha: captchaInput}),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        throw new Error('服务器返回了无效的响应: ' + text.substring(0, 100));
      }

      if (!res.ok) {
        throw new Error(data.error || '注册失败');
      }

      toast.success('注册成功，请登录');
      // 刷新验证码
      setCaptchaKey(Date.now());
      setCaptchaInput('');
      router.push('/login');
    } catch (err) {
      toast.error(err.message || '注册失败，请重试');
      // 刷新验证码
      setCaptchaKey(Date.now());
      setCaptchaInput('');
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
          <h2>注册</h2>

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

            <div className="nike-input">
              <input
                type="text"
                required
                maxLength={4}
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                placeholder="Enter captcha"
              />
              {captchaKey && (
                <div style={{ marginTop: '10px', position: 'relative' }}>
                  <img
                    src={`http://localhost/shoesEcomerce/api/captcha.php?key=${captchaKey}`}
                    alt="captcha"
                    onClick={() => setCaptchaKey(Date.now())}
                    onError={(e) => {
                      console.error('验证码图片加载失败');
                      e.target.style.display = 'none';
                      toast.error('验证码图片加载失败，请刷新页面');
                    }}
                    style={{ 
                      cursor: 'pointer', 
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      padding: '5px'
                    }}
                  />
                  <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
                    点击图片刷新验证码
                  </small>
                </div>
              )}
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
