import axios from 'axios'
import { project, socials, countries, regions, social_categories, generals_count, smi_categories, r_type, main_sentiments_count, selected_main_sentiments, languages_count, languages_general_data, categories_general_data, smi_category, search_tags, isKazakstan } from '@/response/header'
import { dateRange, selected_social_categories, places, selected_categories, selected_languages, resource_count, resource_full_news_count, column_news_count, resources, offsetLeft, offsetRight, resource_clipped_news_count, selected_resources, selected_resource_sentiment, bars_sentiments_selected, selected_date_mode, dynamics, soc_metrics, enable_metrics, is_high_news_count, news_count, similars_count, resources_count, items, items_loading, selected_page, selected_soc_metrics, resource_count_loading, laoding_metrics, selected_regions, reset_all, get_selected_smi_categories, isGrouped, similar_items, similar_items_loading, thumbnail_dates, countries_with_regions, getCountryRegions } from '@/response/data/index'
import { getResourceData, selected_top_resources, start_top_resources, end_top_resources, each_number, max } from '@/response/options/columnOptions'
import { get_map_params } from '@/response/options/mapOptions'
import { selected_dates_query, selected_sentiment_dates_query } from '@/response/options/lineOptions'
import { s_time, f_time } from '@/data'
import { computed, watch } from 'vue'







let firstLoad = true;

export const end_clipped = computed(() => {
	
	let start_count = ((end_top_resources.value + 1) * each_number.value);
	// if (selected_res_news > resource_count.value) selected_res_news = resource_count.value;

	if (start_count > resource_count.value) start_count = resource_count.value;

	return start_count
})


const reset_all_selected_data = () => {
	reset_all.value = true
	selected_regions.value = {}

    selected_categories.value = {}
    selected_languages.value = {
		"10": false,
		"4": false,
		"5": false,
		"3": false,
	}

	selected_main_sentiments.value = {
        "-1": true,
        0: true,
        1: true,
    }

    selected_resources.value = {resources:{}}

	selected_resource_sentiment.value = {
        sentiment_resources: {
            1: {},
            0: {},
            "-1": {},
        }
    }
	bars_sentiments_selected.value = {
		sentiment_places: {
			"1": {},
			"0": {},
			"-1": {},
		}
	}
}

const obj_copy = function (obj) {
	console.log(JSON.parse(JSON.stringify(obj)));
	return JSON.parse(JSON.stringify(obj))
}


export function getProjectCounts() {
	items_loading.value = true

	axios
		.get(`/ru/analyticstats/get-project-count?p_id=${project.value.id}&s_date=${dateRange.value.startDate.format("Y-m-d")} ${s_time.value}&f_date=${dateRange.value.endDate.format("Y-m-d")} ${f_time.value}`)
		.then(response => {
			let temp_soc_obj = {
				'count': 0,
				'1': 0,
				'0': 0,
				'-1': 0,
			};
			console.log('response', response);
			console.log('search_tags', response.data.search_tags);
			search_tags.value = response.data.search_tags
			socials.value = response.data.socials.reduce((prev, social) => {
				console.log('social_id', social.id);
				if (prev[social.id] === undefined) {
					prev[social.id] = obj_copy(temp_soc_obj);
				}
				prev[social.id].count = parseInt(social.count) || 0
				prev[social.id]['-1'] = parseInt(social.negative) || 0
				prev[social.id]['0'] = parseInt(social.neutral) || 0
				prev[social.id]['1'] = parseInt(social.positive) || 0
				return prev
			}, {
				2: obj_copy(temp_soc_obj),
				4: obj_copy(temp_soc_obj),
				3: obj_copy(temp_soc_obj),
				7: obj_copy(temp_soc_obj),
				1: obj_copy(temp_soc_obj),
				8: obj_copy(temp_soc_obj),
				5: obj_copy(temp_soc_obj),
				6: obj_copy(temp_soc_obj),
				9: obj_copy(temp_soc_obj),
				10: obj_copy(temp_soc_obj),
			})
			social_categories.value.forEach(social_category => {
				if (!socials.value[social_category.id]) {
					socials.value[social_category.id] = obj_copy(temp_soc_obj);
				}
				let social = socials.value[social_category.id] ?? obj_copy(temp_soc_obj)
				console.log('social_categories', social, social_category.id);
				social_category.count = parseInt(social.count) || 0
				social_category['-1'] = parseInt(social['-1']) || 0
				social_category['0'] = parseInt(social['0']) || 0
				social_category['1'] = parseInt(social['1']) || 0
			})

			response.data.generals.forEach(general => {
				generals_count.value[general.type].count = parseInt(general.count) || 0
				generals_count.value[general.type]['-1'] = parseInt(general.negative) || 0
				generals_count.value[general.type]['0'] = parseInt(general.neutral) || 0
				generals_count.value[general.type]['1'] = parseInt(general.positive) || 0
			})

			countries.value = response.data.countries.reduce((prev,country) => {
				prev[country.id] = country
				return prev
			}, {})

			regions.value = response.data.regions.reduce((prev,region) => {
				prev[region.id] = region
				return prev
			}, {})

			console.log('countries', countries.value);
			console.log('regions', regions.value);

			smi_categories.value = response.data.smi_categories.reduce((prev,smi_cat) => {
				prev[smi_cat.id_cat] = smi_cat
				return prev
			}, {})
			console.log('smi_categories', smi_categories.value);

            r_type.value = (generals_count.value[1].count > 0) ? 1 : 2;
            
            if (firstLoad && r_type.value == 2) {
                console.log('Smi Empty');
            }
            else {
                setSentimentsCount()
            }

            firstLoad = false
		})
		.catch(error => {
			console.error(error);
			
			main_sentiments_count.value = {
				"-1": 0,
				0: 0,
				1: 0,
			}
		})
		.finally(() => {
			
			let temp_regions_file_name = '';
			if (isKazakstan.value) {
				temp_regions_file_name = countries.value[project.value.place_id]?.regions_file_name;
			}
			else {
				temp_regions_file_name = Object.keys(countries_with_regions.value)[0];
			}

			if (temp_regions_file_name) getCountryRegions(temp_regions_file_name)
		})
}

