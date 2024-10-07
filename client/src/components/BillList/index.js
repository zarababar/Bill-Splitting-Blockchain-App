import React from 'react';
import { handlePayShare } from '../../utils/webUtils';

const BillList = ({ account, bills, setBills }) => {
    return (
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
                                        <span className="share-amount">
                                            {bill.shareStatus[friend.walletAddress]?.share || '0'} ETH
                                        </span>
                                        {bill.shareStatus[friend.walletAddress]?.paid ? (
                                            <span className="status-paid">Paid</span>
                                        ) : (
                                            <>
                                                <span className="status-unpaid">Unpaid</span>
                                                <button
                                                    onClick={() => handlePayShare(friend.walletAddress, bill._id, account, bills, setBills)}>
                                                    Pay
                                                </button>
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
    );
};

export default BillList;
