// utils/googleAuth.ts

interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
}

let isGoogleInitialized = false;
let initPromise: Promise<void> | null = null;

/**
 * Loads the Google Identity Services script
 */
export const loadGoogleScript = (): Promise<void> => {
  if (initPromise) return initPromise;
  
  initPromise = new Promise((resolve, reject) => {
    try {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
      document.head.appendChild(script);
    } catch (error) {
      reject(error);
    }
  });
  
  return initPromise;
};

/**
 * Initializes Google Identity Services
 */
export const initializeGoogle = (clientId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!clientId) {
      return reject(new Error('Google Client ID is not defined'));
    }
    
    loadGoogleScript().then(() => {
      try {
        if (!window.google || !window.google.accounts) {
          return reject(new Error('Google Identity Services not available'));
        }
        
        if (!isGoogleInitialized) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            cancel_on_tap_outside: true,
            context: 'signin',
            ux_mode: 'popup',
          });
          isGoogleInitialized = true;
        }
        resolve();
      } catch (error) {
        reject(error);
      }
    }).catch(reject);
  });
};

/**
 * Gets Google credential
 */
export const getGoogleCredential = (): Promise<string> => {
  const clientId = import.meta.env.VITE_AUTH_GOOGLE_ID;
  
  if (!clientId) {
    return Promise.reject(new Error('Google Client ID is not defined in environment variables'));
  }
  
  return new Promise((resolve, reject) => {
    initializeGoogle(clientId).then(() => {
      // Set up the callback before prompting
      window.google.accounts.id.callback = (response: GoogleCredentialResponse) => {
        if (response.credential) {
          resolve(response.credential);
        } else {
          reject(new Error('No credential returned'));
        }
      };
      
      try {
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed()) {
            const reason = notification.getNotDisplayedReason();
            console.warn('Google One Tap not displayed:', reason);
            
            // Browser/environment issues
            if (reason === 'browser_not_supported' || reason === 'third_party_cookies_blocked') {
              reject(new Error(`Google Sign-In cannot be displayed: ${reason}. Check browser settings or try a different browser.`));
            }
            // Config issues
            else if (reason === 'invalid_client' || reason === 'missing_client_id' || reason === 'unregistered_origin') {
              console.error('Google OAuth configuration error:', reason);
              reject(new Error(`Google authentication configuration error: ${reason}. Please check your Google Cloud Console configuration.`));
            }
            // Just skip if it's a UX reason
            else if (reason === 'suppressed_by_user' || reason === 'disabled_by_user') {
              console.log('One Tap suppressed by user preference');
              // Don't reject here, let the button handle it
            }
          } else if (notification.isSkippedMoment()) {
            console.log('Google One Tap skipped:', notification.getSkippedReason());
            // Don't reject for skips, let the button handle it
          }
        });
      } catch (error) {
        console.error('Error during Google prompt:', error);
        reject(error);
      }
    }).catch(reject);
  });
};

// For the Sign-In with Google button
export const renderGoogleButton = (elementId: string): Promise<void> => {
  const clientId = import.meta.env.VITE_AUTH_GOOGLE_ID;
  
  if (!clientId) {
    return Promise.reject(new Error('Google Client ID is not defined in environment variables'));
  }
  
  return new Promise((resolve, reject) => {
    initializeGoogle(clientId).then(() => {
      try {
        window.google.accounts.id.renderButton(
          document.getElementById(elementId)!,
          { theme: 'outline', size: 'large', width: '100%' }
        );
        resolve();
      } catch (error) {
        reject(error);
      }
    }).catch(reject);
  });
};

// Need to add this to your global.d.ts or similar file
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback?: (notification: any) => void) => void;
          renderButton: (element: HTMLElement, options: any) => void;
          callback: (response: GoogleCredentialResponse) => void;
        };
      };
    };
  }
}