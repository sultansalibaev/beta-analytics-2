
import world_json from '@/response/json/world_countries.js'

import { computed, reactive, ref, watch } from 'vue';
import Highcharts from "highcharts";

import { reset_sentiment } from "@/response/options/barOptions"

import { selected_regions, places } from "@/response/data/index"
import { isKazakstan } from "@/response/header"
import { create_global_filter, global_filter } from '../filter';

export const map_switch = reactive(ref(isKazakstan.value))

watch(selected_regions, () => {
    get_map_keys.value.map(key => key);
});

export const toggle_map_switcher = () => {
    map_switch.value = !map_switch.value;
}

const map_switcher = computed(() => (
    isKazakstan.value || map_switch.value
))

export const map_type_switcher = computed(() => (
    map_switch.value ? 'regions' : (isKazakstan.value ? "regions" : "countries")
))

export const region_active = reactive(ref({}))

export const reset_regions = () => {
    Object.keys(selected_regions.value).forEach(id => {
        selected_regions.value[id] = false
    })
}

export const get_map_params = computed(() => {
    let map_params = Object.keys(selected_regions.value)
        .filter(id => selected_regions.value[id]);

    map_params = map_params.reduce((prev, id) => {
        if (id.includes('kz_')) {
            prev.regions.push(id.slice(3, id.length))
        }
        else {
            prev.countries.push(id)
        }
        return prev
    }, {
        countries: [],
        regions: [],
    })

    return map_params
})

export const get_map_keys = computed(() => {
    return Object.keys(selected_regions.value)
        .filter(id => selected_regions.value[id]);
})

export const select_one_region = (id, selected) => {
    let selected_region_count = Object.values(selected_regions.value).filter(bool => bool).length;
    let old_bool = selected_regions.value[id];
    reset_regions()
    let bool = selected == 'clicked-item-from-region-list' ? !old_bool : selected;
    if (selected_region_count > 1) {
        bool = true;
    }
    selected_regions.value[id] = bool;

    
    global_filter.value = create_global_filter()

}

export const select_region = (id, selected) => {
    selected_regions.value[id] = selected == 'clicked-item-from-region-list' ? !selected_regions.value[id] : selected;
    if ((id + '').includes('kz_') && selected_regions.value[id]) {
        selected_regions.value[57] = false
    }
    else if (id == 57 && selected_regions.value[id]) {
        Object.keys(selected_regions.value).forEach(region_id => {
            if ((region_id + '').includes('kz_') && selected_regions.value[region_id]) {
                selected_regions.value[region_id] = false
            }
        })
    }
    
    global_filter.value = create_global_filter()
}

export const region__MouseOver = function (hc_key) {
    let element = document.querySelector(`.highcharts-key-${hc_key}`)
    if (element) {
        old_color = element.getAttribute('fill')
        element.setAttribute('fill', 'rgb(26,179,148)')
    }
}

let old_color = ''

export const region__MouseOut = function (hc_key, selected) {
    let element = document.querySelector(`.highcharts-key-${hc_key}`)
    if (element && !selected && old_color != 'rgb(26,179,148)') {
        element.setAttribute('fill', old_color)
    }
}

export const regionMouseOver = function (id, hc_key) {
    region_active.value[id] = true;
    const element = document.querySelector(".region." + hc_key);
    if (element) element.scrollIntoView({ behavior: "smooth", block: "end" });
}

export const regionMouseOut = function (id) {
    region_active.value[id] = false;
}

export let mapOptions = computed(() => ({
    chart: {
        map: (map_switcher.value ? "map-kz" : "map-world"),
        animation: false,
        margin: 0,
    },
    title: {
        text: ""
    },
    credits: {
        enabled: false
    },
    subtitle: {
        text:
            ''
    },
    mapNavigation: {
        enabled: true,
        enableButtons: false,

        mouseWheelSensitivity: 1.3,
        buttonOptions: {
            verticalAlign: 'bottom',
            height: 10,
            width: 10,
        },
    },

    colorAxis: {
        min: 1,
        max: 50000,
        type: 'logarithmic',
        minColor: '#c5e1fb',
        maxColor: '#084c8e',
        stops: [
            [0, '#EFEFFF'],
            [0.67, '#3069a0'],
            [1, '#084c8e']
        ]
    },

    tooltip: {
        headerFormat: '<span style="font-size:11px"><b>Регион:</b></span>',
        pointFormat: '<span> {point.country}<br> <b>Публикаций:</b> {point.value}</span></br>',
        shared: true,
        useHTML: true,
    },

    legend: {
        enabled: false
    },

    series: [
        {
            point: {
                events: {
                    click: function (e) {
                        reset_sentiment()
                        this.selected = !this.selected
                        if (e.shiftKey) {
                            select_region(this['id'], this.selected)
                        }
                        else {
                            select_one_region(this['id'], this.selected)
                        }
                    },
                    mouseOver: function () {
                        old_color = this.color
                        regionMouseOver(this.options.id, this.options['hc-key'])
                    },
                    mouseOut: function () {
                        regionMouseOut(this.options.id)
                    },
                }
            },
            borderWidth: .4,
            name: "",
            dataLabels: {
                enabled: true,

                format: ""
            },
            states: {
                hover: {
                    color: "rgb(26,179,148)"
                },
                select: {
                    color: "rgb(26,179,148)",
                    enabled: true
                },
            },

            mapData: Highcharts.maps[map_switcher.value ? "map-kz" : "map-world"],
            //allAreas: false,
            data: world_json[(map_switcher.value ? "map-kz" : "map-world")].map(item => {
                let find_cntry = places.value[map_type_switcher.value][item['hc-key']];
                if (find_cntry != undefined) {
                    find_cntry.selected = selected_regions.value[find_cntry.id];
                    if (find_cntry.color == 'rgb(26,179,148)') {
                        let { color, ...temp_find_cntry } = find_cntry
                        color;
                        find_cntry = temp_find_cntry
                    }
                    return find_cntry;
                }
                else {
                    return item;
                }
            })
        }
    ]
}));
