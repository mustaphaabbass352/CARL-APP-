
import React from 'react';
import { AppData } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ReportsProps {
  data: AppData;
}

const Reports: React.FC<ReportsProps> = ({ data }) => {
  const totalEarnings = data.trips.reduce((acc, t) => acc + t.fare, 0);
  const totalExpenses = data.expenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = totalEarnings - totalExpenses;

  const expenseData = [
    { name: 'Fuel', value: data.expenses.filter(e => e.type === 'FUEL').reduce((acc, e) => acc + e.amount, 0) },
    { name: 'Repair', value: data.expenses.filter(e => e.type === 'MAINTENANCE').reduce((acc, e) => acc + e.amount, 0) },
    { name: 'Wash', value: data.expenses.filter(e => e.type === 'CAR_WASH').reduce((acc, e) => acc + e.amount, 0) },
    { name: 'Comm.', value: data.expenses.filter(e => e.type === 'COMMISSION').reduce((acc, e) => acc + e.amount, 0) },
  ].filter(d => d.value > 0);

  const COLORS = ['#f97316', '#3b82f6', '#06b6d4', '#ef4444'];

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold">Performance</h2>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800 p-5 rounded-2xl border border-gray-700">
          <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Total Trips</p>
          <p className="text-2xl font-black">{data.trips.length}</p>
        </div>
        <div className="bg-gray-800 p-5 rounded-2xl border border-gray-700">
          <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Profit Margin</p>
          <p className="text-2xl font-black">{totalEarnings > 0 ? ((netProfit / totalEarnings) * 100).toFixed(0) : 0}%</p>
        </div>
      </div>

      <section className="bg-gray-800 p-6 rounded-3xl space-y-6">
        <div className="text-center">
          <p className="text-gray-400 text-sm">All-Time Net Profit</p>
          <h3 className={`text-4xl font-black mt-1 ${netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            ₵ {netProfit.toFixed(2)}
          </h3>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Gross Revenue</span>
            <span className="font-bold">₵ {totalEarnings.toFixed(2)}</span>
          </div>
          <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-green-500 h-full" 
              style={{ width: totalEarnings > 0 ? `${(netProfit / totalEarnings) * 100}%` : '0%' }}
            />
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Total Expenses</span>
            <span className="font-bold text-red-400">- ₵ {totalExpenses.toFixed(2)}</span>
          </div>
        </div>
      </section>

      {expenseData.length > 0 && (
        <section className="bg-gray-800 p-6 rounded-3xl">
          <h4 className="font-bold text-sm mb-4 uppercase tracking-widest text-gray-500">Expense Breakdown</h4>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px'}}
                  itemStyle={{color: '#fff'}}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      <div className="bg-green-500/10 p-4 rounded-xl border border-green-500/30">
        <p className="text-xs text-green-400 font-bold mb-1">💡 Smart Tip</p>
        <p className="text-xs text-gray-300">Your most expensive category is <span className="text-white font-bold">{expenseData.sort((a,b) => b.value - a.value)[0]?.name || 'N/A'}</span>. Try optimizing routes to save more fuel in Accra traffic.</p>
      </div>
    </div>
  );
};

export default Reports;
