import config from './config';
import { html } from 'lit-html';
import { styleMap } from 'lit-html/directives/style-map';

const gog_icon_url = config.GOG_ICON_URL;
const itch_icon_url = config.ITCH_ICON_URL;

const ContainerStyles = {
    padding: '1em',
    position: 'relative',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    fontSize: '12px',
    color: '#626366',
    zIndex: '0'
};

const Container = stores => html`
    <div style=${ styleMap(ContainerStyles) }>
        <div style="padding-bottom: 1em;">
            <b>DRM-Free versions available from:</b>
        </div>
        
        <div>
            ${ stores.map(s => {
                return html`
                    <span style="padding-right: 2em;">
                        <a href=${ s.url }>
                            <img
                                src=${ s.shop.id === 'gog' ? gog_icon_url : itch_icon_url }
                                style="width: 20px; height: 20px; vertical-align: middle; margin: 0 4px 0 0;"
                            />
                            $${ s.price_new }
                        </a>
                    </span>
                `;
            }) }
        </div>
    </div>
`;

export default Container;