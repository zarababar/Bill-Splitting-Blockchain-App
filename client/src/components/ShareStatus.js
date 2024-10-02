import React from 'react';
import { web3, contract } from '../web3';

const ShareStatus = ({ shareStatus, fetchShareStatus, billId }) => {
    const handlePayShare = async (participant) => {
        const share = shareStatus[participant]?.share;
        if (!share || parseFloat(share) <= 0) {
            alert('No outstanding balance.');
            return;
        }

        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const account = accounts[0];

            // Pass billId when calling payShare
            await contract.methods.payShare(billId).send({
                from: account,
                value: web3.utils.toWei(share, 'ether'),
            });

            // Refresh the share status after payment
            await fetchShareStatus(Object.keys(shareStatus), billId);
        } catch (error) {
            console.error('Error paying share:', error);
            alert('Payment failed.');
        }
    };

    return (
        <div className="share-status">
            <h3>Share Status</h3>
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
    );
};

export default ShareStatus;