export function setSentimentsCount() {
	let temp_main_sentiments_count = {
		"-1": 0,
		0: 0,
		1: 0,
	}
	if (r_type.value == 1) {
		temp_main_sentiments_count["-1"] = generals_count.value[1]["-1"] ?? 0
		temp_main_sentiments_count["0"] = generals_count.value[1]["0"] ?? 0
		temp_main_sentiments_count["1"] = generals_count.value[1]["1"] ?? 0
	}
	else {
		let filtered_selected_socials = Object.keys(selected_social_categories.value)
			.filter(
				social => selected_social_categories.value[social]
			);
		if (filtered_selected_socials.length) {
			filtered_selected_socials.forEach(social => {
				temp_main_sentiments_count['-1'] += socials.value[social]['-1'] ?? 0
				temp_main_sentiments_count['0'] += socials.value[social]['0'] ?? 0
				temp_main_sentiments_count['1'] += socials.value[social]['1'] ?? 0
			})
		}
		else {
			temp_main_sentiments_count["-1"] = generals_count.value[2]["-1"] ?? 0
			temp_main_sentiments_count["0"] = generals_count.value[2]["0"] ?? 0
			temp_main_sentiments_count["1"] = generals_count.value[2]["1"] ?? 0
		}
	}
	main_sentiments_count.value = temp_main_sentiments_count

	getMainPlacesCount()
}

export function getMainPlacesCount(reset_all_anyway = true) {
	items_loading.value = true
	if (reset_all_anyway) reset_all_selected_data()
	let category_id = Object.keys(selected_social_categories.value).length ? (
		Object.keys(selected_social_categories.value).filter(soc_key => selected_social_categories.value[soc_key]).join(',')
	) : 0;
	let sentiments = Object.keys(selected_main_sentiments.value).filter(sentiment => selected_main_sentiments.value[sentiment]).join(',')
	axios
		.get(`/ru/analyticstats/get-project-places-count?p_id=${project.value.id}&r_type=${r_type.value}&category_id=${category_id}&sentiments=${sentiments}&s_date=${dateRange.value.startDate.format("Y-m-d")} ${s_time.value}&f_date=${dateRange.value.endDate.format("Y-m-d")} ${f_time.value}`)
		.then(response => {
			let map_world = {};
			let map_kz = {};

			countries_with_regions.value = {};

			languages_count.value[10].count = 0
			languages_count.value[4].count = 0
			languages_count.value[5].count = 0
			languages_count.value[3].count = 0

			response.data.forEach(place => {
				if (
					regions.value[place.region_id] &&
					(
						place.country_id == regions.value[place.region_id].country_id ||
						0 == regions.value[place.region_id].country_id
					)
				) {

					let temp_hc = regions.value[place.region_id].hc;

					if (0 == regions.value[place.region_id].country_id) temp_hc = countries.value[place.country_id]?.hc;

					if (place.region_id != 0) {
						countries_with_regions.value[place.country_id] = true;
					}

					map_kz[temp_hc] = {
						id: place.country_id + "_" + place.region_id,
						value: parseInt(place.count) || 0,
						resources: parseInt(place.resources) || 0,
						negative: parseInt(place.negative) || 0,
						neutral: parseInt(place.neutral) || 0,
						positive: parseInt(place.positive) || 0,

						ru: parseInt(place.ru) || 0,
						kz: parseInt(place.kz) || 0,
						en: parseInt(place.en) || 0,
						others: parseInt(place.others) || 0,

						"hc-key": temp_hc,
						"country": regions.value[place.region_id].name,
						"isRegion": true
					}
				}

				languages_count.value[10].count += parseInt(place.kz) || 0
				languages_count.value[4].count += parseInt(place.ru) || 0
				languages_count.value[5].count += parseInt(place.en) || 0
				languages_count.value[3].count += parseInt(place.others) || 0

				let country = countries.value[place.country_id] ?? countries.value[222]
				if (map_world[country.hc] && country) {
					map_world[country.hc].value += parseInt(place.count) || 0
					map_world[country.hc].resources += parseInt(place.resources) || 0
					map_world[country.hc].negative += parseInt(place.negative) || 0
					map_world[country.hc].neutral += parseInt(place.neutral) || 0
					map_world[country.hc].positive += parseInt(place.positive) || 0

					map_world[country.hc].kz += parseInt(place.kz) || 0
					map_world[country.hc].ru += parseInt(place.ru) || 0
					map_world[country.hc].en += parseInt(place.en) || 0
					map_world[country.hc].others += parseInt(place.others) || 0
				}
				else {
					map_world[country.hc] = {
						id: place.country_id,
						value: parseInt(place.count) || 0,
						resources: parseInt(place.resources) || 0,
						negative: parseInt(place.negative) || 0,
						neutral: parseInt(place.neutral) || 0,
						positive: parseInt(place.positive) || 0,

						ru: parseInt(place.ru) || 0,
						kz: parseInt(place.kz) || 0,
						en: parseInt(place.en) || 0,
						others: parseInt(place.others) || 0,

						"hc-key": country.hc,
						"country": country.name
					}
				}
			})

			languages_count.value[10].filled_count = languages_count.value[10].count
			languages_count.value[4].filled_count = languages_count.value[4].count
			languages_count.value[5].filled_count = languages_count.value[5].count
			languages_count.value[3].filled_count = languages_count.value[3].count

			places.value['countries'] = map_world;
			places.value['regions'] = map_kz;

			console.log('regions count is - ', map_kz);

			if (r_type.value == 1) {
				getMainSmiCategoriesAndLanguagesCount()
			}
			else {
				getResourceCount()
			}
		})
		.catch(error => {
			console.error(error);
		})
}

