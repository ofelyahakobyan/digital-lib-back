import React, {useEffect, useState, useRef, useCallback} from "react";

import axios from 'axios';


function Audio(props) {
  const [data, setData] = useState("");
  const [bookId, setBookId] = useState(8);
  const [url, setUrl] = useState('');

  const fetchData = useCallback(async () => {
    const res = await axios.get(`http://localhost:4000/api/v1/books/${bookId}/audio`,
      {
        headers: {
          authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjMsImlzQWRtaW4iOnRydWUsImlhdCI6MTcwMjk2NzQ5Nn0.0fVMdmBBmYLDM1dNoPqPHQg_E5iSAoV4pD9YA96aw3E`,
        },
        responseType: 'arraybuffer'
      });
    if(res.data){
      const blob = new Blob([res.data], { type: 'audio/mpeg' });
      setUrl(URL.createObjectURL(blob));
    }
  }, []);

  return (
    <div>
      <button onClick={fetchData}>Click</button>
      // THIS VERSION RETURNS STREAMED DATA AS BUFFER INTO MEMORY
      <audio style={{width: "92%"}} src={url} controls/>

      // THIS VERSION RETURNS STREAMED DATA IN CHUNKS, HOWEVER IT DOES NOT WORK VITH AUTHORIZATION
      <audio style={{width: "92%"}}  src={`http://localhost:4000/api/v1/books/${bookId}/audio`} controls/>
    </div>
  );
}

export default Audio;