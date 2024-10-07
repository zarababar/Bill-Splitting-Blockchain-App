import React, { useState, useEffect } from 'react';
import { fetchFriends, fetchBills } from '../../api';
import BillForm from '../../components/BillForm';
import BillList from '../../components/BillList';
// import './BillSplitter.css';

const BillSplitter = () => {
    const [bills, setBills] = useState([]);
    const [friends, setFriends] = useState([]);
    const [account, setAccount] = useState('');

    useEffect(() => {
        const loadAccount = async () => {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                setAccount(accounts[0]);
            } catch (error) {
                console.error('Error requesting account:', error);
                alert('Please allow access to your MetaMask account.');
            }
        };

        loadAccount();
        fetchFriends().then(setFriends);
        fetchBills().then(setBills);

        window.ethereum.on('accountsChanged', (accounts) => {
            setAccount(accounts[0]);
        });

        return () => {
            window.ethereum.removeListener('accountsChanged', (accounts) => {
                setAccount(accounts[0]);
            });
        };
    }, []);

    return (
        <div className="container">
            <h1>Bill Splitter</h1>
            <BillForm
                account={account}
                friends={friends}
                bills={bills}
                setBills={setBills}
            />
            <BillList
                account={account}
                bills={bills}
                setBills={setBills}
            />
        </div>
    );
};

export default BillSplitter;
