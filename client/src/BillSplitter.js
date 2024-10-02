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
import { web3, contract } from './web3';
import './BillSplitter.css';

const BillSplitter = () => {
    const [bills, setBills] = useState([]); // Store multiple bills
    const [totalAmount, setTotalAmount] = useState('');
    const [friends, setFriends] = useState([]); // Store friends' data
    const [selectedFriends, setSelectedFriends] = useState([]); // Store selected friends
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

        // Fetch friends from the backend
        const fetchFriends = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/friends');
                const data = await response.json();
                setFriends(data); // Update friends state with fetched data
            } catch (error) {
                console.error('Error fetching friends:', error);
            }
        };

        fetchFriends();

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

    useEffect(() => {
        const fetchBills = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/bills');
                const fetchedBills = await response.json();

                // Ensure each bill has an array for selectedFriends
                const billsWithDefaults = fetchedBills.map(bill => ({
                    ...bill,
                    selectedFriends: bill.selectedFriends || [] // Ensure it's an array
                }));

                setBills(billsWithDefaults); // Update the state with fetched bills
            } catch (error) {
                console.error('Error fetching bills:', error);
            }
        };

        fetchBills();
    }, []);

    const handleAddBill = async () => {
        const validParticipants = selectedFriends.map(friend => friend.walletAddress).filter(address => web3.utils.isAddress(address));

        if (validParticipants.length === 0) {
            alert('Please select valid Ethereum addresses for participants.');
            return;
        }

        // Split the bill
        try {
            await contract.methods.splitBill(web3.utils.toWei(totalAmount, 'ether'), validParticipants)
                .send({ from: account, gas: 3000000 });

            // Fetch share status after splitting the bill
            const shareStatus = await fetchShareStatus(validParticipants);

            // Create the new bill object
            const newBill = {
                totalAmount,
                selectedFriends,
                shareStatus,
                _id: Date.now() // Added _id for uniqueness
            };

            // Save the new bill to the database
            await fetch('http://localhost:5000/api/bills', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newBill)
            });

            // Update state with the new bill
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
            status[participant] = { paid, share: web3.utils.fromWei(share, 'ether') }; // Convert share from wei to ETH for display
        }
        return status; // Return the fetched share status
    };

    const handlePayShare = async (participant, billId) => {
        const bill = bills.find(bill => bill._id === billId); // Find the bill by ID
        const share = bill.shareStatus[participant]?.share; // Get the share amount for the participant

        if (!share || parseFloat(share) <= 0) {
            alert('You do not owe anything or you have already paid.');
            return;
        }

        try {
            // Proceed with the transaction using the authorized account
            await contract.methods.payShare(billId).send({
                from: account,
                value: web3.utils.toWei(share, 'ether'),
            });

            // Update the share status for the participant who paid
            const updatedShareStatus = { ...bill.shareStatus };
            updatedShareStatus[participant].paid = true; // Mark as paid

            // Create a new bill object with the updated share status
            const updatedBill = {
                ...bill,
                shareStatus: updatedShareStatus,
            };

            // Update the state without fetching all bills again
            setBills(prevBills => {
                return prevBills.map(b => (b._id === billId ? updatedBill : b));
            });

        } catch (error) {
            console.error('Error paying share:', error);
            alert('Payment failed. Please check the console for more details.');
        }
    };
    // Toggle selected friends
    const toggleFriendSelection = (friend) => {
        setSelectedFriends((prevSelected) => {
            if (prevSelected.includes(friend)) {
                return prevSelected.filter((selectedFriend) => selectedFriend !== friend);
            }
            return [...prevSelected, friend];
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
                    <p>No bills added yet.</p> // Message for empty bills array
                ) : (
                    bills.map((bill, billIndex) => (
                        <div key={billIndex} className="bill">
                            <h3>Bill {billIndex + 1} - Total: {bill.totalAmount} ETH</h3>
                            <ul>
                                {bill.selectedFriends && bill.selectedFriends.length > 0 ? (
                                    bill.selectedFriends.map(friend => (
                                        <li key={friend.walletAddress}>
                                            {friend.name} ({friend.walletAddress}): {bill.shareStatus[friend.walletAddress]?.share || '0'} ETH -
                                            {bill.shareStatus[friend.walletAddress]?.paid ? ' Paid' : ' Unpaid'}
                                            {!bill.shareStatus[friend.walletAddress]?.paid && (
                                                <button onClick={() => handlePayShare(friend.walletAddress, bill._id)}>Pay</button> // Pass bill._id here
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
