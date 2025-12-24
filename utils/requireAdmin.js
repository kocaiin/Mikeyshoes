export function requireAdmin(router) {
    if (typeof window === 'undefined') return false;
  
    const user = JSON.parse(localStorage.getItem('user') || 'null');
  
    if (!user || user.role !== 'admin') {
      router.replace('/');
      return false;
    }
  
    return true;
  }
  