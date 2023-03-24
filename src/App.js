import { useEffect, useRef, useState } from "react";
import './App.css';
import axios from 'axios';

function App() {
  const BACKEND_BASE_URL = process.env.REACT_APP_ATM_BACKEND_BASE_URL;
  const [availableBankNotes, setAvailableBankNotes] = useState({});
  const [withdrawBankNotes, setwithdrawBankNotes] = useState([]);
  useEffect(() => {
    axios.get(BACKEND_BASE_URL + '/api/v1/maintenance/banknotes')
      .then((response) => {
        setAvailableBankNotes(response.data);
      })
      .catch((err) => { setMaintenanceMessage(err.message) });
  }, []);
  const handleChange = (e, bankNoteValue) => {
    setAvailableBankNotes({ ...availableBankNotes, [e.target.name]: { bankNoteValue: bankNoteValue, bankNoteCount: parseInt(e.target.value) } });
  }
  const amountRef = useRef();
  const [customerMessage, setCustomerMessage] = useState("");
  const [maintenanceMessage, setMaintenanceMessage] = useState("");
  const withdraw = (event) => {
    event.preventDefault();
    axios.put(BACKEND_BASE_URL + '/api/v1/customer', { amount: amountRef.current.value })
      .then((response) => {
        setCustomerMessage(response.data.message);
        setwithdrawBankNotes(response.data.transaction.bankNotes);
        setAvailableBankNotes(response.data.availableBankNotes);
      }).catch((error) => {
        setCustomerMessage(error.response.data.message);
      });
  }
  const resetATMSimulator = (event) => {
    event.preventDefault();
    const body = {
      initialBankNotes: availableBankNotes
    }
    axios.post(BACKEND_BASE_URL + '/api/v1/maintenance/banknotes/reset', body)
      .then((response) => {
        setMaintenanceMessage(response.data.message);
        setAvailableBankNotes(response.data.availableBankNotes);
      }).catch((error) => {
        setMaintenanceMessage(error.response.data.message);
      });
  }
  return (
    <>
      <div className="flex flex-col">
        <p>Customer</p>
        <div className=" flex flex-2 gap-10 border-solid border-1 border-indigo-600 min-w-full">
          <input className="bg-slate-300" type="number" ref={amountRef} name="withdrawAmount " />
          <button className="border-2 left-10 border-slate-300" onClick={(event) => withdraw(event)}>withdraw</button>
          {withdrawBankNotes.map(banknote => <p key={banknote.bankNoteValue}>${banknote.bankNoteValue}({banknote.bankNoteCount})</p>)}
        </div>
        <p className="text-red-600">{customerMessage}</p>
      </div>
      <div className="relative top-10 flex flex-col gap-2 border-solid border-1 border-indigo-600 min-w-full">
        <p>Maintenence</p>
        <p className="text-red-600">{maintenanceMessage}</p>
        <form onSubmit={resetATMSimulator}>
          <table>
            <tbody>
              {Object.keys(availableBankNotes).map((keyName, i) => (
                <tr key={i}>
                  <th className="px-2">
                    <p>{keyName}</p>
                  </th>
                  <th>
                    <input className="bg-slate-300" type="number" min='0' value={availableBankNotes[keyName].bankNoteCount}
                      onChange={(e) => handleChange(e, availableBankNotes[keyName].bankNoteValue)} name={keyName} />
                  </th>
                </tr>
              ))}

            </tbody>
          </table>
          <button className="border-2 border-slate-300 max-w-[60px]" onClick={(e) => resetATMSimulator(e)}>reset</button>
        </form>
      </div>
    </>
  );
}

export default App;
