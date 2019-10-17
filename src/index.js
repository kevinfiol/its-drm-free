import ITAD from './services/ITAD';
import config from './config';
import { render } from 'lit-html';
import { q, c } from './util';

// Components
import Stores from './components/Stores';
import AppContainer from './components/AppContainer';
import WishlistContainer from './components/WishlistContainer';

const location = window.location;
const path = location.pathname.split('/');
const itad = new ITAD(config.BASE_URL, config.API_KEY);

function getStores(app_id, callback) {    
    return itad.getSteamPlainId(app_id)
        .then(id => itad.getPrices(id, 'us', 'US'))
        .then(data => {
            const stores = data.list.filter(store => {
                // Have to do this check for HumbleStore
                if (store.shop.id === 'humblestore') {
                    return store.drm.indexOf('DRM Free') > -1;
                }
                
                return true;
            });

            if (stores.length > 0) {
                callback(stores);
            }
        })
    ;
}

// App Page
if (path[1] === 'app') {
    if (path[2]) {
        const app_id = path[2];

        getStores(app_id, stores => {
            // Game Store Page
            const purchaseBox = q('.game_area_purchase_game');
            const appContainer = c('div', 'its-drm-free-container');
            purchaseBox.insertAdjacentElement('beforebegin', appContainer);

            render(AppContainer( Stores(stores) ), appContainer);
        });
    }
}

// Wishlist
if (path[1] === 'wishlist') {
    const cache = {};

    const mutationCallback = (mutationList, observer) => {
        mutationList.forEach(mutation => {
            const row = mutation.addedNodes[0];
    
            if (row) {
                // Check to see if container already exists, if so, remove.
                const existing = row.querySelector('div.idf-wishlist-container');
                if (existing && existing.parentNode) {
                    existing.parentNode.removeChild(existing);
                }

                const referenceEl = row.querySelector('div.value.release_date');
                const wishlistContainer = c('div', 'idf-wishlist-container');

                wishlistContainer.style.display = 'none';
                referenceEl.insertAdjacentElement('afterend', wishlistContainer);

                row.addEventListener('mouseleave', e => {
                    wishlistContainer.style.display = 'none';
                });

                row.addEventListener('mouseenter', e => {
                    const app_id = row.dataset.appId;

                    if (app_id in cache) {
                        const stores = cache[app_id];
                        render(WishlistContainer( Stores(stores) ), wishlistContainer);
                        wishlistContainer.style.display = 'block';
                    } else {
                        getStores(app_id, stores => {
                            cache[app_id] = stores;
                            render(WishlistContainer( Stores(stores) ), wishlistContainer);
                            wishlistContainer.style.display = 'block';
                        });
                    }
                });
            }
        });
    };
    
    const wishlist = q('#wishlist_ctn');
    const observer = new MutationObserver(mutationCallback);
    
    observer.observe(wishlist, {
        childList: true,
        attributes: false,
        subtree: false
    });
}