(async ()=>{
  const urls = [
    'https://www.tilana.online/beginners-guide-to-index-funds.html',
    'https://www.tilana.online/common-money-mistakes-that-destroy-your-savings.html',
    'https://www.tilana.online/difference-savings-vs-investing.html'
  ];
  for(const u of urls){
    try{
      const res = await fetch(u);
      const text = await res.text();
      const hasJsonLd = /<script[^>]*id=["']article-schema["'][^>]*>/i.test(text) || /<script[^>]*type=["']application\/ld\+json["'][^>]*>/i.test(text);
      const hasOgImage = /<meta[^>]*property=["']og:image["'][^>]*>/i.test(text) || /<meta[^>]*name=["']twitter:image["'][^>]*>/i.test(text);
      const canonical = /<link[^>]*rel=["']canonical["'][^>]*>/i.test(text);
      console.log(u);
      console.log('  status:', res.status);
      console.log('  has JSON-LD (article-schema or application/ld+json):', hasJsonLd);
      console.log('  has og:image or twitter:image:', hasOgImage);
      console.log('  has canonical link:', canonical);
    }catch(e){
      console.error('Error fetching', u, e.message || e);
    }
  }
})();