export function getMainSmiCategoriesAndLanguagesCount() {
	items_loading.value = true
	let countries = get_map_params.value.countries.join(',')
	let regions = get_map_params.value.regions.join(',')
	// let kz_country_index = get_map_params.value.countries.indexOf('57');
	// if (kz_country_index != -1 && get_map_params.value.regions.length) {
	//     delete get_map_params.value.countries[kz_country_index];
	//     countries = get_map_params.value.countries.join(',')
	// }
	let category_id = Object.keys(selected_social_categories.value).length ? (
		Object.keys(selected_social_categories.value).filter(soc_key => selected_social_categories.value[soc_key]).join(',')
	) : 0;
	let sentiments = Object.keys(selected_main_sentiments.value).filter(sentiment => selected_main_sentiments.value[sentiment]).join(',')
	axios
		.get(`/ru/analyticstats/get-project-lang-and-smi-categories-count?p_id=${project.value.id}&r_type=${r_type.value}&category_id=${category_id}&countries=${countries}&regions=${regions}&sentiments=${sentiments}&s_date=${dateRange.value.startDate.format("Y-m-d")} ${s_time.value}&f_date=${dateRange.value.endDate.format("Y-m-d")} ${f_time.value}`)
		.then(response => {
			let result = response.data.reduce((prev, item) => {
				let lang_key = item.lang != 10 && item.lang != 4 && item.lang != 5 ? 3 : item.lang;
				let temp_count = isNaN(parseInt(item.count)) ? 0 : parseInt(item.count) || 0;
				if (prev.languages[lang_key]) {
					if (prev.languages[lang_key][item.category_id]) {
						prev.languages[lang_key][item.category_id] += temp_count;
					}
					else {
						prev.languages[lang_key][item.category_id] = temp_count;
					}
				}
				else {
					prev.languages[lang_key] = {[item.category_id]: temp_count};
				}
				if (prev.categories[item.category_id]) {
					if (prev.categories[item.category_id][lang_key]) {
						prev.categories[item.category_id][lang_key] += temp_count;
					}
					else {
						prev.categories[item.category_id][lang_key] = temp_count;
					}
				}
				else {
					prev.categories[item.category_id] = {[lang_key]: temp_count};
				}
				return prev;
			}, {
				languages: {},
				categories: {},
			})
			languages_general_data.value = result.languages
			categories_general_data.value = result.categories

			smi_category.value = Object.keys(categories_general_data.value).map(cat_id => {
				return {
					id_cat: cat_id,
					name: smi_categories.value[cat_id]?.name_cat,
					y: Object.values(categories_general_data.value[cat_id]).reduce((a,b) => (a+b))
				}
			})

			smi_category.value.sort((a,b) => (b.y - a.y))

			console.log('smi_category', smi_category.value);

			// Object.keys(languages_general_data.value).forEach(lang_id => {
			//     languages_count.value[lang_id].filled_count = Object.values(languages_general_data.value[lang_id]).reduce((prev, count) => (prev + count), 0)
			// })

			getResourceCount()
		})
		.catch(error => {
			console.error(error);
		})
}

