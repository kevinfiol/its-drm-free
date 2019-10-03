import ITAD from './services/ITAD';
import config from './config';
import Container from './Container';
import { render } from 'lit-html';
import { q, c } from './util';

const location = window.location;
const path = location.pathname.split('/');

// App Page
if (path[1] === 'app') {
    if (path[2]) {
        const app_id = path[2];
    
        /**
         * Collect Data
         */
        const itad = new ITAD(config.BASE_URL, config.API_KEY);
    
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
    
                    // Game Store Page
                    const purchaseBox = q('.game_area_purchase_game');
                    const appContainer = c('div', 'its-drm-free-container');
    
                    purchaseBox.insertAdjacentElement('beforebegin', appContainer);
                    render(Container(stores), appContainer);
                }
            })
        ;
    }
}

// Wishlist
if (path[1] === 'wishlist') {
    const mutationCallback = (mutationList, observer) => {
        mutationList.forEach(mutation => {
            const row = mutation.addedNodes[0];
    
            if (row) {
                row.addEventListener('mouseenter', e => {
                    const app_id = row.dataset.appId;

                    const row_title = row.querySelector('a.title');
                    row_title.insertAdjacentElement('afterend', c('p', 'foo', 'foopota'));

                    // /**
                    //  * Collect Data
                    //  */
                    // const itad = new ITAD(config.BASE_URL, config.API_KEY);
                
                    // itad.getSteamPlainId(app_id)
                    //     .then(id => itad.getPrices(id, 'us', 'US'))
                    //     .then(data => {
                    //         const stores = data.list;
                
                    //         if (stores.length) {
                    //             if (stores.length === 1) {
                    //                 // Check if HumbleStore is the only store
                    //                 // If it is, make sure it has a DRM Free version
                    //                 // Else, don't render the Container
                    //                 const store = stores[0];
                                    
                    //                 if (store.shop.id === 'humblestore' && store.drm.indexOf('DRM Free') < 0) {
                    //                     return;
                    //                 }
                    //             }
                

                    //             const appContainer = c('div', 'its-drm-free-container');
                    //             row.insertAdjacentElement('beforebegin', appContainer);

                    //             render(Container(stores), appContainer);
                    //         }
                    //     })
                    // ;
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