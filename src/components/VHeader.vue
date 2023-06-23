<template>
    <div class="flex select-none media-header-1439">
        <div class="flex w-half m-r-15 media-header-item-1439 media-header-margin-1439 media-header-top-875">
            <div class="r_type m-r-2" :class="{
                selected: r_type == 1
            }" @click="r_type = 1;selected_social_categories = {}">
                <i class="fa fa-newspaper-o block"></i>
                <div>{{ generals_count['1'].count.push_space() }}</div>
            </div>
            <div class="r_type m-r-10" :class="{
                selected: r_type == 2
            }" @click="r_type = 2">
                <i class="fa fa-comments block"></i>
                <div>{{ generals_count['2'].count.push_space() }}</div>
            </div>

            <div class="social_category" v-for="social_category in social_categories" :key="social_category.id" :class="{
                selected: selected_social_categories[social_category.id],
                'ml-auto': social_category.id == 2,
                ' m-r-2': social_category.id != 9
            }" @click="select_social_category($event, social_category.id)">
                <i :class="`fa fa-${social_category.icon} block`"></i>
                <div>{{ social_category.count.push_space() }}</div>
            </div>
        </div>

        <div class="w-half flex items-center justify-between media-header-item-1439 media-header-bottom-875">
            <div class="sentiments flex">
                <div class="negative transition-all duration-200" :title="`${i18n('Негативные')}: ${main_sentiments_count['-1'].push_space()}`" :class="{
                    off: !selected_main_sentiments['-1']
                }" @click="select_main_sentiment($event, '-1')">
                    <i style="margin-right: 5px;font-size: 15.5px;" class="fa-solid fa-face-angry"></i>
                    <!-- Негатив:  -->
                    {{ main_sentiments_count['-1'].push_space() }}
                </div>
                <div class="neutral transition-all duration-200" :title="`${i18n('Нейтральные')}: ${main_sentiments_count['0'].push_space()}`" :class="{
                    off: !selected_main_sentiments['0']
                }" @click="select_main_sentiment($event, '0')">
                    <i style="margin-right: 5px;font-size: 15.5px;" class="fa-solid fa-face-meh"></i>
                    <!-- Нейтрал:  -->
                    {{ main_sentiments_count['0'].push_space() }}
                </div>
                <div class="positive transition-all duration-200" :title="`${i18n('Позитивные')}: ${main_sentiments_count['1'].push_space()}`" :class="{
                    off: !selected_main_sentiments['1']
                }" @click="select_main_sentiment($event, '1')">
                    <i style="margin-right: 5px;font-size: 15.5px;" class="fa-solid fa-face-smile"></i>
                    <!-- Позитив:  -->
                    {{ main_sentiments_count['1'].push_space() }}
                </div>
            </div>
            
            <span style="
                position: relative;
                ">
                <span @click="modal = !modal" style="
                    background: rgb(59, 89, 152);
                    color: rgb(255, 255, 255);
                    font-size: 13px;
                    display: flex;
                    align-items: center;
                    height: 23.5px;
                    padding: 0 5px;
                    border-radius: 3.5px;
                    user-select: none;
                    cursor: pointer;">
                    <i class="fa fa-calendar" style="margin: 0 7px 0 2.4px;"></i>
                    {{ dateRange.startDate.format("d.m.Y") }} - {{ dateRange.endDate.format("d.m.Y") }}
                </span>
                <date-range-picker :modal="modal" v-show="modal"></date-range-picker>
            </span>
            <div class="flex items-center export">
                <div class="export-text">
                    <div class="p-b-1" @click="filter_modal = !filter_modal">
                        {{ i18n('Экспорт') }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
// import axios from 'axios'
import i18n from "@/response/utils/i18n"
import DateRangePicker from '@/components/UI/DateRangePicker';
import { modal } from '@/data'
import { places, selected_regions, selected_categories, selected_languages, resources, resource_names, resource_count, resource_clipped_news_count, resource_full_news_count, column_news_count, selected_social_categories, dynamics, offsetLeft, offsetRight, selected_resources, selected_resource_sentiment, bars_sentiments_selected, selected_date_mode, dateRange, reset_all, get_selected_smi_categories } from "@/response/data/index"
import { r_type, project, languages_count, languages_general_data, categories_general_data, smi_category, smi_categories, selected_main_sentiments, socials, countries, regions, social_categories, generals_count, main_sentiments_count } from "@/response/header"
import { getProjectCounts, getMainPlacesCount, getDynamicsData, setSentimentsCount, getMainSmiCategoriesAndLanguagesCount, getResourceCount } from "@/response/api"
import { get_map_params, map_type_switcher } from "@/response/options/mapOptions"
import { selected_top_resources, each_number, start_top_resources, end_top_resources, max, getResourceData } from "@/response/options/columnOptions"
// import { main_watcher, main_watcher_updates } from "@/response/data/watchers"

export default {
    components: {
        DateRangePicker,
    },
    setup() {
        return { i18n, get_selected_smi_categories, getProjectCounts, getMainPlacesCount, getDynamicsData, setSentimentsCount, getMainSmiCategoriesAndLanguagesCount, getResourceCount, selected_top_resources, each_number, places, map_type_switcher, start_top_resources, end_top_resources, max, selected_regions, selected_categories, selected_languages, resources, getResourceData, resource_names, resource_count, resource_clipped_news_count, resource_full_news_count, column_news_count, selected_social_categories, social_categories, generals_count, main_sentiments_count, dynamics, offsetLeft, offsetRight, selected_resources, selected_resource_sentiment, bars_sentiments_selected, selected_date_mode, dateRange, modal, reset_all, r_type, project, languages_count, get_map_params, languages_general_data, categories_general_data, smi_category, smi_categories, selected_main_sentiments, socials, countries, regions }
    },
    data() {
        return {
            filter_modal: false,
        }
    },
    methods: {
        img_url(name) {
            let images = require.context('@/assets/', false, /\.png$/)
            return images('./' + name + ".png")
        },
        select_social_category(event, id) {
            this.r_type = 2;
            if (event.shiftKey) {
                this.selected_social_categories[id] = !this.selected_social_categories[id];
            }
            else {
                let social_category_ids = Object.keys(this.selected_social_categories).filter(soc_cat_id => this.selected_social_categories[soc_cat_id])
                this.selected_social_categories = {};

                if (social_category_ids.length == 1 && social_category_ids[0] == id) {
                    this.selected_social_categories[id] = !this.selected_social_categories[id];
                }

                this.selected_social_categories[id] = !this.selected_social_categories[id];
            }
        },
        select_main_sentiment(event, id) {
            this.selected_main_sentiments[id] = !this.selected_main_sentiments[id];
            if (Object.values(this.selected_main_sentiments).find(sentiment => (sentiment)) === undefined) {
                this.selected_main_sentiments['-1'] = true
                this.selected_main_sentiments['0'] = true
                this.selected_main_sentiments['1'] = true
            }
            if (event.ctrlKey) {
                this.selected_main_sentiments['-1'] = false
                this.selected_main_sentiments['0'] = false
                this.selected_main_sentiments['1'] = false
                this.selected_main_sentiments[id] = true
            }   

            // this.main_watcher = true
            this.getMainPlacesCount(false)
        },
    },
    watch: {
        selected_date_mode() {

            console.log('watching - selected_date_mode');

            this.getDynamicsData()
        },
        'bars_sentiments_selected.sentiment_places': {
            handler(newValue, oldValue) {
                console.log('bars_sentiments_selected', newValue);
                if (JSON.stringify(newValue) === JSON.stringify(oldValue)) return
                if (this.reset_all == false) {

                    console.log('watching - bars_sentiments_selected');
                    this.getDynamicsData()
                }
            },
            deep: true
        },
        'selected_resource_sentiment.sentiment_resources': {
            handler(newValue, oldValue) {
                if (JSON.stringify(newValue) === JSON.stringify(oldValue)) return
                if (this.reset_all == false)  {
                    console.log('watching - selected_resource_sentiment');
                    this.getDynamicsData()
                }
            },
            deep: true
        },
        'selected_resources.resources': {
            handler(newValue, oldValue) {
                if (JSON.stringify(newValue) === JSON.stringify(oldValue)) return
                if (this.reset_all == false) {
                    console.log('watching - selected_resources');
                    this.getDynamicsData()
                }
            },
            deep: true
        },
        selected_social_categories: {
            handler() {
                console.log('watching - selected_social_categories');
                this.setSentimentsCount()
            },
            deep: true
        },
        // selected_top_resources(newValue, oldValue) {
        //     if (newValue == 0) return;
        //     if (
        //         (this.resources.length - 20) <= (newValue * this.each_number) &&
        //         !((this.resources.length - 20) <= (oldValue * this.each_number)) &&
        //         this.resources.length < this.resource_count
        //     ) {
        //         console.log(this.resources.length, this.resource_count);
        //         this.getResourceData()
        //     }
        // },
        r_type() {
            console.log('watching - r_type');
            this.setSentimentsCount()
        },
        selected_regions: {
            handler() { // updated_other_data
                if (this.reset_all) return
                console.log('watching - selected_regions');
                if (this.r_type == 1) {
                    this.getMainSmiCategoriesAndLanguagesCount()
                }
                else {
                    this.getResourceCount()
                }
                let countries = this.get_map_params.countries
                let regions = this.get_map_params.regions
                if (countries.length == 0 && regions.length == 0) {
                    this.languages_count[10].filled_count = this.languages_count[10].count;
                    this.languages_count[4].filled_count = this.languages_count[4].count;
                    this.languages_count[5].filled_count = this.languages_count[5].count;
                    this.languages_count[3].filled_count = this.languages_count[3].count;
                    return;
                }

                this.languages_count[10].filled_count = 0;
                this.languages_count[4].filled_count = 0;
                this.languages_count[5].filled_count = 0;
                this.languages_count[3].filled_count = 0;

                countries.forEach(country_id => {
                    let country = this.places['countries'][this.countries[country_id].hc];
                    this.languages_count[10].filled_count += country?.kz || 0;
                    this.languages_count[4].filled_count += country?.ru || 0;
                    this.languages_count[5].filled_count += country?.en || 0;
                    this.languages_count[3].filled_count += country?.others || 0;
                })

                regions.forEach(region_id => {
                    let region = this.places['regions'][this.regions[region_id].hc];
                    this.languages_count[10].filled_count += region?.kz || 0;
                    this.languages_count[4].filled_count += region?.ru || 0;
                    this.languages_count[5].filled_count += region?.en || 0;
                    this.languages_count[3].filled_count += region?.others || 0;
                })
            },
            deep: true
        },
        selected_categories: {
            handler(newValue, oldValue) {
                if (this.reset_all) return
                let category_id = 0;

                category_id = get_selected_smi_categories(newValue).join(',');

                if (category_id === get_selected_smi_categories(oldValue).join(',')) return;

                console.log('watching - selected_SMI_categories');

                this.getResourceCount()
            },
            deep: true
        },
        selected_languages: {
            handler() {
                if (this.reset_all) return

                console.log('watching - selected_Languages');

                this.getResourceCount()
            },
            deep: true
        },
        //dateRange: {
        //    handler() {
        //        this.getProjectCounts()
        //    },
        //    deep: true
        //},
    },
    created() {
        console.log('created - and do = getProjectCounts');
        this.getProjectCounts()
    }
}
</script>

<style scoped>

.m-r-2 {
    margin-right: 2px;
}

</style>