export function getResourceCount() {
	items_loading.value = true
	let countries = get_map_params.value.countries.join(',')
	let regions = get_map_params.value.regions.join(',')
	let category_id;
	if (r_type.value == 2) {
		category_id = Object.keys(selected_social_categories.value).length ? (
			Object.keys(selected_social_categories.value).filter(soc_key => selected_social_categories.value[soc_key]).join(',')
		) : 0;
	}
	else {
		category_id = get_selected_smi_categories(selected_categories.value).join(',');
	}
	let language = Object.keys(selected_languages.value).length ? (
		Object.keys(selected_languages.value).filter(lang_id => selected_languages.value[lang_id]).join(',')
	) : '';
	let sentiments = Object.keys(selected_main_sentiments.value).filter(sentiment => selected_main_sentiments.value[sentiment]).join(',')
	resource_count_loading.value = true
	axios
		.get(`/ru/analyticstats/get-project-resource-count?p_id=${project.value.id}&r_type=${r_type.value}&category_id=${category_id}&countries=${countries}&regions=${regions}&sentiments=${sentiments}&language=${language}&s_date=${dateRange.value.startDate.format("Y-m-d")} ${s_time.value}&f_date=${dateRange.value.endDate.format("Y-m-d")} ${f_time.value}`)
		.then(response => {
			resource_count.value = parseInt(response.data.resource_count) || 0
			resource_full_news_count.value = parseInt(response.data.resource_full_news_count) || 0
			column_news_count.value = parseInt(response.data.column_news_count) || 0
			resources.value = []
			selected_top_resources.value = 0
			start_top_resources.value = 0;
			max.value = end_top_resources.value = Math.round(resource_count.value / each_number.value);
			setTimeout(() => {
				let element = document.querySelector(".rs-range.pos-a-range.light_clip");
				if (element != undefined) element.value = end_top_resources.value;
				offsetLeft.value = offsetRight.value = 0;
			}, 100);

			getResourceData()
			getDynamicsData(true)
		})
		.catch(error => {
			console.error(error);
		})
}


