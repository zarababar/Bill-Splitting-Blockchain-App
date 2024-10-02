// import React, { useState, useEffect } from 'react';
// import { web3, contract } from './web3';
// import './BillSplitter.css';
// const BillSplitter = () => {
//     const [totalAmount, setTotalAmount] = useState('');
//     const [friends, setFriends] = useState([]); // Store friends' data
//     const [selectedFriends, setSelectedFriends] = useState([]); // Store selected friends
//     const [shareStatus, setShareStatus] = useState({});
//     const [account, setAccount] = useState('');

//     useEffect(() => {
//         const loadAccount = async () => {
//             try {
//                 const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
//                 setAccount(accounts[0]);
//             } catch (error) {
//                 console.error('Error requesting account:', error);
//                 alert('Please allow access to your MetaMask account.');
//             }
//         };

//         loadAccount();

//         // Fetch friends from the backend
//         const fetchFriends = async () => {
//             try {
//                 const response = await fetch('http://localhost:5000/api/friends');
//                 const data = await response.json();
//                 setFriends(data); // Update friends state with fetched data
//             } catch (error) {
//                 console.error('Error fetching friends:', error);
//             }
//         };

//         fetchFriends();

//         // Handle account changes
//         window.ethereum.on('accountsChanged', (accounts) => {
//             setAccount(accounts[0]);
//         });

//         return () => {
//             window.ethereum.removeListener('accountsChanged', (accounts) => {
//                 setAccount(accounts[0]);
//             });
//         };
//     }, []);

//     const handleSplitBill = async () => {
//         const validParticipants = selectedFriends.map(friend => friend.walletAddress).filter(address => web3.utils.isAddress(address));

//         if (validParticipants.length === 0) {
//             alert('Please select valid Ethereum addresses for participants.');
//             return;
//         }

//         // Log total amount and valid participants for debugging
//         console.log("Total Amount:", totalAmount);
//         console.log("Participants:", validParticipants);

//         // Split the bill
//         try {
//             await contract.methods.splitBill(web3.utils.toWei(totalAmount, 'ether'), validParticipants)
//                 .send({ from: account });
//             // Fetch share status after splitting the bill
//             await fetchShareStatus(validParticipants);
//         } catch (error) {
//             console.error('Error splitting bill:', error);
//             alert('Failed to split the bill. Please check the console for more details.');
//         }
//     };

//     const fetchShareStatus = async (validParticipants) => {
//         const status = {};
//         for (const participant of validParticipants) {
//             const paid = await contract.methods.hasPaid(participant).call();
//             const share = await contract.methods.shares(participant).call();
//             status[participant] = { paid, share: web3.utils.fromWei(share, 'ether') }; // Convert share from wei to ETH for display
//         }
//         setShareStatus(status);
//     };

//     const handlePayShare = async (participant) => {
//         const share = shareStatus[participant]?.share;

//         // Ensure the share amount is valid before proceeding
//         if (!share || parseFloat(share) <= 0) {
//             alert('You do not owe anything or you have already paid.');
//             return;
//         }

//         try {
//             // Request account access from MetaMask
//             const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
//             const account = accounts[0]; // Use the first connected account

//             // Proceed with the transaction using the authorized account
//             await contract.methods.payShare().send({
//                 from: account,
//                 value: web3.utils.toWei(share, 'ether'),
//             });

//             // Fetch the share status again to update the UI
//             await fetchShareStatus(Object.keys(shareStatus));

//         } catch (error) {
//             console.error('Error paying share:', error);
//             alert('Payment failed. Please check the console for more details.');
//         }
//     };

//     // Toggle selected friends
//     const toggleFriendSelection = (friend) => {
//         setSelectedFriends((prevSelected) => {
//             if (prevSelected.includes(friend)) {
//                 return prevSelected.filter((selectedFriend) => selectedFriend !== friend);
//             }
//             return [...prevSelected, friend];
//         });
//     };

