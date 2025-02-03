import { m } from 'umhi';
import { GOG_ICON_URL, ITCH_ICON_URL, HUMBLE_ICON_URL } from './config';

const getIconUrl = (shop) => {
  if (shop === 'gog') return GOG_ICON_URL;
  if (shop === 'itch') return ITCH_ICON_URL;
  if (shop === 'humble') return HUMBLE_ICON_URL;
  return '';
};

export const Prices = ({ prices }) => (
  m('div',
    Object.entries(prices).map(([shop, data]) =>
      m('span', { style: { paddingRight: '2em' }, title: shop },
        m('a', { href: data.url },
          m('img', {
            src: getIconUrl(shop),
            style: {
              width: '20px',
              height: '20px',
              verticalAlign: 'middle',
              margin: '0 4px 0 0'
            }
          }),
          data.price
        )
      )
    )
  )
);

export const Container = ({ isAppPage = false }, ...children) => (
  m('div', {
    style: isAppPage ? {
      padding: '1em',
      position: 'relative',
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      fontSize: '12px',
      color: '#626366',
      zIndex: '0'
    } : ''
  },
    m('div', { style: isAppPage ? { paddingBottom: '1em' } : '' },
      m('b', 'DRM-Free versions available from:')
    ),

    children
  )
);
