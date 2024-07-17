import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios';

const Dashboard = () => {
    const navigate = useNavigate();
    axios.defaults.withCredentials = true;
    useEffect(() => {
        axios.get('http://localhost:3000/auth/verify')
            .then(res => {
                if (res.data.status) {

                }
                else {
                    navigate('/')
                }
            })
    }, [])
    return (
        <div>Dashboard</div>
    )
}

export default Dashboard;