import ITAD from './services/ITAD';
import config from './config';
import Container from './Container';
import WishlistContainer from './WishlistContainer';
import { render } from 'lit-html';
import { q, c } from './util';

const location = window.location;
const path = location.pathname.split('/');
const itad = new ITAD(config.BASE_URL, config.API_KEY);

function getStores(app_id, callback) {    
    itad.getSteamPlainId(app_id)
        .then(id => itad.getPrices(id, 'us', 'US'))
        .then(data => {
            const stores = data.list;

            if (stores.length) {
                if (stores.length === 1) {
                    // Check if HumbleStore is the only store
                    // If it is, make sure it has a DRM Free version
                    // Else, don't render the Container
                    const store = stores[0];
                    
                    if (store.shop.id === 'humblestore' && store.drm.indexOf('DRM Free') < 0) {
                        return;
                    }
                }

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
            render(Container(stores), appContainer);
        });
    }
}

// Wishlist
if (path[1] === 'wishlist') {
    const mutationCallback = (mutationList, observer) => {
        mutationList.forEach(mutation => {
            const row = mutation.addedNodes[0];
    
            if (row) {
                // Check to see if container already exists, if so, remove.
                const existing = row.querySelector('div.idf-wishlist-container');
                if (existing && existing.parentNode) {
                    existing.parentNode.removeChild(existing);
                }

                const row_title = row.querySelector('a.title');
                const wishlistContainer = c('div', 'idf-wishlist-container');
                wishlistContainer.style.display = 'none';

                row_title.insertAdjacentElement('afterend', wishlistContainer);
                render(WishlistContainer(), wishlistContainer);

                row.addEventListener('mouseleave', e => {
                    wishlistContainer.style.display = 'none';
                });

                row.addEventListener('mouseenter', e => {
                    const app_id = row.dataset.appId;
                    wishlistContainer.style.display = 'block';
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