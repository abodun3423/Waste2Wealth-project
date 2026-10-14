// Use REACT_APP_API_URL for staging; retain the deployed Render backend as fallback.
export const API_URL = (process.env.REACT_APP_API_URL || 'https://waste2wealth-project-3.onrender.com').replace(/\/+$/, '');
