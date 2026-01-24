"use client"

import { useState } from "react"

export default function DebugFormPage() {
  const [status, setStatus] = useState("idle")
  const [response, setResponse] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus("sending")
    setResponse("")

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name"),
      phone: formData.get("phone"),
      source: "debug-form"
    }

    try {
      const res = await fetch("https://assetcare24.org/webhook/d509d181-13ab-4c34-b192-4b8994ec9e49", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        setStatus("success")
        const text = await res.text()
        setResponse(text || "OK")
      } else {
        setStatus("error")
        setResponse(`Error: ${res.status}`)
      }
    } catch (err: any) {
      setStatus("error")
      setResponse(`Fetch Error: ${err.message}`)
    }
  }

  return (
    <div style={{ padding: "50px", fontFamily: "sans-serif" }}>
      <h1>Debug Webhook Form</h1>
      
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "300px" }}>
        <input 
          name="name" 
          placeholder="Name" 
          required 
          style={{ padding: "10px", fontSize: "16px" }}
        />
        <input 
          name="phone" 
          placeholder="Phone" 
          required 
          style={{ padding: "10px", fontSize: "16px" }}
        />
        <button 
          type="submit" 
          disabled={status === "sending"}
          style={{ padding: "10px", fontSize: "16px", background: "black", color: "white", border: "none", cursor: "pointer" }}
        >
          {status === "sending" ? "Sending..." : "Send to Webhook"}
        </button>
      </form>

      <div style={{ marginTop: "20px" }}>
        <strong>Status:</strong> {status}
        {response && <pre style={{ background: "#f0f0f0", padding: "10px" }}>{response}</pre>}
      </div>
    </div>
  )
}








































