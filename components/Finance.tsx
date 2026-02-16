
import React, { useState } from 'react';
import { Fuel, Wrench, Droplets, Percent, Plus, TrendingUp } from 'lucide-react';
import { AppData, ExpenseType, Expense } from '../types';
import { addExpense } from '../storage';
import { format } from 'date-fns';

interface FinanceProps {
  data: AppData;
  onUpdate: () => void;
}

const Finance: React.FC<FinanceProps> = ({ data, onUpdate }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<ExpenseType>(ExpenseType.FUEL);
  const [notes, setNotes] = useState('');

  const handleAddExpense = () => {
    if (!amount) return;
    const newExpense: Expense = {
      id: Date.now().toString(),
      date: Date.now(),
      amount: parseFloat(amount),
      type,
      notes
    };
    addExpense(newExpense);
    setAmount('');
    setNotes('');
    setShowAdd(false);
    onUpdate();
  };

  const totalExpenses = data.expenses.reduce((acc, e) => acc + e.amount, 0);

  const getIcon = (t: ExpenseType) => {
    switch (t) {
      case ExpenseType.FUEL: return <Fuel className="text-orange-400" size={24} />;
      case ExpenseType.MAINTENANCE: return <Wrench className="text-blue-400" size={24} />;
      case ExpenseType.CAR_WASH: return <Droplets className="text-cyan-400" size={24} />;
      case ExpenseType.COMMISSION: return <Percent className="text-red-400" size={24} />;
      default: return <Plus className="text-gray-400" size={24} />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-3xl font-black">Finance</h2>
          <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black">Expenses & Net</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className={`w-14 h-14 rounded-3xl flex items-center justify-center transition-all shadow-2xl ${showAdd ? 'bg-gray-800 text-white rotate-45 border border-gray-700' : 'bg-green-500 text-black shadow-green-500/30'}`}
        >
          <Plus size={32} />
        </button>
      </header>

      {showAdd && (
        <section className="bg-gray-800 p-6 rounded-[32px] border border-green-500/30 space-y-5 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-xl">Log Expense</h3>
            <span className="text-[10px] bg-green-500/20 text-green-500 px-3 py-1 rounded-full font-black uppercase tracking-widest">Business Only</span>
          </div>
          
          <div className="relative">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-3xl font-black text-gray-600">₵</span>
            <input 
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              className="w-full bg-gray-900 border border-gray-700 rounded-2xl py-6 pl-14 pr-4 text-4xl font-black focus:border-green-500 outline-none transition-all"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[ExpenseType.FUEL, ExpenseType.MAINTENANCE, ExpenseType.CAR_WASH, ExpenseType.COMMISSION].map(t => (
              <button 
                key={t}
                onClick={() => setType(t)}
                className={`py-5 px-3 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${type === t ? 'border-green-500 bg-green-500/10 text-green-500 shadow-inner' : 'border-gray-700 text-gray-500'}`}
              >
                {getIcon(t)}
                <span className="text-[10px] font-black uppercase tracking-tight">{t.replace('_', ' ')}</span>
              </button>
            ))}
          </div>

          <textarea 
            placeholder="Notes (e.g., Shell Airport fuel)"
            className="w-full bg-gray-900 border border-gray-700 rounded-2xl p-5 text-base text-gray-300 resize-none outline-none focus:border-green-500"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <button 
            onClick={handleAddExpense}
            className="w-full py-5 bg-green-500 text-black font-black rounded-2xl text-lg shadow-xl shadow-green-500/20 uppercase"
          >
            Confirm Expense
          </button>
        </section>
      )}

      <div className="bg-gray-800/50 p-6 rounded-[32px] border border-gray-700 flex items-center justify-between shadow-xl">
        <div>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Total Spending</p>
          <p className="text-3xl font-black tabular-nums">₵{totalExpenses.toFixed(2)}</p>
        </div>
        <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20">
          <TrendingUp className="text-red-500 rotate-180" size={28} />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-black text-xs text-gray-500 uppercase tracking-[0.2em]">Transaction Log</h3>
        {data.expenses.length === 0 ? (
          <div className="text-center py-16 bg-gray-800/30 rounded-[32px] border border-dashed border-gray-700">
            <p className="text-gray-600 text-sm font-bold">Your ledger is empty.</p>
          </div>
        ) : (
          [...data.expenses].reverse().map(exp => (
            <div key={exp.id} className="bg-gray-800 p-5 rounded-3xl flex items-center justify-between border-l-[6px] border-l-red-500 shadow-sm">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center">
                  {getIcon(exp.type)}
                </div>
                <div>
                  <p className="font-black text-sm uppercase tracking-tight">{exp.type.replace('_', ' ')}</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{exp.notes || format(exp.date, 'MMM d, p')}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-red-500">- ₵{exp.amount.toFixed(2)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Finance;
