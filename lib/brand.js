import {
  siSpotify, siOpenai, siAmazon, siNetflix, siNotion, siFigma,
  siCrunchyroll, siNbc, siChase, siAmericanexpress, siRobinhood, siApple,
  siBankofamerica, siVenmo,
} from 'simple-icons';

/* App/platform id → simple-icons mark. Ids without an available mark
   (Capital One, Fidelity) fall back to their letter tile in BrandTile. */
export const BRAND = {
  spotify: siSpotify,
  chatgpt: siOpenai,
  prime:   siAmazon,
  netflix: siNetflix,
  notion:  siNotion,
  figma:   siFigma,
  crunchy: siCrunchyroll,
  peacock: siNbc,
  chase:   siChase,
  freedom: siChase,
  amex:    siAmericanexpress,
  rh:      siRobinhood,
  apple:   siApple,
  boa:     siBankofamerica,
  venmo:   siVenmo,
};