export const getDynamicsData = () => {
	items_loading.value = true
	resource_count_loading.value = true
    let countries = get_map_params.value.countries.join(',')
    let regions = get_map_params.value.regions.join(',')
    let category_id;
    if (r_type.value == 2) {
        category_id = Object.keys(selected_social_categories.value).length ? (
            Object.keys(selected_social_categories.value).filter(soc_key => selected_social_categories.value[soc_key]).join(',')
        ) : 0;
    }
    else {
        category_id = get_selected_smi_categories(selected_categories.value).join(',');
    }
    let language = Object.keys(selected_languages.value).length ? (
        Object.keys(selected_languages.value).filter(lang_id => selected_languages.value[lang_id]).join(',')
    ) : '';
    let sentiments = Object.keys(selected_main_sentiments.value).filter(sentiment => selected_main_sentiments.value[sentiment]).join(',')

    let from = start_top_resources.value == 0 ? 0 : start_top_resources.value * each_number.value;

    let _resources = Object.keys(selected_resources.value.resources).length ? (
        Object.keys(selected_resources.value.resources).filter(lang_id => selected_resources.value.resources[lang_id]).join(',')
    ) : '';

    let specifying_sentiments = [1, 0, -1].map(sentiment => {
        let res_obj = selected_resource_sentiment.value.sentiment_resources[sentiment]
        let res_ids = Object.keys(res_obj).length ? (
            Object.keys(res_obj).filter(lang_id => res_obj[lang_id]).join(',')
        ) : '';

        let place_obj = bars_sentiments_selected.value.sentiment_places[sentiment]

        let countries = [];
        let regions_countries = [];
        let regions = [];

        Object.keys(place_obj).filter(place_id => place_obj[place_id]).forEach(place_id => {
            if (place_id.includes('_')) {
                regions.push(place_id.split('_')[1])
                regions_countries.push(place_id.split('_')[0])
            }
            else {
                countries.push(place_id)
            }
        })

        return `${sentiment}_${res_ids}_${regions.join(',')}_${[...countries, ...regions_countries].join(',')}`
    })

    specifying_sentiments = specifying_sentiments.join(';')

    axios
        .get(`/ru/analyticstats/get-project-dynamics-data?p_id=${project.value.id}&r_type=${r_type.value}&category_id=${category_id}&countries=${countries}&regions=${regions}&sentiments=${sentiments}&language=${language}&s_date=${dateRange.value.startDate.format("Y-m-d")} ${s_time.value}&f_date=${dateRange.value.endDate.format("Y-m-d")} ${f_time.value}&from=${from}&to=${end_clipped.value}&resource_length=${resource_count.value}&resources=${_resources}&specifying_sentiments=${specifying_sentiments}&date_mode=${selected_date_mode.value}`)
        .then(response => {
			console.log('thumbnail-dates', thumbnail_dates.value);

			let obj_dates = response.data.dates.reduce((prev, date) => ({ ...prev, [date.date]: date }), {})

			console.log('get-project-dynamics-data', response, obj_dates);

			dynamics.value = thumbnail_dates.value.map(date => {

				let temp_start_date = new Date(dateRange.value.startDate)

				if (date.date >= 1) {

					temp_start_date = new Date(temp_start_date.valueOf() + ((7*24*3600*1000) * date.date))

					let minus_days = temp_start_date.getDay()
			
					if (minus_days == 0) minus_days = 7

					if (minus_days != 1) {
						temp_start_date = temp_start_date.minus('date', minus_days - 1)
					}
				}

				return {
					y: parseInt((obj_dates[date] && obj_dates[date].y) ?? 0),
					'-1': parseInt((obj_dates[date] && obj_dates[date]['-1']) ?? 0),
					'0': parseInt((obj_dates[date] && obj_dates[date]['0']) ?? 0),
					'1': parseInt((obj_dates[date] && obj_dates[date]['1']) ?? 0),
					date: date,
					x: selected_date_mode.value == 'weekly'
						? temp_start_date.valueOf()
						: new Date(`${date}${selected_date_mode.value == 'hourly' ? ':00:00' : ''}`).valueOf(),
				};
			})
			console.log('dynamics', dynamics.value);
            // dynamics.value = response.data.dates.map(date => {

			// 	let temp_start_date = new Date(dateRange.value.startDate)

			// 	if (date.date >= 1) {

			// 		temp_start_date = new Date(temp_start_date.valueOf() + ((7*24*3600*1000) * date.date))

			// 		let minus_days = temp_start_date.getDay()
			
			// 		if (minus_days == 0) minus_days = 7

			// 		if (minus_days != 1) {
			// 			temp_start_date = temp_start_date.minus('date', minus_days - 1)
			// 		}
			// 	}

			// 	return {
			// 		y: parseInt(date.y),
			// 		'-1': parseInt(date['-1']),
			// 		'0': parseInt(date['0']),
			// 		'1': parseInt(date['1']),
			// 		date: date.date,
			// 		x: selected_date_mode.value == 'weekly'
			// 			? temp_start_date.valueOf()
			// 			: new Date(`${date.date}${selected_date_mode.value == 'hourly' ? ':00:00' : ''}`).valueOf(),
			// 	};
			// })

            resource_clipped_news_count.value = parseInt(response.data.resource_clipped_news_count);
			resource_count_loading.value = false
            getGeneralCount()
				.catch(error => {
					console.error(error);
				})
				.finally(() => {
					if (r_type.value == 2) {
						getSocialMetrics()
					}
				})

            if (selected_page.value == 1) {
                getItems()
            }
            else {
                selected_page.value = 1
            }
        })
        .catch(error => {
            console.error(error);
        })
};

export const getGeneralCount = () => {
    let countries = get_map_params.value.countries.join(',')
    let regions = get_map_params.value.regions.join(',')
    let category_id;
    if (r_type.value == 2) {
        category_id = Object.keys(selected_social_categories.value).length ? (
            Object.keys(selected_social_categories.value).filter(soc_key => selected_social_categories.value[soc_key]).join(',')
        ) : 0;
    }
    else {
        category_id = get_selected_smi_categories(selected_categories.value).join(',');
    }
    let language = Object.keys(selected_languages.value).length ? (
        Object.keys(selected_languages.value).filter(lang_id => selected_languages.value[lang_id]).join(',')
    ) : '';
    let sentiments = Object.keys(selected_main_sentiments.value).filter(sentiment => selected_main_sentiments.value[sentiment]).join(',')

    let from = start_top_resources.value == 0 ? 0 : start_top_resources.value * each_number.value;

    let _resources = Object.keys(selected_resources.value.resources).length ? (
        Object.keys(selected_resources.value.resources).filter(lang_id => selected_resources.value.resources[lang_id]).join(',')
    ) : '';

    let specifying_sentiments = [1, 0, -1].map(sentiment => {
        let res_obj = selected_resource_sentiment.value.sentiment_resources[sentiment]
        let res_ids = Object.keys(res_obj).length ? (
            Object.keys(res_obj).filter(lang_id => res_obj[lang_id]).join(',')
        ) : '';

        let place_obj = bars_sentiments_selected.value.sentiment_places[sentiment]

        let countries = [];
        let regions_countries = [];
        let regions = [];

        Object.keys(place_obj).filter(place_id => place_obj[place_id]).forEach(place_id => {
            if (place_id.includes('_')) {
                regions.push(place_id.split('_')[1])
                regions_countries.push(place_id.split('_')[0])
            }
            else {
                countries.push(place_id)
            }
        })

        return `${sentiment}_${res_ids}_${regions.join(',')}_${[...countries, ...regions_countries].join(',')}`
    })

    specifying_sentiments = specifying_sentiments.join(';')

    selected_dates_query.value
    let temp_sentiment_dates_query = [
        selected_main_sentiments.value['1'] ? selected_sentiment_dates_query.value['1'] : '',
        selected_main_sentiments.value['0'] ? selected_sentiment_dates_query.value['0'] : '',
        selected_main_sentiments.value['-1'] ? selected_sentiment_dates_query.value['-1'] : '',
    ].join('_');

    return axios
        .get(`/ru/analyticstats/get-project-general-count?p_id=${project.value.id}&r_type=${r_type.value}&category_id=${category_id}&countries=${countries}&regions=${regions}&sentiments=${sentiments}&language=${language}&s_date=${dateRange.value.startDate.format("Y-m-d")} ${s_time.value}&f_date=${dateRange.value.endDate.format("Y-m-d")} ${f_time.value}&from=${from}&to=${end_clipped.value}&resource_length=${resource_count.value}&resources=${_resources}&specifying_sentiments=${specifying_sentiments}&date_mode=${selected_date_mode.value}&dates_filter=${selected_dates_query.value}&sentiment_dates_filter=${temp_sentiment_dates_query}&from_page=${(selected_page.value - 1) * 20}&grouped=${isGrouped.value}`)
        .then(response => {

			console.log('getGeneralCount - ', response);
			if (isGrouped.value) {
				similars_count.value = parseInt(response.data.similars_count)
			}
			else {
				similars_count.value = false;
			}
            news_count.value = parseInt(response.data.news_count)
			check_full_news_count(news_count.value)
            resources_count.value = parseInt(response.data.resources_count)
        })
};

