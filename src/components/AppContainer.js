import { html } from 'lit-html';
import { styleMap } from 'lit-html/directives/style-map';

const AppContainerStyles = {
    padding: '1em',
    position: 'relative',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    fontSize: '12px',
    color: '#626366',
    zIndex: '0'
};

const AppContainer = children => html`
    <div style=${ styleMap(AppContainerStyles) }>
        <div style="padding-bottom: 1em;">
            <b>DRM-Free versions available from:</b>
        </div>
        
        ${children}
    </div>
`;

export default AppContainer;