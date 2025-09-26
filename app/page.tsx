"use client";
import React from "react";

export default function Home() {
  const [status, setStatus] = React.useState("Idle");
  const [nodes, setNodes] = React.useState<any[]>([]);

  async function handlePush() {
    setStatus("Sending...");

    try {
      const res = await fetch("/api/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foo: "bar", number: Math.random() }),
      });

      if (!res.ok) throw new Error("Request failed");
      const json = await res.json();
      setStatus(`Saved with ID: ${json.id}`);
    } catch (err: any) {
      setStatus(`Error: ${err.code} : ${err.message}`);
    }
  }
  async function handleGet() {
    setStatus("Fetching...");
    try {
      const res = await fetch("/api/push"); // this hits your GET route
      if (!res.ok) throw new Error("Request failed");

      const json = await res.json();
      setNodes(json.nodes || []);
      setStatus(`Fetched ${json.nodes?.length || 0} items`);
    } catch (err: any) {
      setStatus(`Error: ${err.code} : ${err.message}`);
    }
  }
  async function handleDownload() {
    setStatus("Downloading...");
    try {
      window.open("/api/download", "_blank" );
      setStatus(`Download started`);
    }
    catch (err: any) {
      setStatus(`Error: ${err.code} : ${err.message}`);
    }
  }
  async function handlePurge() {
    setStatus("Purging...");
    try {
      const res = await fetch("/api/purge", { method: "DELETE" });
      const data = await res.json();
    }    
    catch (err: any) {
      setStatus(`Error: ${err.code} : ${err.message}`);
    }
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Welcome to the Farm-ng robot controller App
      </h1>
      <p>This is the home page</p>
      <p>Navigate to the "Map" page to set and monitor robot movement</p>
      <p>Navigate to the "Controller" page to control the robot</p>

      <div className="mt-8">
        <p className="mt-4">{status}</p> <br />

        <h2 className="text-xl font-semibold mb-2">Firebase Test</h2>
        <button onClick={handlePush} className="px-4 py-2 rounded bg-blue-600 text-white">
          Push to Firestore
        </button>
        

        <button onClick={handleGet} className="ml-4 px-4 py-2 rounded bg-green-600 text-white">
          Get from Firestore
        </button>

        <ul className="mt-4 space-y-2">
        {nodes.map((node) => (
          <li key={node.id} className="border p-2 rounded bg-gray-100">
            <pre className="text-sm">{JSON.stringify(node, null, 2)}</pre>
          </li>
        ))}
      </ul>

      <button onClick={handleDownload} className="mt-4 px-4 py-2 rounded bg-purple-600 text-white">
          Download JSON
      </button>

      <button onClick={handlePurge} className="ml-4 px-4 py-2 rounded bg-red-600 text-white">
          Purge Database
      </button>
      
      </div>
    </main>
  );
}
