"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Script {
  id: string; project_id: string; name: string;
  silent_mode: boolean; script_code: string; created_at: number;
}

interface Project { id: string; name: string; }

const keyLoaderTemplate = (scriptId: string, name: string) => `-- SyncAuth Key Loader for "${name}"
-- Script ID: ${scriptId}

local SITE = "SYNCAUTH_SITE_URL"
local SCRIPT_ID = "${scriptId}"

local HttpService = game:GetService("HttpService")
local player = game:GetService("Players").LocalPlayer

local function getHWID()
    pcall(function()
        local c = game:GetService("RbxAnalyticsService"):GetClientId()
        if c and #c > 0 then return c end
    end)
    return HttpService:GenerateGUID(false)
end

local function request(url, body)
    local ok, res = pcall(function()
        return HttpService:JSONDecode(syn.request({
            Url = url, Method = "POST",
            Headers = { ["Content-Type"] = "application/json" },
            Body = HttpService:JSONEncode(body)
        }).Body)
    end)
    if ok and res then return res end
end

local hwid = getHWID()
local authed = false

local gui = Instance.new("ScreenGui", game.CoreGui)
gui.Name = "SyncAuth"

local bg = Instance.new("Frame", gui)
bg.Size = UDim2.new(0, 340, 0, 210)
bg.Position = UDim2.new(0.5, -170, 0.5, -105)
bg.BackgroundColor3 = Color3.fromRGB(10, 11, 16)
bg.BorderSizePixel = 0
Instance.new("UICorner", bg).CornerRadius = UDim.new(0, 10)
Instance.new("UIStroke", bg).Color = Color3.fromRGB(0, 200, 224)

local title = Instance.new("TextLabel", bg)
title.Size = UDim2.new(1, -28, 0, 22)
title.Position = UDim2.new(0, 14, 0, 14)
title.Text = "SyncAuth | License Key"
title.TextColor3 = Color3.fromRGB(255,255,255)
title.BackgroundTransparency = 1
title.Font = Enum.Font.GothamBold
title.TextSize = 14
title.TextXAlignment = Enum.TextXAlignment.Left

local keyLabel = Instance.new("TextLabel", bg)
keyLabel.Size = UDim2.new(1, -28, 0, 14)
keyLabel.Position = UDim2.new(0, 14, 0, 50)
keyLabel.Text = "License Key:"
keyLabel.TextColor3 = Color3.fromRGB(150,150,160)
keyLabel.BackgroundTransparency = 1
keyLabel.Font = Enum.Font.Gotham
keyLabel.TextSize = 12
keyLabel.TextXAlignment = Enum.TextXAlignment.Left

local keyInput = Instance.new("TextBox", bg)
keyInput.Size = UDim2.new(1, -28, 0, 34)
keyInput.Position = UDim2.new(0, 14, 0, 66)
keyInput.PlaceholderText = "XXXX-XXXX-XXXX-XXXX"
keyInput.BackgroundColor3 = Color3.fromRGB(18,20,30)
keyInput.TextColor3 = Color3.fromRGB(255,255,255)
keyInput.BorderSizePixel = 0
keyInput.Font = Enum.Font.Gotham
keyInput.TextSize = 14
Instance.new("UICorner", keyInput).CornerRadius = UDim.new(0, 6)

local status = Instance.new("TextLabel", bg)
status.Size = UDim2.new(1, -28, 0, 18)
status.Position = UDim2.new(0, 14, 0, 108)
status.Text = ""
status.TextColor3 = Color3.fromRGB(150,150,160)
status.BackgroundTransparency = 1
status.Font = Enum.Font.Gotham
status.TextSize = 12

local btn = Instance.new("TextButton", bg)
btn.Size = UDim2.new(1, -28, 0, 36)
btn.Position = UDim2.new(0, 14, 0, 134)
btn.Text = "UNLOCK"
btn.BackgroundColor3 = Color3.fromRGB(0, 200, 224)
btn.TextColor3 = Color3.fromRGB(10,11,16)
btn.BorderSizePixel = 0
btn.Font = Enum.Font.GothamBold
btn.TextSize = 14
Instance.new("UICorner", btn).CornerRadius = UDim.new(0, 6)

local hint = Instance.new("TextLabel", bg)
hint.Size = UDim2.new(1, -28, 0, 14)
hint.Position = UDim2.new(0, 14, 0, 180)
hint.Text = "Get keys: " .. SITE .. "/get-key/" .. SCRIPT_ID
hint.TextColor3 = Color3.fromRGB(100,100,110)
hint.BackgroundTransparency = 1
hint.Font = Enum.Font.Gotham
hint.TextSize = 10

btn.MouseButton1Click:Connect(function()
    if authed then return end
    local k = keyInput.Text:gsub("%s+", "")
    if #k < 8 then status.Text = "Enter a valid key"; return end
    status.Text = "Validating..."
    status.TextColor3 = Color3.fromRGB(150,150,160)
    btn.Text = "..."
    local result = request(SITE .. "/api/keys/validate", { key = k, hwid = hwid })
    if result and result.status == "valid" then
        status.Text = "Authorized!"
        status.TextColor3 = Color3.fromRGB(0, 200, 224)
        authed = true
        task.wait(1)
        gui:Destroy()
        loadstring(game:HttpGet(SITE .. "/api/scripts/" .. SCRIPT_ID .. "/raw"))()
    elseif result then
        status.Text = result.reason or "Invalid key"
        status.TextColor3 = Color3.fromRGB(255, 80, 80)
        btn.Text = "UNLOCK"
    else
        status.Text = "Connection failed"
        status.TextColor3 = Color3.fromRGB(255, 80, 80)
        btn.Text = "UNLOCK"
    end
end)

while not authed do task.wait(0.5) end`;

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pid = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editSid, setEditSid] = useState("");
  const [form, setForm] = useState({ name: "", silent_mode: false, script_code: "" });
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"scripts" | "keys">("scripts");

  useEffect(() => {
    fetch(`/api/projects/${pid}`).then(r => r.json()).then(setProject);
    loadScripts();
  }, [pid]);

  async function loadScripts() {
    const res = await fetch(`/api/projects/${pid}/scripts`);
    setScripts(await res.json());
  }

  function resetForm() { setForm({ name: "", silent_mode: false, script_code: "" }); setEditSid(""); setShowForm(false); }
  function editScript(s: Script) { setEditSid(s.id); setForm({ name: s.name, silent_mode: s.silent_mode, script_code: s.script_code }); setShowForm(true); }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.script_code.trim()) return toast.error("Name and code required.");
    setSaving(true);
    try {
      const url = editSid ? `/api/scripts/${editSid}` : `/api/projects/${pid}/scripts`;
      const method = editSid ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error();
      toast.success(editSid ? "Script updated!" : "Script created!");
      resetForm(); loadScripts();
    } catch { toast.error("Failed to save."); }
    finally { setSaving(false); }
  }

  async function deleteScript(id: string) {
    if (!confirm("Delete this script?")) return;
    await fetch(`/api/scripts/${id}`, { method: "DELETE" });
    toast.success("Deleted."); loadScripts();
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".lua") && !file.name.endsWith(".txt")) { toast.error("Only .lua or .txt files"); return; }
    const reader = new FileReader();
    reader.onload = () => {
      setForm({ ...form, script_code: reader.result as string, name: form.name || file.name.replace(/\.(lua|txt)$/, "") });
      toast.success("File loaded!");
    };
    reader.readAsText(file);
  }

  const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://syncauth-eight.vercel.app";

  return (
    <>
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <button className="btn btn-ghost" onClick={() => router.push("/projects")} style={{ fontSize: 14 }}>
            <i className="fa-solid fa-arrow-left" style={{ marginRight: 4 }} /> Back
          </button>
        </div>
        <h1 className="page-title">{project?.name || "Loading..."}</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: "var(--text-3)" }}>Key System URL:</span>
          <code style={{ background: "var(--bg-2)", padding: "4px 10px", borderRadius: 6, fontSize: 12, color: "var(--accent)", fontFamily: "monospace" }}>
            {siteUrl}/get-key/{pid}
          </code>
          <button className="btn btn-secondary btn-sm" style={{ width: "auto", padding: "4px 10px", fontSize: 11 }} onClick={() => {
            navigator.clipboard.writeText(`${siteUrl}/get-key/${pid}`);
            toast.success("Copied!");
          }}>
            <i className="fa-solid fa-copy" />
          </button>
        </div>
        <a href={`${siteUrl}/api/key-loader`} className="btn btn-secondary btn-sm" style={{ textDecoration: "none" }}>
          <i className="fa-solid fa-download" /> Download loader.lua
        </a>
        <p className="page-subtitle">Manage scripts and key system for this project.</p>
      </div>

      <div className="page-body">
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <button className={`btn ${tab === "scripts" ? "btn-primary" : "btn-secondary"}`} style={{ width: "auto" }} onClick={() => setTab("scripts")}>
            <i className="fa-solid fa-code" /> Scripts ({scripts.length})
          </button>
          <button className={`btn ${tab === "keys" ? "btn-primary" : "btn-secondary"}`} style={{ width: "auto" }} onClick={() => setTab("keys")}>
            <i className="fa-solid fa-key" /> Keys
          </button>
        </div>

        {tab === "scripts" && (
          <>
            <button className="btn btn-primary" style={{ marginBottom: 16, width: "auto" }} onClick={() => { resetForm(); setShowForm(true); }}>
              <i className="fa-solid fa-plus" /> Add Script
            </button>

            {showForm && (
              <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-header">
                  <span className="card-title">{editSid ? "Edit Script" : "New Script"}</span>
                  <button className="btn btn-ghost" onClick={resetForm}><i className="fa-solid fa-xmark" /></button>
                </div>
                <div className="card-body">
                  <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div className="input-group">
                      <label className="input-label">Script Name</label>
                      <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Main Script, Aimbot, ESP" />
                    </div>
                    <Toggle label="Silent Mode (remove F9 logs/prints)" checked={form.silent_mode} onChange={v => setForm({ ...form, silent_mode: v })} />
                    <div
                      onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = "var(--accent)"; }}
                      onDragLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-2)"; }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.style.borderColor = "var(--border-2)";
                        const file = e.dataTransfer.files[0];
                        if (!file) return;
                        if (!file.name.endsWith(".lua") && !file.name.endsWith(".txt")) { toast.error("Only .lua or .txt files"); return; }
                        const reader = new FileReader();
                        reader.onload = () => setForm({ ...form, script_code: reader.result as string, name: form.name || file.name.replace(/\.(lua|txt)$/, "") });
                        reader.readAsText(file);
                      }}
                      style={{
                        border: "2px dashed var(--border-2)",
                        borderRadius: 10,
                        padding: "24px 16px",
                        textAlign: "center",
                        cursor: "pointer",
                        transition: "border-color 0.2s",
                        background: "var(--bg-2)",
                      }}
                      onClick={() => document.getElementById("scriptFileInput")?.click()}
                    >
                      <input id="scriptFileInput" type="file" accept=".lua,.txt" onChange={handleFileUpload} style={{ display: "none" }} />
                      <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: 28, color: "var(--text-3)", marginBottom: 8 }} />
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-2)" }}>Drop your .lua file here</div>
                      <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4 }}>or click to browse</div>
                      {form.script_code && (
                        <div style={{ marginTop: 8, fontSize: 12, color: "var(--accent)", fontWeight: 600 }}>
                          {form.script_code.length.toLocaleString()} characters loaded
                        </div>
                      )}
                    </div>
                    <div className="input-group">
                      <label className="input-label">Script Code</label>
                      <textarea className="input" value={form.script_code} onChange={e => setForm({ ...form, script_code: e.target.value })} rows={10} style={{ resize: "vertical", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }} placeholder="Paste your Lua code here..." />
                    </div>
                    <button className="btn btn-primary" disabled={saving} style={{ width: "auto" }}>
                      {saving ? "Saving..." : editSid ? "Update Script" : "Create Script"}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {scripts.map((s) => (
              <div key={s.id} className="card" style={{ marginBottom: 12 }}>
                <div className="card-body">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--text-1)", fontSize: 14 }}>{s.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>
                        ID: {s.id} | {s.silent_mode ? "Silent" : "Normal"} | {new Date(s.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => {
                        navigator.clipboard.writeText(`${siteUrl}/api/scripts/${s.id}/raw`);
                        toast.success("Raw URL copied!");
                      }}>
                        <i className="fa-solid fa-link" /> Raw URL
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => editScript(s)}>
                        <i className="fa-solid fa-pen" />
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteScript(s.id)}>
                        <i className="fa-solid fa-trash" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {scripts.length === 0 && !showForm && (
              <div className="empty-state">
                <i className="fa-solid fa-code empty-icon" />
                <div className="empty-title">No scripts yet</div>
                <div className="empty-desc">Add a script to start. Upload your main script and use the key loader for your users.</div>
              </div>
            )}
          </>
        )}

        {tab === "keys" && <KeysTab projectId={pid} />}
      </div>
    </>
  );
}

