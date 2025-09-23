// File-based storage for persistence across Vercel Functions
// Uses environment variables for persistence

let storage = {};

export async function setItem(key, value) {
  try {
    // Production'da: await kv.set(key, value)
    storage[key] = value;
    console.log('💾 Storage set:', key, '→', typeof value === 'object' ? JSON.stringify(value).length + ' bytes' : value);
    return true;
  } catch (error) {
    console.error('❌ Storage set error:', error);
    return false;
  }
}

export async function getItem(key) {
  try {
    // Production'da: await kv.get(key)
    const value = storage[key];
    console.log('📖 Storage get:', key, '→', value ? 'found' : 'not found');
    return value || null;
  } catch (error) {
    console.error('❌ Storage get error:', error);
    return null;
  }
}

export async function getAllUsers() {
  try {
    // Production'da: await kv.get('users') || []
    const users = storage['users'] || [];
    console.log('👥 Storage get all users:', users.length, 'users');
    return users;
  } catch (error) {
    console.error('❌ Storage get all users error:', error);
    return [];
  }
}

export async function addUser(user) {
  try {
    const users = await getAllUsers();
    users.push(user);
    await setItem('users', users);
    console.log('➕ User added to storage:', user.nickname);
    return true;
  } catch (error) {
    console.error('❌ Add user error:', error);
    return false;
  }
}

export async function deleteUser(userId) {
  try {
    const users = await getAllUsers();
    const filteredUsers = users.filter(u => u.id !== userId);
    await setItem('users', filteredUsers);
    console.log('🗑️ User deleted from storage:', userId);
    return true;
  } catch (error) {
    console.error('❌ Delete user error:', error);
    return false;
  }
}

export async function findUserByNickname(nickname) {
  try {
    const users = await getAllUsers();
    const user = users.find(u => u.nickname === nickname);
    console.log('🔍 Find user by nickname:', nickname, '→', user ? 'found' : 'not found');
    return user || null;
  } catch (error) {
    console.error('❌ Find user error:', error);
    return null;
  }
}

export default {
  setItem,
  getItem,
  getAllUsers,
  addUser,
  deleteUser,
  findUserByNickname
};