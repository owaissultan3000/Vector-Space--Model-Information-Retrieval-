import React, { useState } from "react";
import Resultbox from "./Resultbox";
import Loading from "./Loading"
import "./TextBox.css";
import axios from "axios";

const api = `http://localhost:3001/`;

async function getRequest(Query, Alpha) {
  try {
    const response = await axios.get(`${api + "getResult"}`, {
      params: {
        query: Query,
        a_value: Alpha,
      },
    });
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

function TextBox() {
  const [cutoff, setCutoff] = useState("");
  const [query, setQuery] = useState("");
  const [queryResult, setQueryResult] = useState([])
  const [flag, setFlag] = useState(false);
  const [load,setLoad] = useState(false)

  const changecutoff = (e) => {
    setFlag(false)
    setCutoff(e.target.value);
  };

  const grabquery = (e) => {
    setFlag(false)
    if (e.target.value == null || e.target.value === "")
    {
      setFlag(false)
    }
    setQuery(e.target.value);
    
  };

  async function print(e) {
    e.preventDefault();
    setFlag(false)
    setLoad(true)
    console.log(cutoff)
    var queryResults = await getRequest(query, cutoff);
    if (queryResults !== "" || queryResults != null)
    {
      setLoad(false);
      setFlag(true);
      
    }
    queryResults = JSON.stringify(queryResults);
    console.log(queryResults)
    setQueryResult(queryResults)
  }


  return (
    <div className="AddTransaction">
      <form onSubmit={print}>
        <input
          onChange={grabquery}
          value={query}
          type="text"
          spellcheck = "true"
          placeholder="Enter Query Here"
        />

        <br/>
        <br />
      <div style={{paddingLeft:"29%",fontSize:"20px",borderRadius:"10px"}}>
        <input
          onChange={changecutoff}
          value={cutoff}
            type="text"
            placeholder="ALPHA (By Default) : 0.05"
          />
          </div>
        <br/>
        <br/>

        <button onClick={print}>Search Query</button>
      </form>
      {load ? <Loading /> : <div></div>}
      {flag ? <Resultbox ans={queryResult} />: <div></div>}
    </div>
  );
}

export default TextBox;
