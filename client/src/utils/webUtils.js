import { web3, contract } from '../web3';
import axios from 'axios';

export const handleAddBill = async (account, totalAmount, selectedFriends, setBills) => {
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

        const shareStatus = await fetchShareStatus(validParticipants);

        const newBill = {
            totalAmount,
            selectedFriends,
            shareStatus,
        };

        await axios.post('http://localhost:5000/api/bills', newBill);
        setBills(prevBills => [...prevBills, newBill]);

        window.location.reload();
    } catch (error) {
        console.error('Error splitting bill:', error);
        alert('Failed to split the bill. Please check the console for more details.');
    }
};

export const fetchShareStatus = async (validParticipants) => {
    const status = {};
    for (const participant of validParticipants) {
        const paid = await contract.methods.hasPaid(participant).call();
        const share = await contract.methods.shares(participant).call();
        status[participant] = { paid, share: web3.utils.fromWei(share, 'ether') };
    }
    return status;
};

export const handlePayShare = async (participant, billId, account, bills, setBills) => {
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

        const response = await axios.put(`http://localhost:5000/api/bills/${billId}/participants`, {
            participant,
            paid: true
        });

        const allPaid = Object.values(updatedShareStatus).every(status => status.paid);

        if (allPaid) {
            setBills(prevBills => prevBills.filter(b => b._id !== billId));
            await axios.delete(`http://localhost:5000/api/bills/${billId}`);
        }
    } catch (error) {
        console.error('Error paying share:', error);
    }
};
