import config from '../config';
import { html } from 'lit-html';

const gog_icon_url = config.GOG_ICON_URL;
const itch_icon_url = config.ITCH_ICON_URL;
const humble_icon_url = config.HUMBLE_ICON_URL;

const getIconUrl = store_id => {
    if (store_id === 'gog') return gog_icon_url;
    if (store_id === 'itchio') return itch_icon_url;
    if (store_id === 'humblestore') return humble_icon_url;
    return '';
};

const Stores = stores => html`
    <div>
        ${ stores.map(s => {
            if (s.shop.id === 'humblestore' && s.drm.indexOf('DRM Free') < 0) {
                // Humble Store version is not DRM-Free
                return null;
            }

            return html`
                <span style="padding-right: 2em;">
                    <a href=${ s.url }>
                        <img
                            src=${ getIconUrl(s.shop.id) }
                            style="width: 20px; height: 20px; vertical-align: middle; margin: 0 4px 0 0;"
                        />
                        $${ s.price_new }
                    </a>
                </span>
            `;
        }) }
    </div>
`;

export default Stores;