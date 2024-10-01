import React, { useState, useEffect } from 'react';
import { web3, contract } from './web3';

const BillSplitter = () => {
    const [totalAmount, setTotalAmount] = useState('');
    const [participants, setParticipants] = useState('');
    const [shareStatus, setShareStatus] = useState({});
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
        // Handle account changes
        window.ethereum.on('accountsChanged', (accounts) => {
            setAccount(accounts[0]);
        });

        return () => {
            window.ethereum.removeListener('accountsChanged', (accounts) => {
                setAccount(accounts[0]);
            });
        };
    }, []);

    const handleSplitBill = async () => {
        // Parse participants input
        const validParticipants = participants.split(',')
            .map(participant => participant.trim())
            .filter(participant => web3.utils.isAddress(participant));

        if (validParticipants.length === 0) {
            alert('Please enter valid Ethereum addresses for participants.');
            return;
        }

        // Log total amount and valid participants for debugging
        console.log("Total Amount:", totalAmount);
        console.log("Participants:", validParticipants);

        // Split the bill
        try {
            await contract.methods.splitBill(web3.utils.toWei(totalAmount, 'ether'), validParticipants)
                .send({ from: account });
            // Fetch share status after splitting the bill
            await fetchShareStatus(validParticipants);
        } catch (error) {
            console.error('Error splitting bill:', error);
            alert('Failed to split the bill. Please check the console for more details.');
        }
    };

    const fetchShareStatus = async (validParticipants) => {
        const status = {};
        for (const participant of validParticipants) {
            const trimmedParticipant = participant.trim(); // Trim whitespace
            const paid = await contract.methods.hasPaid(trimmedParticipant).call();
            const share = await contract.methods.shares(trimmedParticipant).call();
            status[trimmedParticipant] = { paid, share: web3.utils.fromWei(share, 'ether') }; // Convert share from wei to ETH for display
        }
        setShareStatus(status);
    };

    // const handlePayShare = async (participant) => {
    //     const share = shareStatus[participant]?.share;

    //     // Ensure share is valid before proceeding
    //     if (!share || parseFloat(share) <= 0) {
    //         alert('You do not owe anything or you have already paid.');
    //         return;
    //     }

    //     // Convert share from ETH to wei for the transaction
    //     try {
    //         await contract.methods.payShare().send({ from: participant, value: web3.utils.toWei(share, 'ether') });
    //         // Fetch share status again to update UI
    //         await fetchShareStatus(Object.keys(shareStatus));
    //     } catch (error) {
    //         console.error('Error paying share:', error);
    //         alert('Payment failed. Please check the console for more details.');
    //     }
    // };
    const handlePayShare = async (participant) => {
        const share = shareStatus[participant]?.share;

        // Ensure the share amount is valid before proceeding
        if (!share || parseFloat(share) <= 0) {
            alert('You do not owe anything or you have already paid.');
            return;
        }

        try {
            // Request account access from MetaMask
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const account = accounts[0]; // Use the first connected account

            // Proceed with the transaction using the authorized account
            await contract.methods.payShare().send({
                from: account, // Ensure this is the authorized MetaMask account
                value: web3.utils.toWei(share, 'ether'),
            });

            // Fetch the share status again to update the UI
            await fetchShareStatus(Object.keys(shareStatus));

        } catch (error) {
            console.error('Error paying share:', error);
            alert('Payment failed. Please check the console for more details.');
        }
    };

    return (
        <div className="container">
            <h1>Bill Splitter</h1>
            <div>
                <input
                    type="number"
                    placeholder="Total Amount in ETH"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Participants (comma-separated)"
                    onChange={(e) => setParticipants(e.target.value)}
                />
                <button onClick={handleSplitBill}>Split Bill</button>
            </div>
            <div className="status">
                <h2>Share Status</h2>
                <ul>
                    {Object.keys(shareStatus).map((participant) => (
                        <li key={participant}>
                            {participant}: {shareStatus[participant]?.share || '0'} ETH -
                            {shareStatus[participant]?.paid ? ' Paid' : ' Unpaid'}
                            {!shareStatus[participant]?.paid && (
                                <button onClick={() => handlePayShare(participant)}>Pay</button>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default BillSplitter;
