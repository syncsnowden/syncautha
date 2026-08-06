async function test() {
  const res = await fetch("http://localhost:3000/api/projects/TSGLSXhN/scripts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Test",
      silent_mode: false,
      script_code: "",
      webhook_protection: false,
      use_syncauth_gui: true
    })
  });
  console.log(res.status);
  console.log(await res.text());
}
test();
