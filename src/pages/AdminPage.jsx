import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import './AdminPage.css';

const AdminPage = () => {
    // Admin Auth State
    const [isAdmin, setIsAdmin] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({ username: '', level: 1, totalWP: 0 });

    useEffect(() => {
        if (isAdmin) {
            fetchUsers();
        }
    }, [isAdmin]);

    const handleLogin = (e) => {
        e.preventDefault();
        // Validation with hardcoded credentials
        if (email === 'waterloo5858@gmail.com' && password === 'komuru5588') {
            setIsAdmin(true);
        } else {
            alert('IDまたはパスワードが正しくありません');
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, 'users'));
            const userList = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    username: data.gameState?.username || 'No Name',
                    level: data.gameState?.level || 1,
                    totalWP: data.gameState?.totalWP || 0,
                    lastLogin: data.gameState?.lastLoginDate || 'N/A'
                };
            });
            // Sort by last login (newest first)
            userList.sort((a, b) => new Date(b.lastLogin) - new Date(a.lastLogin));
            setUsers(userList);
        } catch (error) {
            console.error("Error fetching users:", error);
            alert("ユーザー情報の取得に失敗しました");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm("本当にこのユーザーを削除しますか？\nこの操作は取り消せません。")) return;

        try {
            await deleteDoc(doc(db, 'users', userId));
            setUsers(users.filter(u => u.id !== userId));
            alert("削除しました");
        } catch (error) {
            console.error("Error deleting user:", error);
            alert("削除に失敗しました");
        }
    };

    const startEdit = (user) => {
        setEditingUser(user);
        setEditForm({
            username: user.username,
            level: user.level,
            totalWP: user.totalWP
        });
    };

    const cancelEdit = () => {
        setEditingUser(null);
    };

    const handleSave = async () => {
        if (!editingUser) return;

        try {
            const userRef = doc(db, 'users', editingUser.id);
            await updateDoc(userRef, {
                'gameState.username': editForm.username,
                'gameState.level': Number(editForm.level),
                'gameState.totalWP': Number(editForm.totalWP)
            });

            setUsers(users.map(u =>
                u.id === editingUser.id ? { ...u, ...editForm, level: Number(editForm.level), totalWP: Number(editForm.totalWP) } : u
            ));
            setEditingUser(null);
        } catch (error) {
            console.error("Error updating user:", error);
            alert("更新に失敗しました");
        }
    };

    if (!isAdmin) {
        return (
            <div className="admin-login-container">
                <div className="admin-login-box">
                    <h2>管理画面 ログイン</h2>
                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <label>ID (Email)</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="example@gmail.com"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="********"
                                required
                            />
                        </div>
                        <button type="submit" className="login-btn">ログイン</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <header className="admin-header">
                <h1>Admin Dashboard</h1>
                <div className="header-actions">
                    <button onClick={fetchUsers} className="refresh-btn">更新</button>
                    <button onClick={() => setIsAdmin(false)} className="logout-btn">ログアウト</button>
                </div>
            </header>

            <div className="admin-content">
                {loading ? (
                    <p className="loading-text">Loading...</p>
                ) : (
                    <div className="table-responsive">
                        <table className="user-table">
                            <thead>
                                <tr>
                                    <th>ID / Last Login</th>
                                    <th>Name</th>
                                    <th>Level</th>
                                    <th>Total (mins)</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td className="col-meta" data-label="ID/Login">
                                            <div className="user-id" title={user.id}>{user.id.substring(0, 8)}...</div>
                                            <div className="last-login">{new Date(user.lastLogin).toLocaleDateString()}</div>
                                        </td>
                                        <td data-label="Name">
                                            {editingUser?.id === user.id ? (
                                                <input
                                                    value={editForm.username}
                                                    onChange={e => setEditForm({ ...editForm, username: e.target.value })}
                                                    className="edit-input"
                                                />
                                            ) : (
                                                <span className="user-name">{user.username}</span>
                                            )}
                                        </td>
                                        <td data-label="Level">
                                            {editingUser?.id === user.id ? (
                                                <input
                                                    type="number"
                                                    value={editForm.level}
                                                    onChange={e => setEditForm({ ...editForm, level: e.target.value })}
                                                    className="edit-input sm"
                                                />
                                            ) : user.level}
                                        </td>
                                        <td data-label="Time">
                                            {editingUser?.id === user.id ? (
                                                <input
                                                    type="number"
                                                    value={editForm.totalWP}
                                                    onChange={e => setEditForm({ ...editForm, totalWP: e.target.value })}
                                                    className="edit-input sm"
                                                />
                                            ) : `${Math.floor(user.totalWP / 60)}h ${user.totalWP % 60}m`}
                                        </td>
                                        <td className="col-actions" data-label="Actions">
                                            {editingUser?.id === user.id ? (
                                                <div className="action-buttons">
                                                    <button onClick={handleSave} className="save-btn">保存</button>
                                                    <button onClick={cancelEdit} className="cancel-btn">中止</button>
                                                </div>
                                            ) : (
                                                <div className="action-buttons">
                                                    <button onClick={() => startEdit(user)} className="edit-btn">編集</button>
                                                    <button onClick={() => handleDelete(user.id)} className="delete-btn">削除</button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPage;
