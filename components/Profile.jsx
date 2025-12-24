// components/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useStateContext } from '../context/StateContext';
import { toast } from 'react-hot-toast';

const Profile = () => {
  const { setShowProfile } = useStateContext();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [userInfo, setUserInfo] = useState({
    name: '',
    address: '',
    avatar: '',
    points: 0,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser) {
      setShowProfile(false);
      router.push('/login');
      return;
    }
    setUser(storedUser);
    fetchUserInfo(storedUser.id);
  }, []);

  const fetchUserInfo = async (userId) => {
    try {
      const res = await fetch(
        `http://localhost/shoesEcomerce/api/getUserInfo.php?user_id=${userId}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setUserInfo({
        name: data.name,
        address: data.address,
        avatar: data.avatar,
        points: data.points,
      });
      setPreviewUrl(
        data.avatar || 'https://api.dicebear.com/7.x/identicon/svg?seed=user'
      );
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile || !user) return;

    const formData = new FormData();
    formData.append('avatar', avatarFile);
    formData.append('user_id', user.id);

    try {
      const res = await fetch(
        'http://localhost/shoesEcomerce/api/uploadAvatar.php',
        {
          method: 'POST',
          body: formData,
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success('头像已更新');
      setAvatarFile(null);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSaveInfo = async () => {
    try {
      const res = await fetch(
        'http://localhost/shoesEcomerce/api/updateUserInfo.php',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            name: userInfo.name,
            address: userInfo.address,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success('信息已保存');
      setIsEditing(false);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setShowProfile(false);
    router.push('/login');
  };

  return (
    <div className="nike-profile-mask">
      <aside className="nike-profile">
        <button className="nike-profile-close" onClick={() => setShowProfile(false)}>
          ×
        </button>

        {/* Header */}
        <div className="nike-profile-header">
          <div className="nike-avatar">
            <img src={previewUrl} alt="avatar" />
            <label className="nike-avatar-upload">
              +
              <input type="file" hidden onChange={handleAvatarChange} />
            </label>
          </div>

          {avatarFile && (
            <button className="nike-avatar-save" onClick={handleAvatarUpload}>
              SAVE AVATAR
            </button>
          )}

          <h3>{userInfo.name || 'Member'}</h3>
          <p>{userInfo.points} POINTS</p>
        </div>

        {/* Info */}
        <div className="nike-profile-body">
          <label>Name</label>
          <input
            value={userInfo.name}
            disabled={!isEditing}
            onChange={(e) =>
              setUserInfo({ ...userInfo, name: e.target.value })
            }
          />

          <label>Address</label>
          <input
            value={userInfo.address}
            disabled={!isEditing}
            onChange={(e) =>
              setUserInfo({ ...userInfo, address: e.target.value })
            }
          />

          {!isEditing ? (
            <button className="nike-outline-btn" onClick={() => setIsEditing(true)}>
              EDIT PROFILE
            </button>
          ) : (
            <button className="nike-btn" onClick={handleSaveInfo}>
              SAVE CHANGES
            </button>
          )}

          <button className="nike-danger-btn" onClick={handleLogout}>
            LOG OUT
          </button>
        </div>
      </aside>
    </div>
  );
};

export default Profile;