function KeysTab({ projectId }: { projectId: string }) {
  const [key, setKey] = useState("");
  const [genning, setGenning] = useState(false);

  async function generateKey() {
    setGenning(true);
    try {
      const res = await fetch("/api/keys", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ project_id: projectId }) });
      const data = await res.json();
      if (data.key) { setKey(data.key); toast.success("Key generated!"); }
      else { toast.error(data.error || "Failed"); }
    } catch { toast.error("Failed."); }
    finally { setGenning(false); }
  }

  return (
    <div>
      <div className="card">
        <div className="card-header"><span className="card-title">Generate Key</span></div>
        <div className="card-body">
          <button className="btn btn-primary" onClick={generateKey} disabled={genning} style={{ width: "auto" }}>
            <i className="fa-solid fa-key" /> {genning ? "Generating..." : "Generate Key"}
          </button>
          {key && (
            <div style={{ marginTop: 12, padding: 12, background: "var(--bg-2)", borderRadius: "var(--radius)", border: "1px solid var(--border-2)" }}>
              <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 4 }}>Generated Key:</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: "var(--accent)", letterSpacing: 1 }}>{key}</div>
              <button className="btn btn-secondary btn-sm" style={{ marginTop: 8 }} onClick={() => { navigator.clipboard.writeText(key); toast.success("Copied!"); }}>
                <i className="fa-solid fa-copy" /> Copy
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div onClick={() => onChange(!checked)} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", userSelect: "none" }}>
      <div style={{ width: 36, height: 20, borderRadius: 10, background: checked ? "var(--accent)" : "var(--border-2)", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
        <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: checked ? 18 : 2, transition: "left 0.2s" }} />
      </div>
      <span style={{ fontSize: 13, color: "var(--text-2)" }}>{label}</span>
    </div>
  );
}
