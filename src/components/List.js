import React, { useState, useEffect } from "react";
import { fetchListData } from "../api";
import Error from "./Error";
import Loader from "./Loader";
import "./List.css";

const List = () => {
  const [data, setData] = useState({ lists: [] });
  const [loading, setLoading] = useState(true);
  const [checkedLists, setCheckedLists] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [creatingList, setCreatingList] = useState(false);
  const [newList, setNewList] = useState([]);
  const [originalData, setOriginalData] = useState(null);
  const [apiError, setApiError] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setApiError(false);
      const response = await fetchListData();
      if (response && Array.isArray(response.lists)) {
        setData(response);
        setOriginalData(response);
      } else {
        throw new Error("Invalid data format received");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setApiError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCheckboxChange = (listNum) => {
    setCheckedLists((prev) => {
      const updatedChecks = { ...prev, [listNum]: !prev[listNum] };
      const selectedLists = Object.values(updatedChecks).filter(Boolean).length;
      if (selectedLists > 2) return prev;
      return updatedChecks;
    });
  };

  const handleCreateList = () => {
    const selectedListNumbers = Object.keys(checkedLists).filter(
      (key) => checkedLists[key]
    );
    if (selectedListNumbers.length !== 2) {
      setErrorMessage("You should select exactly 2 lists to create a new list");
      return;
    }
    setErrorMessage("");
    setCreatingList(true);
    setNewList([]);
    setOriginalData({ ...data });
  };

  const moveItem = (item, fromList, toList) => {
    if (toList === "new") {
      setNewList(prev => [...prev, item]);
      setData(prev => ({
        ...prev,
        lists: prev.lists.filter(i => i.id !== item.id)
      }));
    } else if (fromList === "new") {
      setNewList(prev => prev.filter(i => i.id !== item.id));
      setData(prev => ({
        ...prev,
        lists: [...prev.lists, { ...item, list_number: Number(toList) }]
      }));
    }
  };

  const handleCancel = () => {
    setCreatingList(false);
    setNewList([]);
    if (originalData) {
      setData(originalData);
    }
    setCheckedLists({});
  };

  const handleUpdate = () => {
    setCreatingList(false);
    const updatedData = {
      lists: [
        ...data.lists,
        ...newList.map(item => ({
          ...item,
          list_number: Math.max(...data.lists.map(i => i.list_number)) + 1
        }))
      ]
    };
    setData(updatedData);
    setOriginalData(updatedData);
    setNewList([]);
    setCheckedLists({});
  };

  const renderFailureView = () => (
    <div className="failure-view">
      <h2>Oops! Something went wrong</h2>
      <p>We cannot seem to find the page you are looking for.</p>
      <button onClick={fetchData} className="try-again-button">
        Try Again
      </button>
    </div>
  );

  const renderListCreationView = () => {
    const selectedLists = Object.keys(checkedLists)
      .filter(key => checkedLists[key])
      .sort();
    
    return (
      <div className="list-container">
        {/* First Selected List */}
        <div className="list-box">
          <h3>List {selectedLists[0]}</h3>
          {data.lists
            .filter(item => item.list_number === Number(selectedLists[0]))
            .map(item => (
              <div key={item.id} className="list-item">
                <h4>{item.name}</h4>
                <p>{item.description}</p>
                <button onClick={() => moveItem(item, selectedLists[0], "new")}>
                  ➡️
                </button>
              </div>
            ))}
        </div>

        {/* New List in the Middle */}
        <div className="list-box new-list">
          <h3>New List</h3>
          {newList.map(item => (
            <div key={item.id} className="list-item">
              <h4>{item.name}</h4>
              <p>{item.description}</p>
              <button onClick={() => moveItem(item, "new", selectedLists[0])}>
                ⬅️
              </button>
              <button onClick={() => moveItem(item, "new", selectedLists[1])}>
                ➡️
              </button>
            </div>
          ))}
        </div>

        {/* Second Selected List */}
        <div className="list-box">
          <h3>List {selectedLists[1]}</h3>
          {data.lists
            .filter(item => item.list_number === Number(selectedLists[1]))
            .map(item => (
              <div key={item.id} className="list-item">
                <h4>{item.name}</h4>
                <p>{item.description}</p>
                <button onClick={() => moveItem(item, selectedLists[1], "new")}>
                  ⬅️
                </button>
              </div>
            ))}
        </div>

        <div className="button-container">
          <button onClick={handleCancel}>Cancel</button>
          <button onClick={handleUpdate}>Update</button>
        </div>
      </div>
    );
  };

  const renderAllListsView = () => (
    <div className="list-container">
      {[...new Set(data.lists.map(item => item.list_number))].sort().map(
        listNum => (
          <div key={listNum} className="list-box">
            <div className="list-header">
              <input
                type="checkbox"
                checked={checkedLists[listNum] || false}
                onChange={() => handleCheckboxChange(listNum)}
              />
              <h3>List {listNum}</h3>
            </div>
            {data.lists
              .filter(item => item.list_number === listNum)
              .map(item => (
                <div key={item.id} className="list-item">
                  <h4>{item.name}</h4>
                  <p>{item.description}</p>
                </div>
              ))}
          </div>
        )
      )}
    </div>
  );

  return (
    <div>
      <div className="header-container">
        <h1 className="title">List Creation</h1>
        {!creatingList && !apiError && (
          <button className="create-button" onClick={handleCreateList}>
            Create a New List
          </button>
        )}
      </div>

      {errorMessage && <Error message={errorMessage} />}
      {loading ? (
        <Loader />
      ) : apiError ? (
        renderFailureView()
      ) : creatingList ? (
        renderListCreationView()
      ) : (
        renderAllListsView()
      )}
    </div>
  );
};

export default List;