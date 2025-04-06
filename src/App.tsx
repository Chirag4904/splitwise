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
  const [totalExpense, setTotalExpense] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  // Load data from localStorage on initial render
  useEffect(() => {
    const savedPeople = localStorage.getItem('splitter_people');
    const savedExpenses = localStorage.getItem('splitter_expenses');
    
    if (savedPeople) {
      const parsedPeople = JSON.parse(savedPeople);
      setPeople(parsedPeople);
    }
    
    if (savedExpenses) {
      const parsedExpenses = JSON.parse(savedExpenses);
      setExpenses(parsedExpenses);
    }
  }, []);

  // Save data to localStorage whenever people or expenses change
  useEffect(() => {
    localStorage.setItem('splitter_people', JSON.stringify(people));
  }, [people]);

  useEffect(() => {
    localStorage.setItem('splitter_expenses', JSON.stringify(expenses));
  }, [expenses]);

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
    calculateTotal();
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

  const calculateTotal = () => {
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    setTotalExpense(total);
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

  const resetEverything = () => {
    if (window.confirm('Are you sure you want to reset everything? This will clear all people, expenses, and balances.')) {
      setPeople([]);
      setExpenses([]);
      setBalances({});
      setTotalExpense(0);
      setPaidBy('');
      localStorage.removeItem('splitter_people');
      localStorage.removeItem('splitter_expenses');
    }
  };

  const generateSummaryText = () => {
    let summary = `EXPENSE SUMMARY\n\n`;
    summary += `Total Amount: ₹${totalExpense.toFixed(2)}\n\n`;
    
    summary += `EXPENSES:\n`;
    expenses.forEach((expense, index) => {
      summary += `${index + 1}. ${expense.description} - ₹${expense.amount.toFixed(2)} (Paid by ${expense.paidBy})\n`;
      summary += `   Split between: ${expense.participants.join(', ')}\n`;
      summary += `   Amount per person: ₹${expense.splitAmount.toFixed(2)}\n\n`;
    });
    
    summary += `SETTLEMENTS:\n`;
    const settlements = generateSettlements();
    if (settlements.length === 0) {
      summary += `Everyone is settled up!\n`;
    } else {
      settlements.forEach((settlement, index) => {
        summary += `${index + 1}. ${settlement.from} pays ${settlement.to} ₹${settlement.amount.toFixed(2)}\n`;
      });
    }
    
    return summary;
  };

  const generateSettlements = () => {
    // Create arrays of debtors and creditors
    const debtors = [];
    const creditors = [];
    
    Object.entries(balances).forEach(([person, balance]) => {
      if (balance < 0) {
        debtors.push({ name: person, amount: Math.abs(balance) });
      } else if (balance > 0) {
        creditors.push({ name: person, amount: balance });
      }
    });
    
    // Sort by amount (descending)
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);
    
    const settlements = [];
    
    // Generate settlements
    while (debtors.length > 0 && creditors.length > 0) {
      const debtor = debtors[0];
      const creditor = creditors[0];
      
      const amount = Math.min(debtor.amount, creditor.amount);
      
      if (amount > 0) {
        settlements.push({
          from: debtor.name,
          to: creditor.name,
          amount
        });
      }
      
      // Update amounts
      debtor.amount -= amount;
      creditor.amount -= amount;
      
      // Remove people who are settled
      if (debtor.amount < 0.01) debtors.shift();
      if (creditor.amount < 0.01) creditors.shift();
    }
    
    return settlements;
  };

  const copyToClipboard = () => {
    const summaryText = generateSummaryText();
    navigator.clipboard.writeText(summaryText).then(
      () => {
        alert('Summary copied to clipboard!');
      },
      (err) => {
        alert('Failed to copy text: ' + err);
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8 text-white">
          <h1 className="text-4xl font-bold text-center mb-2">Split<span className="text-yellow-300">Wise</span></h1>
          <p className="text-indigo-100 text-center">Split expenses with friends and family</p>
        </div>
        
        <div className="p-6">
          {/* Reset Button */}
          <div className="flex justify-end mb-4">
            <button
              onClick={resetEverything}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Reset Everything
            </button>
          </div>
          
          {/* Add Person Section */}
          <div className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
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
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity shadow-sm"
              >
                Add
              </button>
            </div>
          </div>
          
          {people.length > 0 && (
            <>
              {/* Add Expense Section */}
              <div className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
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
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                >
                  Add Expense
                </button>
              </div>
              
              {/* Expenses List */}
              <div className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Expenses</h2>
                  <div className="text-lg font-bold text-indigo-700">
                    Total: ₹{totalExpense.toFixed(2)}
                  </div>
                </div>
                
                {expenses.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No expenses added yet</p>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-indigo-50">
                          <th className="p-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Description</th>
                          <th className="p-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Amount</th>
                          <th className="p-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Paid By</th>
                          <th className="p-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Split Between</th>
                          <th className="p-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {expenses.map(expense => (
                          <tr key={expense.id} className="hover:bg-gray-50">
                            <td className="p-3">{expense.description}</td>
                            <td className="p-3 font-medium">₹{expense.amount.toFixed(2)}</td>
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
              <div className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Final Balances</h2>
                {Object.keys(balances).length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Add expenses to see balances</p>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-indigo-50">
                          <th className="p-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Person</th>
                          <th className="p-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Balance</th>
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
              
              {/* Settlement Summary Section */}
              {expenses.length > 0 && (
                <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Settlement Summary</h2>
                    <button
                      onClick={copyToClipboard}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      Copy Summary
                    </button>
                  </div>
                  
                  <button
                    onClick={() => setShowSummary(!showSummary)}
                    className="w-full p-3 mb-4 flex justify-between items-center bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                  >
                    <span className="font-medium text-indigo-800">
                      {showSummary ? 'Hide Settlement Details' : 'Show Settlement Details'}
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-5 w-5 text-indigo-600 transition-transform ${showSummary ? 'transform rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {showSummary && (
                    <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap">
                      {generateSummaryText()}
                    </div>
                  )}
                  
                  <div className="mt-6">
                    <h3 className="font-medium text-gray-800 mb-3">Who Pays Whom</h3>
                    
                    {generateSettlements().length === 0 ? (
                      <p className="text-green-600 p-3 bg-green-50 rounded-lg">Everyone is settled up!</p>
                    ) : (
                      <div className="space-y-2">
                        {generateSettlements().map((settlement, index) => (
                          <div key={index} className="p-3 bg-blue-50 rounded-lg flex justify-between items-center">
                            <div className="flex items-center">
                              <span className="font-medium text-blue-800">{settlement.from}</span>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                              </svg>
                              <span className="font-medium text-blue-800">{settlement.to}</span>
                            </div>
                            <span className="font-bold text-blue-700">₹{settlement.amount.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      <footer className="text-center mt-8 text-gray-500 text-sm">
        <p>Powered by SplitWise - Share expenses with friends and family</p>
      </footer>
    </div>
  );
};

export default ExpenseSplitter;