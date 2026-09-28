export interface HeroSlide {
  id: string | number;
  title: string;
  subtitle: string;
  image: string;
  ctaText: string;
  ctaLink: string;
}

export interface NewArrivalsConfig {
  sectionTitle: string;
  links: Array<{ label: string; href: string }>;
  curatedCard: {
    title: string;
    subtitle: string;
    image: string;
    ctaText: string;
    ctaLink: string;
  };
}

export interface KanchipuramConfig {
  badge: string;
  title: string;
  subtitle: string;
  lookbookCard: {
    title: string;
    subtitle: string;
    image: string;
    link: string;
  };
}

export interface BridalFestiveCard {
  id: string;
  title: string;
  price: number;
  originalPrice: number;
  image: string;
  link?: string;
}

export interface BridalFestiveConfig {
  badge: string;
  title: string;
  viewAllLink: string;
  cards: BridalFestiveCard[];
}

export interface VideoBannerConfig {
  badge: string;
  title: string;
  description: string;
  videoUrl: string;
  poster: string;
  cta1Text: string;
  cta1Link: string;
  cta2Text: string;
}

export interface WeddingStoryItem {
  title: string;
  subtitle: string;
  image: string;
  link: string;
}

export interface WeddingStoriesConfig {
  badge: string;
  title: string;
  subtitle: string;
  stories: WeddingStoryItem[];
}

export interface LoomSwatchItem {
  title: string;
  desc: string;
  image: string;
}

export interface LoomStoryConfig {
  badge: string;
  title: string;
  subtitle: string;
  swatches: LoomSwatchItem[];
}

export interface ReadyToShipConfig {
  badge: string;
  title: string;
  viewAllLink: string;
}

export interface StoreLocationItem {
  id: string;
  name: string;
  rating: string;
  reviews: string;
  address: string;
  phone: string;
  hours: string;
  image: string;
  mapQuery: string;
}

export interface StoresConfig {
  badge: string;
  title: string;
  subtitle: string;
  stores: StoreLocationItem[];
}

export interface HomePageConfig {
  heroSlides: HeroSlide[];
  newArrivals: NewArrivalsConfig;
  kanchipuram: KanchipuramConfig;
  bridalFestive: BridalFestiveConfig;
  videoBanner: VideoBannerConfig;
  weddingStories: WeddingStoriesConfig;
  loomStory: LoomStoryConfig;
  readyToShip: ReadyToShipConfig;
  stores: StoresConfig;
}
