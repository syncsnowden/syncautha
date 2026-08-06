fetch("https://pastefy.app/api/v2/paste", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    title: "syncauth-project",
    content: JSON.stringify({ exists: true, code: "", name: "Untitled", created_at: 1718000000000 })
  })
}).then(r => {
  console.log(r.status);
  return r.text();
}).then(console.log).catch(console.error);
