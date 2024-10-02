import React from 'react';

const BillForm = ({ totalAmount, setTotalAmount, participants, setParticipants, handleSplitBill }) => {
    return (
        <div>
            <h3>Split a New Bill</h3>
            <input
                type="text"
                placeholder="Total Amount (in ETH)"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
            />
            <input
                type="text"
                placeholder="Participants (comma separated addresses)"
                value={participants}
                onChange={(e) => setParticipants(e.target.value)}
            />
            <button onClick={handleSplitBill}>Split Bill</button>
        </div>
    );
};

export default BillForm;
