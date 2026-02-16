
import React, { useState } from 'react';
import { User, Search, Phone, History, Plus, MoreVertical } from 'lucide-react';
import { AppData, Customer } from '../types';
import { addCustomer } from '../storage';

interface CustomersProps {
  data: AppData;
}

const Customers: React.FC<CustomersProps> = ({ data }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [search, setSearch] = useState('');

  const handleAdd = () => {
    if (!name) return;
    const newCust: Customer = {
      id: Date.now().toString(),
      name,
      nickname,
      notes: ''
    };
    addCustomer(newCust);
    setName('');
    setNickname('');
    setShowAdd(false);
  };

  const filteredCustomers = data.customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.nickname.toLowerCase().includes(search.toLowerCase())
  );

  const getCustomerEarnings = (id: string) => {
    return data.trips
      .filter(t => t.customerId === id)
      .reduce((acc, t) => acc + t.fare, 0);
  };

  return (
    <div className="p-4 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Riders</h2>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Frequent Customers</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-black shadow-lg shadow-green-500/20"
        >
          <Plus size={24} />
        </button>
      </header>

      {showAdd && (
        <div className="bg-gray-800 p-4 rounded-xl border border-green-500/30 space-y-3">
          <input 
            placeholder="Rider's Real Name"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input 
            placeholder="Nickname (e.g., 'Airport Man')"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
          <button 
            onClick={handleAdd}
            className="w-full py-3 bg-green-500 text-black font-bold rounded-lg"
          >
            Add Customer
          </button>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
        <input 
          placeholder="Search riders..."
          className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-20 bg-gray-800/50 rounded-3xl border border-dashed border-gray-700">
            <User size={48} className="mx-auto text-gray-700 mb-4" />
            <p className="text-gray-500 text-sm">No regular riders found.</p>
          </div>
        ) : (
          filteredCustomers.map(customer => (
            <div key={customer.id} className="bg-gray-800 p-4 rounded-2xl flex items-center justify-between shadow-sm active:bg-gray-750 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-600 rounded-xl flex items-center justify-center font-bold text-gray-400">
                  {customer.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold">{customer.nickname || customer.name}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <History size={12} />
                    Total Spent: ₵ {getCustomerEarnings(customer.id).toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="w-9 h-9 bg-gray-700 rounded-lg flex items-center justify-center text-green-500">
                  <Phone size={18} />
                </button>
                <button className="w-9 h-9 bg-gray-700 rounded-lg flex items-center justify-center text-gray-500">
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Customers;