watch(enable_metrics, (newValue) => {
	if (!newValue) {
		soc_metrics.value = {
			likes: 0,
			comments: 0,
			reposts: 0,
			members: 0,
		}
	}
	else {
		getSocialMetrics()
	}
})
watch(isGrouped, () => {
            
	getGeneralCount()
		.catch(error => {
			console.error(error);
		})
		.finally(() => {
			if (r_type.value == 2) {
				getSocialMetrics()
			}
		})

	if (selected_page.value == 1) {
		getItems()
	}
	else {
		selected_page.value = 1
	}
})

export function check_full_news_count(full_news_count) {
	full_news_count = parseInt(full_news_count) ?? 0;
	is_high_news_count.value = full_news_count > 1_500_000

	if (enable_metrics.value == 'active_metrics') return ;

	if (is_high_news_count.value) {
		enable_metrics.value = false
	}
	else {
		enable_metrics.value = true
	}
}

export const getSocialMetrics = () => {

	if (!enable_metrics.value) return;

	let countries = get_map_params.value.countries.join(',')
    let regions = get_map_params.value.regions.join(',')
    let category_id;
    if (r_type.value == 2) {
        category_id = Object.keys(selected_social_categories.value).length ? (
            Object.keys(selected_social_categories.value).filter(soc_key => selected_social_categories.value[soc_key]).join(',')
        ) : 0;
    }
    else {
        category_id = get_selected_smi_categories(selected_categories.value).join(',');
    }
    let language = Object.keys(selected_languages.value).length ? (
        Object.keys(selected_languages.value).filter(lang_id => selected_languages.value[lang_id]).join(',')
    ) : '';
    let sentiments = Object.keys(selected_main_sentiments.value).filter(sentiment => selected_main_sentiments.value[sentiment]).join(',')

    let from = start_top_resources.value == 0 ? 0 : start_top_resources.value * each_number.value;

    let _resources = Object.keys(selected_resources.value.resources).length ? (
        Object.keys(selected_resources.value.resources).filter(lang_id => selected_resources.value.resources[lang_id]).join(',')
    ) : '';

    let specifying_sentiments = [1, 0, -1].map(sentiment => {
        let res_obj = selected_resource_sentiment.value.sentiment_resources[sentiment]
        let res_ids = Object.keys(res_obj).length ? (
            Object.keys(res_obj).filter(lang_id => res_obj[lang_id]).join(',')
        ) : '';

        let place_obj = bars_sentiments_selected.value.sentiment_places[sentiment]

        let countries = [];
        let regions_countries = [];
        let regions = [];

        Object.keys(place_obj).filter(place_id => place_obj[place_id]).forEach(place_id => {
            if (place_id.includes('_')) {
                regions.push(place_id.split('_')[1])
                regions_countries.push(place_id.split('_')[0])
            }
            else {
                countries.push(place_id)
            }
        })

        return `${sentiment}_${res_ids}_${regions.join(',')}_${[...countries, ...regions_countries].join(',')}`
    })

    specifying_sentiments = specifying_sentiments.join(';')

    selected_dates_query.value
    let temp_sentiment_dates_query = [
        selected_main_sentiments.value['1'] ? selected_sentiment_dates_query.value['1'] : '',
        selected_main_sentiments.value['0'] ? selected_sentiment_dates_query.value['0'] : '',
        selected_main_sentiments.value['-1'] ? selected_sentiment_dates_query.value['-1'] : '',
    ].join('_');

	laoding_metrics.value = true

	soc_metrics.value = {
		likes: 'loading',
		comments: 'loading',
		reposts: 'loading',
		members: 'loading',
	}

	axios
		.get(`/ru/analyticstats/get-project-metrics-data?p_id=${project.value.id}&r_type=${r_type.value}&category_id=${category_id}&countries=${countries}&regions=${regions}&sentiments=${sentiments}&language=${language}&s_date=${dateRange.value.startDate.format("Y-m-d")} ${s_time.value}&f_date=${dateRange.value.endDate.format("Y-m-d")} ${f_time.value}&from=${from}&to=${end_clipped.value}&resource_length=${resource_count.value}&resources=${_resources}&specifying_sentiments=${specifying_sentiments}&date_mode=${selected_date_mode.value}&dates_filter=${selected_dates_query.value}&sentiment_dates_filter=${temp_sentiment_dates_query}&grouped=${isGrouped.value}`)
		.then(response => {
			soc_metrics.value = response.data.metrics
			laoding_metrics.value = false
		})
		.catch(error => {
			console.error(error);
		})

};