//     return (
//         <div className="container">
//             <h1>Bill Splitter</h1>
//             <div>
//                 <input
//                     type="number"
//                     placeholder="Total Amount in ETH"
//                     value={totalAmount}
//                     onChange={(e) => setTotalAmount(e.target.value)}
//                 />
//             </div>
//             <div className="participant-selection">
//                 <h2>Select Participants</h2>
//                 <ul>
//                     {friends.map(friend => (
//                         <li key={friend.walletAddress}>
//                             <label>
//                                 <input
//                                     type="checkbox"
//                                     checked={selectedFriends.includes(friend)}
//                                     onChange={() => toggleFriendSelection(friend)}
//                                 />
//                                 <div className="friend-info">
//                                     <span className="name">{friend.name}</span>
//                                     <span className="wallet">{friend.walletAddress}</span>
//                                 </div>
//                             </label>
//                         </li>
//                     ))}
//                 </ul>
//                 <button onClick={handleSplitBill}>Split Bill</button>
//             </div>
//             <div className="status">
//                 <h2>Share Status</h2>
//                 <ul>
//                     {Object.keys(shareStatus).map((participant) => (
//                         <li key={participant}>
//                             {participant}: {shareStatus[participant]?.share || '0'} ETH -
//                             {shareStatus[participant]?.paid ? ' Paid' : ' Unpaid'}
//                             {!shareStatus[participant]?.paid && (
//                                 <button onClick={() => handlePayShare(participant)}>Pay</button>
//                             )}
//                         </li>
//                     ))}
//                 </ul>
//             </div>
//         </div>
//     );
// };

// export default BillSplitter;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { web3, contract } from './web3';
import './BillSplitter.css';

