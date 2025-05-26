/**
 * Type declaration file for extending the RequestInit interface with custom properties
 * used in the application.
 */

interface CustomRequestInit extends RequestInit {
  /**
   * Flag to indicate if CSRF protection should be applied to this request
   * Even though CSRF protection is temporarily disabled, this property is still
   * used in the code to identify requests that would normally require CSRF protection.
   */
  withCsrf?: boolean;
}

// Extend the global fetch function to accept our custom RequestInit
declare global {
  function fetch(input: RequestInfo | URL, init?: CustomRequestInit): Promise<Response>;
}

// Export the type for use in other files
export type { CustomRequestInit };
