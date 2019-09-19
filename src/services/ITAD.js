import { request } from '../util';

const get = (url, params = {}) =>
    request('GET', url, params).then(JSON.parse)
;

function ITAD(base_url, api_key) {
    this.base_url = base_url;
    this.api_key = api_key;
}

ITAD.prototype.makeEndpoint = function(version, iface, method) {
    return `${this.base_url}/${version}/${iface}/${method}/`;
};

ITAD.prototype.parseResponse = function(res) {
    const key = Object.keys(res.data)[0];
    return res.data[key];
};

ITAD.prototype.getPlainId = function(shop, game_id) {
    const endpoint = this.makeEndpoint('v02', 'game', 'plain');
    const data = { key: this.api_key, shop, game_id };

    return get(endpoint, data)
        .then(data => console.log(data))
    ;
};

ITAD.prototype.getSteamPlainId = function(steam_appid) {
    const endpoint = this.makeEndpoint('v02', 'game', 'plain');
    const data = { key: this.api_key, game_id: `app/${steam_appid}`, shop: 'steam' };

    return get(endpoint, data)
        .then(this.parseResponse)
    ;
};

ITAD.prototype.getPrices = function(plain_id, region, country) {
    const endpoint = this.makeEndpoint('v01', 'game', 'prices');
    const data = { key: this.api_key, plains: plain_id, shops: 'gog,itchio', region, country };

    return get(endpoint, data)
        .then(this.parseResponse)
    ;
};

export default ITAD;