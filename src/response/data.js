import smi_data from '@/response/json/smi.js'
import soc_data from '@/response/json/soc.js'
import countries_data from '@/response/json/countries.js'


let object_country = {};

let new_countries = [];

new_countries.sort((a, b) => (b.value - a.value));
const countries = reactive(ref(new_countries));

function set_country(hc_key) {
    countries.value.forEach(country => {
        if (country['hc-key'] == hc_key) {
            country.selected = !country.selected;
        }
        else {
            country.selected = false;
        }
    });
}

import { reactive, ref } from 'vue';

let social_names = {
    2: 'Facebook',
    4: 'Instagram',
    3: 'Twitter',
    7: 'Одноклассники',
    1: 'ВКонтакте',
    8: 'MailRu',
    5: 'GooglePlus',
    6: 'YouTube',
    9: 'Telegram',
};
let temp_socials = {
    'Facebook': [],
    'Instagram': [],
    'Twitter': [],
    'Одноклассники': [],
    'ВКонтакте': [],
    'MailRu': [],
    'GooglePlus': [],
    'YouTube': [],
    'Telegram': [],
};

let temp_filter = {
    type: {
        pinned: true,
        title: 'Новости по',
        value: [1, 2],
    },
    region: {
        pinned: false,
        title: 'Регион',
        value: [100, 57, 40],
    },
    date: {
        pinned: false,
        title: 'Дата',
        value: ['2022-12-24 - 2023-01-23'],
    },
    language: {
        pinned: false,
        title: 'Язык',
        value: [4, 5],
    },
    sentiment: {
        pinned: false,
        title: 'Тональность',
        value: [1],
    },
    resource: {
        pinned: false,
        title: 'Ресурс',
        value: [63, 120143],
    },
}
const filter = reactive(ref(temp_filter))

export {
    filter,
    countries,
}