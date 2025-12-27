(async ()=>{
  const urls = [
    'https://www.tilana.online/beginners-guide-to-index-funds.html',
    'https://www.tilana.online/common-money-mistakes-that-destroy-your-savings.html',
    'https://www.tilana.online/difference-savings-vs-investing.html'
  ];
  const maxAttempts = 8;
  const delayMs = 15000; // 15s

  for(let attempt=1; attempt<=maxAttempts; attempt++){
    console.log('Attempt', attempt, 'of', maxAttempts);
    let anyFound = false;
    for(const u of urls){
      try{
        const res = await fetch(u);
        const text = await res.text();
        const hasJsonLd = /<script[^>]*id=["']article-schema["'][^>]*>/i.test(text) || /<script[^>]*type=["']application\/ld\+json["'][^>]*>/i.test(text);
        console.log(u, 'status', res.status, 'JSON-LD?', hasJsonLd);
        if(hasJsonLd) anyFound = true;
      }catch(e){
        console.error('Error fetching', u, e.message || e);
      }
    }
    if(anyFound){
      console.log('At least one page shows JSON-LD — stopping poll.');
      process.exit(0);
    }
    if(attempt < maxAttempts){
      console.log('Not found yet — waiting', delayMs/1000, 's before next attempt...');
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
  console.log('Polling completed — no JSON-LD found on any page.');
  process.exit(2);
})();