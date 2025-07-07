import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Google Analytics 4 (GA4) component
const GoogleAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Only run in production
    if (process.env.NODE_ENV !== 'production') return;

    // Load Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
    document.head.appendChild(script);

    // Initialize GA
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    gtag('js', new Date());
    gtag('config', 'GA_MEASUREMENT_ID', {
      page_title: document.title,
      page_location: window.location.href,
    });

    // Make gtag available globally
    (window as any).gtag = gtag;

    return () => {
      // Cleanup script
      document.head.removeChild(script);
    };
  }, []);

  // Track page views on route changes
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (!(window as any).gtag) return;

    (window as any).gtag('config', 'GA_MEASUREMENT_ID', {
      page_title: document.title,
      page_location: window.location.href,
      page_path: location.pathname,
    });
  }, [location]);

  return null;
};

// Utility functions for custom event tracking
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (process.env.NODE_ENV !== 'production') return;
  if (!(window as any).gtag) return;

  (window as any).gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

export const trackPurchase = (
  transactionId: string,
  value: number,
  currency: string = 'USD',
  items: Array<{
    item_id: string;
    item_name: string;
    category: string;
    quantity: number;
    price: number;
  }> = []
) => {
  if (process.env.NODE_ENV !== 'production') return;
  if (!(window as any).gtag) return;

  (window as any).gtag('event', 'purchase', {
    transaction_id: transactionId,
    value: value,
    currency: currency,
    items: items,
  });
};

export const trackUserEngagement = (
  engagement_time_msec: number,
  custom_parameters?: Record<string, any>
) => {
  if (process.env.NODE_ENV !== 'production') return;
  if (!(window as any).gtag) return;

  (window as any).gtag('event', 'user_engagement', {
    engagement_time_msec,
    ...custom_parameters,
  });
};

export default GoogleAnalytics;

// Type declarations for gtag
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}