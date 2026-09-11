/**
 * Google AdMob Configuration
 *
 * App ID: ca-app-pub-2896816909885703~3461262032
 * Production Rewarded Ad Unit ID: ca-app-pub-2896816909885703/3482172289
 * Development / Test Ad Unit ID: ca-app-pub-3940256099942544/5224354917
 */

export const ADMOB_APP_ID = "ca-app-pub-2896816909885703~3461262032";

export const ADMOB_REWARDED_PROD_ID = "ca-app-pub-2896816909885703/3482172289";

export const ADMOB_REWARDED_TEST_ID = "ca-app-pub-3940256099942544/5224354917";

/**
 * Determine if running in development / debug mode.
 */
export const isDevelopmentMode = (): boolean => {
  if (typeof process !== "undefined" && process.env?.NODE_ENV === "development") {
    return true;
  }
  if (typeof import.meta !== "undefined" && Boolean(import.meta.env?.DEV)) {
    return true;
  }
  return false;
};

/**
 * Get active Rewarded Ad Unit ID based on environment.
 * Development / debug mode strictly uses Google test ad unit.
 */
export const getRewardedAdUnitId = (): string => {
  return isDevelopmentMode() ? ADMOB_REWARDED_TEST_ID : ADMOB_REWARDED_PROD_ID;
};
