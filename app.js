import { YMapsMapService } from './js/modules/ymaps/services/ymaps-map.service.js';
import { mapConfig as config } from './js/modules/ymaps/constants/map-config.constant.js';
import { mapState as state } from './js/modules/ymaps/constants/map-state.constant.js'
import { mapOptions as options } from './js/modules/ymaps/constants/map-options.constant.js';

let map;
let mapService;
let objectManager;
let boundaries;


async function onInit() {
    onInitYmapsAPI();
}



async function onInitYmapsAPI() {
    const isMobile = getDeviceMobile();
    const mapOptions = { state, options: { ...(isMobile ? { balloonPanelMaxMapArea: Infinity, ...options } : options) }, config };
    mapService = new YMapsMapService('map', mapOptions);
    mapService.ready.then(async (yaMap) => {
        console.log('INIT')
        map = yaMap;
        document.querySelector('#map-container').setAttribute('data-load', true);
        objectManager = new ymaps.ObjectManager();
        map.geoObjects.add(objectManager);
        delay(500).then(() => addBoundaries());
    });
}

async function addBoundaries() {
    const data = await getData();
    boundaries = ymaps.geoQuery(data).addToMap(map);
    new ymaps.polylabel.create(map, boundaries);
}

function reverse(data) {
    data?.forEach((coordinates) => coordinates.reverse());
}


async function getData() {
    const response = await fetch('./data-storage/district-zone.json');
    const data = await response.json();
    data.features.forEach((feature) => {
        reverse(feature.geometry.coordinates[0]);
    })
    return data;
}

function getFilterFunction(categories) {
    return (obj) => {
        var content = obj.properties.sheet;
        return categories[content];
    }
}


async function updateDataSheets() {
    const data = await getSheets();
    data?.forEach((sheet) => sheet && buildRow2(sheet));
}

function getDeviceMobile() {
    return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

document.addEventListener('DOMContentLoaded', onInit);