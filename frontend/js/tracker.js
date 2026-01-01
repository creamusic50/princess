// Page view tracking and analytics event system
class AnalyticsTracker {
  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.ipAddress = '';
    this.country = 'Unknown';
    this.countryCode = 'XX';
    this.referrer = document.referrer || 'direct';
    this.userAgent = navigator.userAgent;
    this.initSession();
  }

  // Get or create a unique session ID
  getOrCreateSessionId() {
    let sessionId = sessionStorage.getItem('analyticsSessionId');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('analyticsSessionId', sessionId);
    }
    return sessionId;
  }

  // Initialize session and get IP/geolocation
  async initSession() {
    try {
      // Get IP and geolocation from ip-api.com (free, no key required)
      const response = await fetch('https://ip-api.com/json/?fields=query,country,countryCode', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        this.ipAddress = data.query || '';
        this.country = data.country || 'Unknown';
        this.countryCode = data.countryCode || 'XX';
      }
    } catch (error) {
      console.log('Geolocation service unavailable');
    }
  }

  // Determine traffic source from referrer
  getTrafficSource() {
    if (!this.referrer || this.referrer === 'direct') {
      return 'direct';
    }
    
    const referrerUrl = new URL(this.referrer);
    const domain = referrerUrl.hostname;

    if (domain.includes('google')) return 'google';
    if (domain.includes('facebook')) return 'facebook';
    if (domain.includes('twitter')) return 'twitter';
    if (domain.includes('linkedin')) return 'linkedin';
    if (domain.includes('instagram')) return 'instagram';
    if (domain.includes('reddit')) return 'reddit';
    if (domain.includes('pinterest')) return 'pinterest';
    if (domain.includes('youtube')) return 'youtube';
    
    return 'referral';
  }

  // Record a page view
  async trackPageView(postId = null, postTitle = null) {
    // Wait a moment for geolocation to complete
    await new Promise(resolve => setTimeout(resolve, 500));

    const trafficSource = this.getTrafficSource();

    const data = {
      postId,
      postTitle,
      country: this.country,
      countryCode: this.countryCode,
      referrer: this.referrer,
      trafficSource,
      userAgent: this.userAgent,
      ipAddress: this.ipAddress,
      sessionId: this.sessionId
    };

    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/analytics/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        console.log('✅ Page view tracked:', { postId, postTitle, country: this.country });
      }
    } catch (error) {
      console.log('Analytics tracking skipped');
    }
  }
}

// Initialize tracker on page load
let tracker;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (typeof CONFIG !== 'undefined') {
      tracker = new AnalyticsTracker();
    }
  });
} else {
  if (typeof CONFIG !== 'undefined') {
    tracker = new AnalyticsTracker();
  }
}
