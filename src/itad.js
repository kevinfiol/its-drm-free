import { API_KEY } from './config';
import { request } from './util';

// IDs from here:
// https://github.com/IsThereAnyDeal/AugmentedSteam/blob/b867b9c2d129bb2687cba8690042fc7c25f9e11a/src/js/Content/Modules/UpdateHandler.js#L132
const GOG = 35;
const ITCH = 44;
const HUMBLE = 37;
const DRM_FREE = 1000;
const DRM_FREE_TAG = 'Drm Free';

const api = (iface, method, version) =>
  `https://api.isthereanydeal.com/${iface}/${method}/${version}`;

export async function getGameId(appid = '') {
  let data = '';
  let error = undefined;
  const endpoint = api('games', 'lookup', 'v1');
  const params = { key: API_KEY, appid };

  try {
    const res = await request('GET', endpoint, { params });
    if (!res.found) throw Error('Game not found with appid', appid);
    data = res.game.id;
  } catch (e) {
    error = e;
  }

  return { data, error };
}

export async function getStorePrices(gameId) {
  let data = {};
  let error = undefined;
  const endpoint = api('games', 'prices', 'v2');

  const params = {
    key: API_KEY,
    shops: [GOG, ITCH, HUMBLE].join(','),
    country: 'US',
    capacity: 10,
    nondeals: true,
    vouchers: false
  };

  try {
    const res = await request('POST', endpoint, {
      params,
      body: [gameId]
    });

    if (res.length && res[0].deals.length) {
      const deals = res[0].deals;

      for (const deal of deals) {
        const shopId = deal.shop.id;
        const shop =
          shopId === ITCH ? 'itch' :
          shopId === HUMBLE ? 'humble' :
          shopId === GOG ? 'gog' : '';

        if (shopId === HUMBLE) {
          const isDrmFree = deal.drm.some((drm) =>
            drm.id === DRM_FREE || drm.name === DRM_FREE_TAG
          );

          if (!isDrmFree) continue;
        }

        data[shop] = {
          shop,
          price: `$${deal.price.amount}`,
          url: deal.url
        };
      }
    }
  } catch (e) {
    error = e;
  }

  return { data, error };
}
