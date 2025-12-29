// Analytics loader: fetch GA measurement ID from server and load gtag.js for public pages only
(async function initAnalytics() {
	try {
		const resp = await fetch('/api/meta/ga');
		if (!resp.ok) return;
		const data = await resp.json();
		if (!data.success || !data.measurementId) return;
		const gaId = data.measurementId;

		// Inject gtag script
		const s = document.createElement('script');
		s.async = true;
		s.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
		document.head.appendChild(s);

		window.dataLayer = window.dataLayer || [];
		function gtag(){dataLayer.push(arguments);} 
		window.gtag = window.gtag || gtag;
		gtag('js', new Date());
		// Keep default page_view enabled for public pages
		gtag('config', gaId, { 'send_page_view': true });
	} catch (e) {
		console.warn('Analytics init failed', e);
	}
})();
