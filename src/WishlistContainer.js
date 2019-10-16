import config from './config';
import { html } from 'lit-html';
import { styleMap } from 'lit-html/directives/style-map';

const gog_icon_url = config.GOG_ICON_URL;
const itch_icon_url = config.ITCH_ICON_URL;
const humble_icon_url = config.HUMBLE_ICON_URL;

const getIconUrl = store_id => {
    if (store_id === 'gog') return gog_icon_url;
    if (store_id === 'itchio') return itch_icon_url;
    if (store_id === 'humblestore') return humble_icon_url;
    return '';
};

const WishlistContainer = () => html`
    <div>
        <p>hello</p>
    </div>
`;

export default WishlistContainer;