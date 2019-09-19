import ITAD from './services/ITAD';
import config from './config';
import Container from './Container';
import { render } from 'lit-html';
import { q, c } from './util';

const location = window.location;
const path = location.pathname.split('/');

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
            console.log(stores);

            if (stores.length) {
                // Game Store Page
                const purchaseBox = q('.game_area_purchase_game');
                const appContainer = c('div', 'its-on-gog-container');

                purchaseBox.insertAdjacentElement('beforebegin', appContainer);
                render(Container(stores), appContainer);
            }
        })
    ;
}