export const getItems = () => {
    let countries = get_map_params.value.countries.join(',')
    let regions = get_map_params.value.regions.join(',')
    let category_id;
    if (r_type.value == 2) {
        category_id = Object.keys(selected_social_categories.value).length ? (
            Object.keys(selected_social_categories.value).filter(soc_key => selected_social_categories.value[soc_key]).join(',')
        ) : 0;
    }
    else {
        category_id = get_selected_smi_categories(selected_categories.value).join(',');
    }
    let language = Object.keys(selected_languages.value).length ? (
        Object.keys(selected_languages.value).filter(lang_id => selected_languages.value[lang_id]).join(',')
    ) : '';
    let sentiments = Object.keys(selected_main_sentiments.value).filter(sentiment => selected_main_sentiments.value[sentiment]).join(',')

    let from = start_top_resources.value == 0 ? 0 : start_top_resources.value * each_number.value;

    let _resources = Object.keys(selected_resources.value.resources).length ? (
        Object.keys(selected_resources.value.resources).filter(lang_id => selected_resources.value.resources[lang_id]).join(',')
    ) : '';

    let specifying_sentiments = [1, 0, -1].map(sentiment => {
        let res_obj = selected_resource_sentiment.value.sentiment_resources[sentiment]
        let res_ids = Object.keys(res_obj).length ? (
            Object.keys(res_obj).filter(lang_id => res_obj[lang_id]).join(',')
        ) : '';

        let place_obj = bars_sentiments_selected.value.sentiment_places[sentiment]

        let countries = [];
        let regions_countries = [];
        let regions = [];

        Object.keys(place_obj).filter(place_id => place_obj[place_id]).forEach(place_id => {
            if (place_id.includes('_')) {
                regions.push(place_id.split('_')[1])
                regions_countries.push(place_id.split('_')[0])
            }
            else {
                countries.push(place_id)
            }
        })

        return `${sentiment}_${res_ids}_${regions.join(',')}_${[...countries, ...regions_countries].join(',')}`
    })

    specifying_sentiments = specifying_sentiments.join(';')

    selected_dates_query.value
    let temp_sentiment_dates_query = [
        selected_main_sentiments.value['1'] ? selected_sentiment_dates_query.value['1'] : '',
        selected_main_sentiments.value['0'] ? selected_sentiment_dates_query.value['0'] : '',
        selected_main_sentiments.value['-1'] ? selected_sentiment_dates_query.value['-1'] : '',
    ].join('_');


	items_loading.value = true

    axios
        .get(`/ru/analyticstats/get-project-items?p_id=${project.value.id}&r_type=${r_type.value}&category_id=${category_id}&countries=${countries}&regions=${regions}&sentiments=${sentiments}&language=${language}&s_date=${dateRange.value.startDate.format("Y-m-d")} ${s_time.value}&f_date=${dateRange.value.endDate.format("Y-m-d")} ${f_time.value}&from=${from}&to=${end_clipped.value}&resource_length=${resource_count.value}&resources=${_resources}&specifying_sentiments=${specifying_sentiments}&date_mode=${selected_date_mode.value}&dates_filter=${selected_dates_query.value}&sentiment_dates_filter=${temp_sentiment_dates_query}&metrics=${selected_soc_metrics.value}&from_page=${(selected_page.value - 1) * 20}&grouped=${isGrouped.value}`)
        .then(response => {
            console.log('get-project-items', response);
            let obj_similar_items = response?.data?.similar_items?.reduce((prev, item) => ({ ...prev, [item.item_id]: item }), {})
            let obj_items_items = response?.data?.items?.reduce((prev, item) => ({ ...prev, [item.news_id]: item }), {})
            let obj_items_metrics = response?.data?.metrics?.metrics?.reduce((prev, item) => ({ ...prev, [item.news_id]: item }), {})
            let obj_items_members = response?.data?.metrics?.members?.reduce((prev, item) => ({ ...prev, [item.id]: item }), {})
			let obj_item_folders = response?.data?.folders?.reduce((prev, item_folder) => ({ ...prev, [item_folder.item_id]: prev[item_folder.item_id] ? [
				...prev[item_folder.item_id],
				{
					id: item_folder.folder_id,
					name: item_folder.name
				}
			] : (
				[{
					id: item_folder.folder_id,
					name: item_folder.name
				}]
			) }), {})
            let temp_items = response?.data?.params?.filter(item => (item?.item_id?.length))?.map(item => ({
				likes: 0,
				comments: 0,
				reposts: 0,
				members: 0,
				...item,
				...obj_items_items[item.item_id],
				...obj_similar_items[item.item_id],
				...obj_items_metrics[item.item_id],
				...obj_items_members[item.res_id],
				folders: obj_item_folders[item.item_id] ?? [],
			}))
			// if (selected_soc_metrics.value.length) {
			// 	temp_items?.sort((a,b) => (b[selected_soc_metrics.value] - a[selected_soc_metrics.value]))
			// }
			// else {
			// 	temp_items?.sort((a,b) => (new Date(b.date).valueOf() - new Date(a.date).valueOf()))
			// }
			items.value = temp_items

			console.log('items', items.value);
        })
        .catch(error => {
            console.error(error);
        })
        .finally(() => {
			reset_all.value = items_loading.value = false

			const item_ids = items.value.map(item => item.item_id).join(',');

			if (item_ids) getGptLogs(item_ids)
        })
};

