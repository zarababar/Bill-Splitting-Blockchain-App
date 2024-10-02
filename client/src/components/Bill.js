import React, { useState } from 'react';
import BillForm from './BillForm';
import ShareStatus from './ShareStatus';
import { web3, contract } from '../web3';

const Bill = ({ billId }) => {
    const [totalAmount, setTotalAmount] = useState('');
    const [participants, setParticipants] = useState('');
    const [shareStatus, setShareStatus] = useState({});
    const [account, setAccount] = useState('');

    // Function to handle splitting the bill
    const handleSplitBill = async () => {
        const validParticipants = participants
            .split(',')
            .map(participant => participant.trim())
            .filter(participant => web3.utils.isAddress(participant));

        if (validParticipants.length === 0) {
            alert('Please enter valid Ethereum addresses.');
            return;
        }

        try {
            // Request the user's account
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const account = accounts[0]; // Use the first account
            setAccount(account);  // Store account in state

            // Split the bill by calling the smart contract
            const result = await contract.methods
                .splitBill(web3.utils.toWei(totalAmount, 'ether'), validParticipants)
                .send({ from: account, gas: 500000 });  // Pass the user's account in the 'from' field

            // Check if the event was emitted
            if (result.events && result.events.BillCreated) {
                const billId = result.events.BillCreated.returnValues.billId;
                // Fetch the share status for all participants after splitting the bill
                await fetchShareStatus(validParticipants, billId);
            } else {
                console.error('BillCreated event not emitted:', result);
                alert('Bill was created, but the event was not emitted.');
            }
        } catch (error) {
            console.error('Error splitting bill:', error);
            alert('Failed to split the bill.');
        }
    };

    // Fetch share status for each participant
    const fetchShareStatus = async (validParticipants, billId) => {
        const status = {};
        for (const participant of validParticipants) {
            // Fetch from the contract using the billId
            const paid = await contract.methods.hasParticipantPaid(billId, participant.trim()).call();
            const share = await contract.methods.getShare(billId, participant.trim()).call();
            status[participant] = { paid, share: web3.utils.fromWei(share, 'ether') };
        }
        setShareStatus(status);
    };

    return (
        <div className="bill">
            <h2>Bill {billId}</h2>
            <BillForm
                totalAmount={totalAmount}
                setTotalAmount={setTotalAmount}
                participants={participants}
                setParticipants={setParticipants}
                handleSplitBill={handleSplitBill}
            />
            <ShareStatus shareStatus={shareStatus} fetchShareStatus={fetchShareStatus} billId={billId} />
        </div>
    );
};

export default Bill;