const BillSplitter = () => {
    const [bills, setBills] = useState([]);
    const [totalAmount, setTotalAmount] = useState('');
    const [friends, setFriends] = useState([]);
    const [selectedFriends, setSelectedFriends] = useState([]);
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
        fetchFriends();
        fetchBills();

        window.ethereum.on('accountsChanged', (accounts) => {
            setAccount(accounts[0]);
        });

        return () => {
            window.ethereum.removeListener('accountsChanged', (accounts) => {
                setAccount(accounts[0]);
            });
        };
    }, []);

    const fetchFriends = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/friends');
            setFriends(response.data);
        } catch (error) {
            console.error('Error fetching friends:', error);
        }
    };

    const fetchBills = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/bills');
            setBills(response.data);
        } catch (error) {
            console.error('Error fetching bills:', error);
        }
    };

    const handleAddBill = async () => {
        if (!totalAmount || isNaN(totalAmount) || parseFloat(totalAmount) <= 0) {
            alert('Please enter a valid total amount.');
            return;
        }

        const validParticipants = selectedFriends.map(friend => friend.walletAddress).filter(address => web3.utils.isAddress(address));

        if (validParticipants.length === 0) {
            alert('Please select valid Ethereum addresses for participants.');
            return;
        }

        try {
            await contract.methods.splitBill(web3.utils.toWei(totalAmount, 'ether'), validParticipants)
                .send({ from: account, gas: 3000000 });

            // Fetch share status after splitting the bill
            const shareStatus = await fetchShareStatus(validParticipants);

            const newBill = {
                totalAmount,
                selectedFriends,
                shareStatus,
            };

            await axios.post('http://localhost:5000/api/bills', newBill);
            setBills(prevBills => [...prevBills, newBill]);

            // Reset state for the next bill
            setTotalAmount('');
            setSelectedFriends([]);
        } catch (error) {
            console.error('Error splitting bill:', error);
            alert('Failed to split the bill. Please check the console for more details.');
        }
    };

    const fetchShareStatus = async (validParticipants) => {
        const status = {};
        for (const participant of validParticipants) {
            const paid = await contract.methods.hasPaid(participant).call();
            const share = await contract.methods.shares(participant).call();
            status[participant] = { paid, share: web3.utils.fromWei(share, 'ether') };
        }
        return status;
    };

    const handlePayShare = async (participant, billId) => {
        const bill = bills.find(bill => bill._id === billId);
        const share = bill.shareStatus[participant]?.share;

        if (!share || parseFloat(share) <= 0) {
            alert('You do not owe anything or you have already paid.');
            return;
        }

        try {
            await contract.methods.payShare(billId).send({
                from: account,
                value: web3.utils.toWei(share, 'ether'),
            });

            const updatedShareStatus = { ...bill.shareStatus };
            updatedShareStatus[participant].paid = true;

            const updatedBill = {
                ...bill,
                shareStatus: updatedShareStatus,
            };

            setBills(prevBills => prevBills.map(b => (b._id === billId ? updatedBill : b)));
            console.log(".....bill", bills)
            console.log("Type of billId:", typeof billId);
            console.log("billId", billId)
            const response = await axios.put(`http://localhost:5000/api/bills/${billId}/participants`, {
                participant,
                paid: true
            });
            // Update state with the new bill data from response
            // setBills(prevBills => prevBills.map(b => (b._id === billId ? response.data : b)));


        } catch (error) {
            console.error('Error paying share:', error);
            alert('Payment failed. Please check the console for more details.');
        }
    };

    const toggleFriendSelection = (friend) => {
        setSelectedFriends((prevSelected) => {
            const selectedSet = new Set(prevSelected.map(f => f.walletAddress));
            if (selectedSet.has(friend.walletAddress)) {
                selectedSet.delete(friend.walletAddress);
            } else {
                selectedSet.add(friend.walletAddress);
            }
            return [...selectedSet].map(address => friends.find(f => f.walletAddress === address));
        });
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
            </div>
            <div className="participant-selection">
                <h2>Select Participants</h2>
                <ul>
                    {friends.map(friend => (
                        <li key={friend.walletAddress}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={selectedFriends.includes(friend)}
                                    onChange={() => toggleFriendSelection(friend)}
                                />
                                <div className="friend-info">
                                    <span className="name">{friend.name}</span>
                                    <span className="wallet">{friend.walletAddress}</span>
                                </div>
                            </label>
                        </li>
                    ))}
                </ul>
                <button onClick={handleAddBill}>Split Bill</button>
            </div>

            <div className="status">
                <h2>Share Status</h2>
                {bills.length === 0 ? (
                    <p>No bills added yet.</p>
                ) : (
                    bills.map((bill, billIndex) => (
                        <div key={billIndex} className="bill">
                            <h3>Bill {billIndex + 1} - Total: {bill.totalAmount} ETH</h3>
                            <ul>
                                {bill.selectedFriends.length > 0 ? (
                                    bill.selectedFriends.map(friend => (
                                        <li key={friend.walletAddress}>
                                            {friend.name} ({friend.walletAddress}):
                                            {/* {bill.shareStatus[friend.walletAddress]?.share || '0'} ETH -
                                            {bill.shareStatus[friend.walletAddress]?.paid ? <span className="status-paid">Paid</span> : <span className="status-unpaid">Unpaid</span>}
                                            {!bill.shareStatus[friend.walletAddress]?.paid && (

                                                <button onClick={() => handlePayShare(friend.walletAddress, bill._id)}>Pay</button>
                                            )} */}
                                            {bill.shareStatus[friend.walletAddress]?.share ? (
                                                <span className="share-amount">
                                                    {bill.shareStatus[friend.walletAddress]?.share || '0'} ETH
                                                </span>
                                            ) : (
                                                <span className="share-amount">0 ETH</span>
                                            )}
                                            {bill.shareStatus[friend.walletAddress]?.paid ? (
                                                <span className="status-paid">Paid</span>
                                            ) : (
                                                <>
                                                    <span className="status-unpaid">Unpaid</span>
                                                    <button onClick={() => handlePayShare(friend.walletAddress, bill._id)}>Pay</button>
                                                </>
                                            )}

                                        </li>
                                    ))
                                ) : (
                                    <p>No participants for this bill.</p>
                                )}
                            </ul>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default BillSplitter;
