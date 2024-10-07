import React, { useState } from 'react';
import { handleAddBill } from '../../utils/webUtils';
import './BillForm.css';
const BillForm = ({ account, friends, bills, setBills }) => {
    const [totalAmount, setTotalAmount] = useState('');
    const [selectedFriends, setSelectedFriends] = useState([]);

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
        <div>
            <input
                type="number"
                placeholder="Total Amount in ETH"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
            />
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
                <button
                    onClick={() => handleAddBill(account, totalAmount, selectedFriends, setBills)}>
                    Split Bill
                </button>
            </div>
        </div>
    );
};

export default BillForm;
