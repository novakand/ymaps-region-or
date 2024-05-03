import { YMapsAPILoader } from './ymaps-api-loader.js';
import { YMapsLibLoader } from './ymaps-lib-loader.js';
import { libConfig } from '../constants/lib-config.constant.js';

export class YMapsMapService {

    constructor(htmlElement, options) {
        this._options = options || {}
        this.loader = new YMapsAPILoader(this._options.config);
        this.ready = this._apiLoader(htmlElement, this._options);
    }

    async destroy() {
        const map = await this._maps;
        map.destroy();
        document.getElementById('ymapsScript').remove();
        ymaps = null;
    }

    _apiLoader(htmlElement, options) {
        return new Promise((resolve, reject) => {
            this.loader.load().then(async () => {
                this._maps = this._createMap(htmlElement, options);
                this.loadModules();
                this._setBackgroundContainerMap();
                resolve(this._maps);
            }).catch((error) => error);
        });
    }

    async loadModules() {
        new YMapsLibLoader(libConfig.calculateArea)
            .load()
            .then(async () => {
                await new YMapsLibLoader(libConfig.polylabeler).load();
                ymaps.ready(['polylabel.create']);
            });
    }

    _createMap(htmlElement, options) {
        return new Promise((resolve, reject) => {
            resolve(this._createOptions(htmlElement, options));
        }).catch((error) => error && new Error(error));
    }

    _createOptions(htmlElement, options) {
        return new ymaps.Map(htmlElement, { ...options.state }, {
            ...options.options, yandexMapDisablePoiInteractivity: true,
            restrictMapArea: [[-83.8, -170.8], [83.8, 170.8]],
            suppressMapOpenBlock: true,
        });
    }

    async _setBackgroundContainerMap() {
        const { container } = await this._maps;
        container.getElement().style.background = '#fff';
    }
}