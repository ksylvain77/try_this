import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import crbLists from './crb_lists.json';


const FileUpload = () => {
  const [lists, setLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [terms, setTerms] = useState([]);
  const [file, setFile] = useState(null);
  const [columns, setColumns] = useState([]);
  const [gridData, setGridData] = useState([]);
  const [sheetData, setSheetData] = useState([]);

  useEffect(() => {
    setLists(crbLists.Lists);
  }, []);

  const handleListSelection = (e) => {
    const selected = lists.find((list) => list.name === e.target.value);
    setSelectedList(selected);
    setTerms(selected.terms);
    console.log(selected.terms);
  };

  const handleFileSelection = (e) => {
    setFile(e.target.files[0]);
    let reader = new FileReader();
    reader.onload = (e) => {
      let data = e.target.result;
      let workbook = XLSX.read(data, { type: 'binary' });
      let firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      let jsonData = XLSX.utils.sheet_to_json(firstSheet);
      setSheetData(jsonData);
      console.log(jsonData);
    };
    reader.readAsBinaryString(e.target.files[0]);
    console.log(e.target.files[0]);
  };

  const handleColumnSelection = (e) => {
    // Store the selected columns for later use
    setColumns(Array.from(e.target.selectedOptions, (option) => option.value));
  };

  const handleClick =(e) => {
      let filteredData = sheetData.map((row) => {
        console.log(row);
        let selectedRow = {};
        columns.forEach((column) => {
          selectedRow[column] = row[column];
        });
        return selectedRow;
      });
      filteredData = filteredData.filter((row) => {
        let foundTerms = [];
        terms.forEach((term) => {
          for (const key in row) {
            if (row[key].toString().includes(term)) {
              foundTerms.push(term);
              break;
            }
          }
        });
        row.search_terms_found = foundTerms.join(', ');
        return foundTerms.length > 0;
      });
      setGridData(filteredData);
    }
  

  return (
    <div className="container">
      <form>
        <label htmlFor="list-select">Select a list:</label>
        <select id="list-select" defaultValue="" onChange={handleListSelection}>
          <option value="" disabled>
            --Select a list--
          </option>
          {lists.map((list) => (
            <option key={list.id} value={list.name}>
              {list.name}
            </option>
          ))}
        </select>

        {selectedList && (
          <>
            <label htmlFor="file-input">Select a file:</label>
            <input type="file" id="file-input" onChange={handleFileSelection} />

            {file && sheetData.length > 0 && (
              <>
                <label htmlFor="column-select">Select columns:</label>
                <select
                  id="column-select"
                  multiple
                  onChange={handleColumnSelection}
                >
                  {Object.keys(sheetData[0]).map((columnName) => (
                    <option key={columnName} value={columnName}>
                      {columnName}
                    </option>
                  ))}
                </select>

                {columns.length > 0 && (
                  <>
                    <button
                      onClick={() => handleClick()}
                    >
                      Search
                    </button>
                    {gridData.length > 0 && (
                      <table>
                        <thead>
                          <tr>
                            <th>Search terms found</th>
                            {columns.map((column) => (
                              <th key={column}>{column}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {gridData.map((row) => (
                            <tr key={row.searchTermsFound}>
                              <td>{row.searchTermsFound}</td>
                              {columns.map((column) => (
                                <td key={column}>{row[column]}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </>
                )}

              </>
            )}
          </>
        )}
      </form>
    </div>
  );
};
export default FileUpload;
