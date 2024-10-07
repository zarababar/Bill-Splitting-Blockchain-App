import axios from 'axios';

export const fetchFriends = async () => {
    try {
        const response = await axios.get('http://localhost:5000/api/friends');
        return response.data;
    } catch (error) {
        console.error('Error fetching friends:', error);
    }
};

export const fetchBills = async () => {
    try {
        const response = await axios.get('http://localhost:5000/api/bills');
        return response.data;
    } catch (error) {
        console.error('Error fetching bills:', error);
    }
};