export const getGptLogs = (item_ids = items.value?.map(item => item?.item_id)?.join(','), items_array = items.value) => {
	
	axios
		.get(`/ru/gpt-service/get-logs?news_type=${r_type.value}&news_id=${item_ids}`)
		.then(response => {
			console.log('gpt-service-logs', response);
			items_array.forEach(item => {
				item.logs = {}
			})

			if (response?.data?.length) {
				let logs = response?.data?.reduce((prev, log) => ({ ...prev, [log.news_id]: prev[log.news_id] == undefined ? [log] : [...prev[log.news_id], log] }), {})
				
				items_array.forEach(item => {
					item.logs = logs[item.item_id]
						? logs[item.item_id].reduce((prev, log) => ({...prev, [log.promt]: log}), {})
						: {}
				})
			}
        })
        .catch(error => {
			items_array.forEach(item => {
				item.logs = null
			})
            console.error(error);
        })
        .finally(() => {
			reset_all.value = false
        })
};



export const getSimilarItems = (item_id) => {
	
	similar_items_loading.value = true;

	if (!item_id) return;

    axios
        .get(`/ru/similar-items/get-items?project_id=${project.value.id}&r_type=${r_type.value}&item_id=${item_id}`)
        .then(response => {
            console.log('similar-items/get-items', response);
            let obj_items_items = response?.data?.items?.reduce((prev, item) => ({ ...prev, [item.news_id]: item }), {})
            let obj_items_metrics = response?.data?.metrics?.metrics?.reduce((prev, item) => ({ ...prev, [item.news_id]: item }), {})
            let obj_items_members = response?.data?.metrics?.members?.reduce((prev, item) => ({ ...prev, [item.id]: item }), {})
			let obj_item_folders = response?.data?.folders?.reduce((prev, item_folder) => ({ ...prev, [item_folder.item_id]: prev[item_folder.item_id] ? [
				...prev[item_folder.item_id],
				{
					id: item_folder.folder_id,
					name: item_folder.name
				}
			] : (
				[{
					id: item_folder.folder_id,
					name: item_folder.name
				}]
			) }), {})
            let temp_similar_items = response?.data?.params?.filter(item => (item?.item_id?.length))?.map(item => ({
				likes: 0,
				comments: 0,
				reposts: 0,
				members: 0,
				...item,
				...obj_items_items[item.item_id],
				...obj_items_metrics[item.item_id],
				...obj_items_members[item.res_id],
				folders: obj_item_folders[item.item_id] ?? [],
			}))
			// if (selected_soc_metrics.value.length) {
			// 	temp_items?.sort((a,b) => (b[selected_soc_metrics.value] - a[selected_soc_metrics.value]))
			// }
			// else {
			// 	temp_items?.sort((a,b) => (new Date(b.date).valueOf() - new Date(a.date).valueOf()))
			// }
			similar_items.value = temp_similar_items

			console.log('similar_items', similar_items.value);
        })
        .catch(error => {
            console.error(error);
        })
        .finally(() => {
			similar_items_loading.value = false;

			const item_ids = similar_items.value.map(item => item.item_id).join(',');

			if (item_ids) getGptLogs(item_ids, similar_items.value)
        })
};
