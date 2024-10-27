// frontend/src/User.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function User() {
    const [username, setUsername] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get('http://localhost:5000/user', {
                    headers: { Authorization: localStorage.getItem('token') },
                });
                setUsername(res.data.username);
            } catch (err) {
                console.error('Error fetching user data', err);
                // Optionally, you can redirect to login if fetching user fails
               navigate('/');
            }
        };
        fetchUser();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token'); // Clear the token
        navigate('/'); // Redirect to the login page
    };

    return (
        <div>
            <h2>Welcome, {username}</h2>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}

export default User;
