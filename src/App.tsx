import React, { useState, useEffect } from 'react';

const ExpenseSplitter = () => {
  const [people, setPeople] = useState([]);
  const [newPerson, setNewPerson] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedPeople, setSelectedPeople] = useState({});
  const [paidBy, setPaidBy] = useState('');
  const [description, setDescription] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState({});

  // Initialize selected people state when people list changes
  useEffect(() => {
    const initialSelectedState = {};
    people.forEach(person => {
      initialSelectedState[person] = false;
    });
    setSelectedPeople(initialSelectedState);
    
    // Update paidBy when first person is added
    if (people.length > 0 && !paidBy) {
      setPaidBy(people[0]);
    }
  }, [people]);

  // Calculate balances whenever expenses change
  useEffect(() => {
    calculateBalances();
  }, [expenses]);

  const handleCheckboxChange = (person) => {
    setSelectedPeople({
      ...selectedPeople,
      [person]: !selectedPeople[person]
    });
  };

  const handleAddPerson = () => {
    if (newPerson.trim() !== '' && !people.includes(newPerson.trim())) {
      const updatedPeople = [...people, newPerson.trim()];
      setPeople(updatedPeople);
      setSelectedPeople({
        ...selectedPeople,
        [newPerson.trim()]: false
      });
      setNewPerson('');
    }
  };

  const handleRemovePerson = (personToRemove) => {
    // Check if person is involved in any expense
    const isInvolved = expenses.some(expense => 
      expense.paidBy === personToRemove || 
      expense.participants.includes(personToRemove)
    );

    if (isInvolved) {
      alert(`Cannot remove ${personToRemove}. They are involved in at least one expense.`);
      return;
    }

    // Update people list
    const updatedPeople = people.filter(person => person !== personToRemove);
    setPeople(updatedPeople);
    
    // Update selected people
    const { [personToRemove]: removed, ...updatedSelectedPeople } = selectedPeople;
    setSelectedPeople(updatedSelectedPeople);
    
    // Update paidBy if needed
    if (paidBy === personToRemove && updatedPeople.length > 0) {
      setPaidBy(updatedPeople[0]);
    }
  };

  const handleAddExpense = () => {
    if (amount && parseFloat(amount) > 0) {
      const participants = Object.keys(selectedPeople).filter(person => selectedPeople[person]);
      
      if (participants.length === 0) {
        alert('Please select at least one person to split with');
        return;
      }

      const splitAmount = parseFloat(amount) / participants.length;
      
      const newExpense = {
        id: Date.now(),
        amount: parseFloat(amount),
        paidBy,
        participants,
        splitAmount,
        description: description || `Expense of ₹${amount}`
      };

      setExpenses([...expenses, newExpense]);
      
      // Reset form
      setAmount('');
      setDescription('');
      
      // Reset checkboxes
      const resetSelected = {};
      people.forEach(person => {
        resetSelected[person] = false;
      });
      setSelectedPeople(resetSelected);
    }
  };

  const calculateBalances = () => {
    const newBalances = {};
    
    // Initialize balances for each person
    people.forEach(person => {
      newBalances[person] = 0;
    });

    // Calculate balances based on expenses
    expenses.forEach(expense => {
      // Add the full amount to the person who paid
      newBalances[expense.paidBy] += expense.amount;
      
      // Subtract each participant's share
      expense.participants.forEach(participant => {
        newBalances[participant] -= expense.splitAmount;
      });
    });

    setBalances(newBalances);
  };

  const removeExpense = (id) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  const selectAll = () => {
    const allSelected = {};
    people.forEach(person => {
      allSelected[person] = true;
    });
    setSelectedPeople(allSelected);
  };

  const deselectAll = () => {
    const allDeselected = {};
    people.forEach(person => {
      allDeselected[person] = false;
    });
    setSelectedPeople(allDeselected);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Split<span className="text-indigo-600">Wise</span></h1>
      
      {/* Add Person Section */}
      <div className="mb-8 p-6 bg-white rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">People</h2>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {people.length === 0 ? (
            <p className="text-gray-500 italic">No people added yet. Add someone to get started!</p>
          ) : (
            people.map(person => (
              <div key={person} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm flex items-center">
                {person}
                <button 
                  onClick={() => handleRemovePerson(person)} 
                  className="ml-2 text-indigo-600 hover:text-indigo-900"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={newPerson}
            onChange={(e) => setNewPerson(e.target.value)}
            placeholder="Add new person"
            className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            onKeyPress={(e) => e.key === 'Enter' && handleAddPerson()}
          />
          <button
            onClick={handleAddPerson}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Add
          </button>
        </div>
      </div>
      
      {people.length > 0 && (
        <>
          {/* Add Expense Section */}
          <div className="mb-8 p-6 bg-white rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Add New Expense</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paid By
                </label>
                <select
                  value={paidBy}
                  onChange={(e) => setPaidBy(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                >
                  {people.map(person => (
                    <option key={person} value={person}>
                      {person}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this expense for?"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Split Between
                </label>
                <div className="flex gap-2">
                  <button 
                    onClick={selectAll}
                    className="px-3 py-1 text-xs text-indigo-600 hover:text-indigo-800"
                  >
                    Select All
                  </button>
                  <button 
                    onClick={deselectAll}
                    className="px-3 py-1 text-xs text-indigo-600 hover:text-indigo-800"
                  >
                    Clear All
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {people.map(person => (
                  <div key={person} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`person-${person}`}
                      checked={selectedPeople[person] || false}
                      onChange={() => handleCheckboxChange(person)}
                      className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`person-${person}`} className="text-gray-700">{person}</label>
                  </div>
                ))}
              </div>
            </div>
            
            <button
              onClick={handleAddExpense}
              className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Add Expense
            </button>
          </div>
          
          {/* Expenses List */}
          <div className="mb-8 p-6 bg-white rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Expenses</h2>
            {expenses.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No expenses added yet</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid By</th>
                      <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Split Between</th>
                      <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {expenses.map(expense => (
                      <tr key={expense.id} className="hover:bg-gray-50">
                        <td className="p-3">{expense.description}</td>
                        <td className="p-3">₹{expense.amount.toFixed(2)}</td>
                        <td className="p-3">{expense.paidBy}</td>
                        <td className="p-3">{expense.participants.join(', ')}</td>
                        <td className="p-3">
                          <button
                            onClick={() => removeExpense(expense.id)}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs hover:bg-red-200 transition-colors"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {/* Balances Section */}
          <div className="p-6 bg-white rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Final Balances</h2>
            {Object.keys(balances).length === 0 ? (
              <p className="text-gray-500 text-center py-4">Add expenses to see balances</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Person</th>
                      <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Object.entries(balances).map(([person, balance]) => (
                      <tr key={person} className="hover:bg-gray-50">
                        <td className="p-3 font-medium">{person}</td>
                        <td className={`p-3 font-medium ${balance > 0 ? 'text-green-600' : balance < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                          {balance > 0 ? 'Gets back ' : balance < 0 ? 'Owes ' : ''}
                          ₹{Math.abs(balance).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ExpenseSplitter;