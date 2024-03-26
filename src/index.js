import { mount } from 'umhi';
import { getGameId, getStorePrices } from './itad';
import { Container, Prices } from './components';

const [_, PAGE_TYPE, APP_ID] = window.location.pathname.split('/');

async function getStores(app_id, callback) {
  try {
    const id = await getGameId(app_id);
    if (id.error) throw id.error;

    const prices = await getStorePrices(id.data);
    if (prices.error) throw prices.error;

    if (Object.keys(prices.data).length > 0) {
      callback(prices.data);
    }
  } catch (e) {
    console.error('its-drm-free getStores error', e);
  }
}

// App Page
if (PAGE_TYPE === 'app' && APP_ID) {
  getStores(APP_ID, prices => {
    const appContainer = document.createElement('div');
    appContainer.classList.add('its-drm-free-container');
    document.querySelector('.game_area_purchase_game')
      .insertAdjacentElement('beforebegin', appContainer);

    mount(appContainer, () =>
      Container({ isAppPage: true },
        Prices({ prices })
      )
    );
  });
}

// Wishlist
if (PAGE_TYPE === 'wishlist') {
  const cache = {};

  const mutationCallback = (mutationList) => {
    mutationList.forEach(mutation => {
      const row = mutation.addedNodes[0];
      if (!row) return;

      // Check to see if container already exists, if so, remove.
      const existing = row.querySelector('div.idf-wishlist-container');
      if (existing && existing.parentNode) {
        existing.parentNode.removeChild(existing);
      }

      const referenceEl = row.querySelector('div.value.release_date');
      const wishlistContainer = document.createElement('div');
      wishlistContainer.classList.add('idf-wishlist-container');
      wishlistContainer.style.display = 'none';
      referenceEl.insertAdjacentElement('afterend', wishlistContainer);

      row.addEventListener('mouseleave', () => {
        wishlistContainer.style.display = 'none';
      });

      row.addEventListener('mouseenter', () => {
        const app_id = row.dataset.appId;

        if (app_id in cache) {
          const prices = cache[app_id];

          mount(wishlistContainer, () =>
            Container({},
              Prices({ prices })
            )
          );

          wishlistContainer.style.display = 'block';
        } else {
          getStores(app_id, prices => {
            cache[app_id] = prices;

            mount(wishlistContainer, () =>
              Container({},
                Prices({ prices })
              )
            );

            wishlistContainer.style.display = 'block';
          });
        }
      });
    });
  };

  const wishlist = document.querySelector('#wishlist_ctn');
  const observer = new MutationObserver(mutationCallback);

  observer.observe(wishlist, {
    childList: true,
    attributes: false,
    subtree: false
  });
}
