import React, { useState } from 'react';
import Bill from './Bill';

const BillSplitter = () => {
    const [bills, setBills] = useState([]);

    const addNewBill = () => {
        setBills([...bills, { id: bills.length + 1 }]);
    };

    return (
        <div className="container">
            <h1>Bill Splitter</h1>
            <button onClick={addNewBill}>Add New Bill</button>
            {bills.map((bill, index) => (
                <Bill key={index} billId={bill.id} />
            ))}
        </div>
    );
};

export default BillSplitter;
