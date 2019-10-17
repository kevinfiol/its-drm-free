import { html } from 'lit-html';

const WishlistContainer = children => html`
    <div>
        <div>
            <b>DRM-Free versions available from:</b>
        </div>
        
        ${children}
    </div>
`;

export default WishlistContainer;