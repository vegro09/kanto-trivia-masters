import { Capacitor } from "@capacitor/core";
import {
  AdMob,
  RewardAdPluginEvents,
  type AdLoadInfo,
  type AdMobError,
  type AdMobRewardItem,
} from "@capacitor-community/admob";
import { getRewardedAdUnitId, isDevelopmentMode } from "./admob-config";

export interface ShowAdOptions {
  onReward: () => void;
  onDismiss?: () => void;
  onFallback: () => void;
}

class AdMobService {
  private isInitialized = false;
  private isAdLoaded = false;
  private isAdLoading = false;
  private pendingRewardCallback: (() => void) | null = null;
  private pendingDismissCallback: (() => void) | null = null;

  /**
   * Check if running inside a native mobile environment (Capacitor / Android / iOS).
   */
  public isNative(): boolean {
    if (typeof window === "undefined") return false;
    return Capacitor.isNativePlatform();
  }

  /**
   * Initialize Google Mobile Ads SDK once upon app launch.
   */
  public async initialize(): Promise<void> {
    if (typeof window === "undefined" || this.isInitialized) return;

    if (!this.isNative()) {
      // In web browser, mark initialized; native SDK is bypassed for web simulation
      this.isInitialized = true;
      return;
    }

    try {
      await AdMob.initialize({
        initializeForTesting: isDevelopmentMode(),
      });

      this.isInitialized = true;
      this.setupListeners();
      // Preload initial ad right after initialization
      await this.preloadRewardedAd();
    } catch (error) {
      console.warn("[AdMob] Native initialization failed, falling back to web mode:", error);
      this.isInitialized = true;
    }
  }

  /**
   * Setup native event listeners for rewarded ads.
   */
  private setupListeners(): void {
    AdMob.addListener(RewardAdPluginEvents.Loaded, (info: AdLoadInfo) => {
      this.isAdLoaded = true;
      this.isAdLoading = false;
      console.info("[AdMob] Rewarded Ad successfully loaded:", info.adUnitId);
    });

    AdMob.addListener(RewardAdPluginEvents.FailedToLoad, (error: AdMobError) => {
      this.isAdLoaded = false;
      this.isAdLoading = false;
      console.warn("[AdMob] Rewarded Ad failed to load:", error);
    });

    AdMob.addListener(RewardAdPluginEvents.Rewarded, (reward: AdMobRewardItem) => {
      console.info("[AdMob] User earned reward:", reward);
      if (this.pendingRewardCallback) {
        this.pendingRewardCallback();
        this.pendingRewardCallback = null;
      }
    });

    AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
      console.info("[AdMob] Rewarded Ad dismissed. Preloading next ad...");
      this.isAdLoaded = false;
      if (this.pendingDismissCallback) {
        this.pendingDismissCallback();
        this.pendingDismissCallback = null;
      }
      // Preload the next ad automatically upon ad dismissal
      void this.preloadRewardedAd();
    });

    AdMob.addListener(RewardAdPluginEvents.FailedToShow, (error: AdMobError) => {
      console.warn("[AdMob] Rewarded Ad failed to show:", error);
      this.isAdLoaded = false;
      // Preload another ad
      void this.preloadRewardedAd();
    });
  }

  /**
   * Preload a Rewarded Ad in the background.
   */
  public async preloadRewardedAd(): Promise<void> {
    if (!this.isNative() || this.isAdLoaded || this.isAdLoading) return;

    this.isAdLoading = true;
    const adId = getRewardedAdUnitId();
    const isTesting = isDevelopmentMode();

    try {
      await AdMob.prepareRewardVideoAd({
        adId,
        isTesting,
      });
    } catch (error) {
      this.isAdLoading = false;
      console.warn("[AdMob] Preloading rewarded ad error:", error);
    }
  }

  /**
   * Show the Rewarded Ad.
   * - If native and loaded, displays native Google AdMob ad.
   * - If web browser or native ad not available, calls onFallback to trigger simulation modal.
   */
  public async showRewardedAd(options: ShowAdOptions): Promise<void> {
    if (!this.isNative()) {
      // Running on web browser -> invoke fallback simulation modal
      options.onFallback();
      return;
    }

    // Set callback references for the native event listeners
    this.pendingRewardCallback = options.onReward;
    this.pendingDismissCallback = options.onDismiss || null;

    try {
      if (!this.isAdLoaded) {
        // Try preparing if not loaded yet
        await this.preloadRewardedAd();
      }

      await AdMob.showRewardVideoAd();
    } catch (error) {
      console.warn("[AdMob] Could not show native ad, switching to fallback:", error);
      this.pendingRewardCallback = null;
      this.pendingDismissCallback = null;
      options.onFallback();
    }
  }
}

export const admobService = new AdMobService();
