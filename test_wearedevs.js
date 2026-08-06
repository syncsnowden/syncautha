fetch('https://wearedevs.net/obfuscator').then(r=>r.text()).then(t => { 
  let lines = t.split('\n'); 
  for (let i = 0; i < lines.length; i++) { 
    if (lines[i].includes('api/obfuscate')) {
      for(let j=i-5; j<i+20; j++) console.log(lines[j]);
    }
  } 
});
