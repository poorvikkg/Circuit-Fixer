import React, { useEffect, useState } from "react";
import Graph3D from "./components/Graph3D";

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3000/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        appType: "social",
        users: 2000000,
        features: ["chat", "media", "feed"],
        realTime: true,
        readWriteRatio: "read-heavy",
        region: "global",
        availability: "high"
      })
    })
      .then((res) => res.json())
      .then((res) => {
        setData({
          graph: res.raw.architecture,
          services: res.raw.serviceExpansion.services
        });
      });
  }, []);

  return (
    <div>
      <h1>Fixy - System Design Visualizer</h1>

      {data ? (
        <Graph3D data={data} />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default App;