import { read, utils } from 'xlsx';
import { useReducer, useState } from 'react';
import axios from 'axios';

function reducer(state, action) {
  switch (action.type) {
    case "add": {
      return {
        ...state,
        [action.data.id]: {
          status: action.data.status,
          message: action.data.message
        }
      }
    }
  }
}

function App() {

  const [data, setData] = useState([]);
  const [sentData, sentDataDispatch] = useReducer(reducer, {});
  const [isSending, setIsSending] = useState(false);
  const [showStatusColumn, setShowStatusColumn] = useState(false);

  async function handleFileChange(e) {
    setIsSending(false);
    setShowStatusColumn(false);
    const file = e.target.files[0];
    const data = await file.arrayBuffer();
    const workbook = read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    var aoa = utils.sheet_to_json(worksheet);

    setData(aoa);
  }

  async function handleSendData() {
    setIsSending(true);
    setShowStatusColumn(true);
    for (let i = 0; i < data.length; i++) {
      const response = await axios({
        method: 'POST',
        url: 'http://localhost:3000/cast_result',
        data: data[i]
      });

      if (response.data.success) {
        sentDataDispatch({
          type: "add",
          data: {
            id: i,
            status: 'success',
            message: ''
          }
        });
      } else {
        sentDataDispatch({
          type: "add",
          data: {
            id: i,
            status: 'failed',
            message: ''
          }
        });
      }
    }
    setIsSending(false);
  }

  return (
    <div className='container my-5'>

      <svg xmlns="http://www.w3.org/2000/svg" style={{display: 'none'}}>
        <symbol id="check-circle-fill" viewBox="0 0 16 16">
          <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
        </symbol>
        <symbol id="info-fill" viewBox="0 0 16 16">
          <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
        </symbol>
        <symbol id="exclamation-triangle-fill" viewBox="0 0 16 16">
          <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
        </symbol>
      </svg>

      <h1 className='display-5 mb-2'>CAST mailer</h1>

      <div className="row mb-3">
        <div className="col-8">
          <input className="form-control" type="file" id="formFile" onChange={handleFileChange} />
        </div>
        <div className="col-4">
          {!isSending ? 
            <button className="btn btn-primary" onClick={handleSendData}>Create coupon and send data</button> : 
            <button className="btn btn-primary" type="button" disabled>
              <span className="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
              <span className="ms-2">{`${Object.keys(sentData).length} / ${data.length}`}</span>
            </button>
          }
        </div>
      </div>
      
      

      {data.length > 0 ? <table className="table table-striped table-bordered">
        <thead>
          <tr>
            {Object.keys(data[0]).map(key => (
              <th key={key}>{key}</th>  
            ))}
            {showStatusColumn ? <th>Status</th> : null}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              {Object.values(row).map((val, idx) => (
                <td key={idx}>{val}</td>
              ))}
              {showStatusColumn ? <td>
                {sentData[index] === undefined ? (
                  <div className="spinner-grow text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  ) : <>
                    {
                      sentData[index]['status'] === 'success' ? (
                        <div className="alert alert-success d-flex align-items-center" role="alert">
                        <svg className="bi flex-shrink-0 me-2" role="img" style={{ width: '18px', height: '18px' }}>
                          <use xlinkHref="#check-circle-fill"/>
                        </svg>
                        <div>
                          Success
                        </div>
                      </div>
                      ) : (
                        <div className="alert alert-danger d-flex align-items-center" role="alert">
                          <svg className="bi flex-shrink-0 me-2" role="img" style={{ width: '18px', height: '18px' }}>
                            <use xlinkHref="#exclamation-triangle-fill"/>
                          </svg>
                          <div>
                            Error
                          </div>
                        </div>
                      )
                    }
                  </>}
              </td>: null}
            </tr>
          ))}
        </tbody>
      </table> : null}
      
    </div>
  )
}

export default App
