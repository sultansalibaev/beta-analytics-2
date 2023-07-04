<template>
    <div class="flex media-header-1439">
        <div class="flex map w-half m-r-15 media-header-item-1439 media-header-margin-1439 media-metrics-885_769" style="height: 312px;">
            <div
                class="bg-white p-9-10 m-r-15 tool-shadow media-lang-margin-885_769"
                style="min-width: 240px; width: 70%"
            >
                <div class="flex justify-between items-center title">
                    <span>{{ i18n('Язык публикаций') }}</span>
                    <i
                        class="fa fa-refresh cursor-pointer"
                        @click="reset_languages"
                        v-if="has_selected_languages"
                    ></i>
                </div>
                <div class="flex map_container" style="height: calc(100% - 24px - 18px);align-items: center;">
                    <div class="flex w-full flex-col" style="margin: auto 0">
                        <div
                            class="language flex items-center cursor-pointer"
                            :class="{
                                active: selected_languages[language.id],
                            }"
                            :style="{
                                outlineColor: has_selected_languages && !selected_languages[language.id] ? '#ccc' : ''
                            }"
                            v-for="language in get_languages"
                            :key="language.name"
                            @click="select_language($event, language.id)"
                        >
                            <!--<div class="language-fill">
                                <div
                                    class="language-fill_color"
                                    :style="{
                                        width:
                                            (languages_count[language.id]
                                                .filled_count /
                                                (lang
                                                    ? languages_count[
                                                          language.id
                                                      ].count
                                                    : max_lang_filtered_count)) *
                                                100 +
                                            '%',
                                        background: has_selected_languages && !selected_languages[language.id] ? '#ccc' : ''
                                    }"
                                ></div>
                            </div>-->
                            <div
                                class="language-filled"
                                v-show="lang"
                                :style="{
                                    width:
                                        (languages_count[language.id]
                                            .filled_count /
                                            (lang
                                                ? languages_count[language.id]
                                                      .count
                                                : max_lang_filtered_count)) *
                                            100 +
                                        '%',
                                }"
                            >
                                <div
                                    class="filled_news_count"
                                    :style="{
                                        minWidth: text(
                                            languages_count[
                                                language.id
                                            ].filled_count.push_space(),
                                            12
                                        ),
                                        background:
                                            'url(/img/static/caret-down.png) center / 20px 20px no-repeat',
                                    }"
                                >
                                    <span class="filled_news_count_value">{{
                                        languages_count[
                                            language.id
                                        ].filled_count.push_space()
                                    }}</span>
                                </div>
                            </div>
                            <div class="flex items-center">
                                <img
                                    :src="imgUrl(language.img)"
                                    :width="language.img_width"
                                    style="margin-right: 5px"
                                    :style="{
                                        marginLeft:
                                            language.img == 'other'
                                                ? '2.5px'
                                                : 0,
                                    }"
                                />
                                {{ i18n(language.name) }}
                            </div>
                            <div class="language-news_count">
                                <span class="lang-news">
                                    {{
                                        lang
                                            ? languages_count[
                                                  language.id
                                              ].count.push_space()
                                            : languages_count[
                                                  language.id
                                              ].filled_count.push_space()
                                    }}
                                </span>
                                <!-- <span class="lang-percent">{{ language.percent }}%</span> -->
                            </div>
                        </div>
                        <!--<div class="switcher mx-auto" style="width: 176px">
                            <div
                                @click="lang = !lang"
                                :class="{
                                    active: lang,
                                }"
                                class="w-full flex justify-center prompt-parent"
                            >
                                <div class="prompt">• от общего количества публикаций по языку</div>
                                обший
                            </div>
                            <div
                                @click="lang = !lang"
                                :class="{
                                    active: !lang,
                                }"
                                class="w-full flex justify-center prompt-parent"
                            >
                                <div class="prompt">• для сравнения между языками от максимального числа публикаций</div>
                                обычный
                            </div>
                        </div>-->
                    </div>
                </div>
            </div>
            <div class="bg-white w-full overflow-hidden tool-shadow">
                <div
                    class="flex justify-between items-center title p-9-10"
                    style="padding-bottom: 0"
                >
                    <span>{{
                        r_type == 1
                            ? i18n("Категория источника") // Категория новостей СМИ
                            : i18n("Метрики соцсетей")
                    }}</span>

                    <i
                        class="fa fa-refresh cursor-pointer"
                        @click="reset_categories"
                        v-if="has_selected_categories && r_type == 1"
                    ></i>

                    <label class="toggle" v-show="r_type == 2 && is_high_news_count">
                        <input
                            class="toggle-checkbox"
                            type="checkbox"
                            :checked="!!enable_metrics"
                            @change="enable_metrics = !enable_metrics ? 'active_metrics' : false"
                        />
                        <div class="toggle-switch"></div>
                    </label>
                </div>
                <div
                    class="flex map_container"
                    style="padding-right: 0; padding-left: 0;"
                    :class="{
                        'p-9-10': true,
                        'flex-wrap': true,
                    }"
                    :style="r_type == 1 ? 'padding-bottom: 0px;height: calc(100% - 24px - 18px - 50px);align-items: center;' : ''"
                >
                    <keep-alive v-if="r_type == 1">
                        <component :is="'PieChart'" />
                    </keep-alive>
                    <template v-else>
                        <div class="flex w-full m-b-10 p-x-14">
                            <div
                                :class="{
                                    active: selected_soc_metrics == 'likes',
                                    disabled: !Boolean(enable_metrics),
                                }"
                                class="metric m-r-10"
                                :title="soc_metrics.likes.push_space()"
                            >
                                <i class="fa fa-thumbs-o-up fa-4x metric-icon"></i>
                                <!-- <i class="fa fa-heart fa-4x metric-icon"></i> -->
                                <div class="metric-description">
                                    <span class="metric-count">
                                        <i class="fa-solid fa-spinner" v-if="soc_metrics.likes == 'loading'"></i>
                                        <template v-else>{{ soc_metrics.likes.short() }}</template>
                                    </span>
                                    <span class="metric-name">{{ i18n('Лайки') }}</span>
                                </div>
                            </div>
                            <div
                                :class="{
                                    active: selected_soc_metrics == 'comments',
                                    disabled: !Boolean(enable_metrics),
                                }"
                                class="metric"
                                :title="soc_metrics.comments.push_space()"
                            >
                                <i class="fa fa-comments fa-4x metric-icon"></i>
                                <div class="metric-description">
                                    <span class="metric-count">
                                        <i class="fa-solid fa-spinner" v-if="soc_metrics.comments == 'loading'"></i>
                                        <template v-else>{{ soc_metrics.comments.short() }}</template>
                                    </span>
                                    <span class="metric-name">{{ i18n('Комментарии') }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="flex w-full p-x-14">
                            <div
                                :class="{
                                    active: selected_soc_metrics == 'reposts',
                                    disabled: !Boolean(enable_metrics),
                                }"
                                class="metric m-r-10"
                                :title="soc_metrics.reposts.push_space()"
                            >
                                <i class="fa fa-share fa-4x metric-icon"></i>
                                <div class="metric-description">
                                    <span class="metric-count">
                                        <i class="fa-solid fa-spinner" v-if="soc_metrics.reposts == 'loading'"></i>
                                        <template v-else>{{ soc_metrics.reposts.short() }}</template>
                                    </span>
                                    <span class="metric-name">{{ i18n('Репосты') }}</span>
                                </div>
                            </div>
                            <div
                                :class="{
                                    active: selected_soc_metrics == 'members',
                                    disabled: !Boolean(enable_metrics),
                                }"
                                class="metric"
                                :title="soc_metrics.members.push_space()"
                            >
                                <i class="fa fa-users fa-4x metric-icon"></i>
                                <div class="metric-description">
                                    <span class="metric-count">
                                        <i class="fa-solid fa-spinner" v-if="soc_metrics.members == 'loading'"></i>
                                        <template v-else>{{ soc_metrics.members.short() }}</template>
                                    </span>
                                    <span class="metric-name">{{ i18n('Подписчики') }}</span>
                                </div>
                            </div>
                        </div>
                    </template>
                </div>
                <div class="flex please_wait_metrics" :class="{
                    'opacity-0': r_type == 1 || (!Boolean(enable_metrics) || !is_high_news_count || is_high_news_count && !laoding_metrics) && !(is_high_news_count && !enable_metrics)
                }">
                    <template v-if="is_high_news_count && !enable_metrics">
                        {{ i18n('При сборе метрик для большого числа публикаций метрики по умолчанию выкл.') }}
                    </template>
                    <template v-else>
                        {{ i18n('Идёт сбор метрик для большого числа публикаций.') }}<br/>
                        {{ i18n('Будет готово через несколько секунд🤓') }}
                    </template>
                </div>
            </div>
        </div>
        <div
            class="flex flex-col map bg-white w-half pos-r tool-shadow media-header-item-1439"
            style="overflow-y: clip;height: 312px;/* height: calc(250px + 35px + 10px + 15px);  */"
        >
            <div
                class="flex justify-between items-center title p-9-10"
                style="padding-bottom: 0;height: 24px;"
            >
                <span>
                    <span v-if="staced_column"
                        >{{ i18n('Источники публикаций') }}</span
                    >
                    <span v-if="!staced_column"
                        >{{ i18n('Тональность источников') }}</span
                    >
                    <!--Публикаций по источникам:-->
                    <!--<span style="font-family: sans-serif;font-size: 15px;font-weight:600;color:#1CB394;">{{
                        resource_news_count }}</span>-->
                    <!--в процетах: <span
                        style="font-family: sans-serif;font-size: 15px;font-weight:600;color:#1CB394;">{{
                            res_news_percentage }}</span>-->
                </span>

                <div class="switcher" v-show="!staced_column">
                    <div
                        style="border-radius: 3px 0 0 3px;"
                        @click="inColumnPercentage = !inColumnPercentage"
                        :class="{
                            active: !inColumnPercentage,
                        }"
                    >
                        {{ i18n('Абсолютный') }}
                    </div>
                    <div
                        style="border-radius: 0 2px 2px 0;"
                        @click="inColumnPercentage = !inColumnPercentage"
                        :class="{
                            active: inColumnPercentage,
                        }"
                    >
                        {{ i18n('Доля') }}
                    </div>
                    <div
                        :style="{
                            width: inColumnPercentage ? 'auto' : 0,
                            marginLeft: inColumnPercentage ? '3px' : 0,
                            padding: inColumnPercentage ? '0 5px 0 6px' : 0,
                        }"
                        style='overflow: hidden;fontWeight: 900;fontFamily: "Font Awesome 5 Free";transition: .25s;border-radius: 0 2px 2px 0;'
                        :class="{
                            active: inColumnPercentage && showColumnPercentage
                        }" @click="showColumnPercentage = !showColumnPercentage">%</div>
                </div>

                <!--<v-select @input="set_each_number" :options="each_numbers" :has_img="false" :tabindex="each_numbers.indexOf(each_number)"></v-select>-->

                <i
                    class="fa fa-refresh cursor-pointer"
                    @click="reset_resource"
                    v-if="staced_column && has_selected_resource"
                ></i>
                <i
                    class="fa fa-refresh cursor-pointer"
                    @click="reset_sentiment_resource"
                    v-else-if="
                        !staced_column && has_selected_resource_sentiment
                    "
                ></i>
                <i
                    class="fa fa-refresh opacity-0 pointer-events-none"
                    v-else
                ></i>
            </div>

            <keep-alive>
                <component :is="'ColumnChart'" />
            </keep-alive>
            <div class="res_counts">
                <div
                    class="res_count"
                    :style="{
                        width: show_percent
                            ? text(resource_clipped_news_count.push_space())
                            : text(res_news_percentage),
                    }"
                    @click="show_percent = !show_percent"
                    :class="{
                        active: show_percent,
                    }"
                >
                    <template v-if="this.resource_count_loading">
                        <div
                            class="front"
                        >
                            <i class="fa-solid fa-spinner"></i>
                        </div>
                        <div
                            class="back"
                        >
                            <i class="fa-solid fa-spinner"></i>
                        </div>
                    </template>
                    <template v-else>
                        <div class="front">{{ res_news_percentage }}</div>
                        <div class="back white-space-nowrap">
                            {{ resource_clipped_news_count.push_space() }}
                        </div>
                    </template>
                </div>
                <div class="res_count_prompt">{{ show_percent ? i18n('Количество публикаций') : i18n('Доля публикаций на выделенных источниках') }}</div>
                <VRange v-if="r_type == 1" :percent="res_news_info"></VRange>
                <VRange
                    v-else-if="r_type == 2"
                    :percent="res_news_info"
                ></VRange>
            </div>
        </div>
    </div>
</template>

<script>
import i18n from "@/response/utils/i18n"
// import VSelect from '@/components/UI/VSelect.vue';
import VRange from "@/components/UI/VRange.vue";
import PieChart from "@/components/widgets/PieChart.vue";
import ColumnChart from "@/components/widgets/ColumnChart.vue";
import {
    getClippedResources,
    selected_languages,
    resource_clipped_news_count,
    resource_full_news_count,
    resource_count,
    select_language,
    reset_languages,
    has_selected_languages,
} from "@/response/data/index";
import {
    has_selected_resource,
    reset_resource,
    staced_column,
    has_selected_resource_sentiment,
    reset_sentiment_resource,
    selected_top_resources,
    each_number,
    resource_news_count,
    start_top_resources,
    maxRange,
    inColumnPercentage,
    showColumnPercentage,
} from "@/response/options/columnOptions";
import {
    has_selected_categories,
    reset_categories,
} from "@/response/options/pieOptions";
import { filter } from "@/response/filter";
import { r_type, languages_count, lang } from "@/response/header";
import { getItems } from "@/response/api";

import {
    soc_metrics,
    selected_soc_metrics,
    enable_metrics,
    selected_regions,
    selected_page,
    resource_count_loading,
    laoding_metrics,
    is_high_news_count,
} from "@/response/data/index";
import { get_map_keys } from "@/response/options/mapOptions";

export default {
    watch: {
        selected_soc_metrics() {
            if (this.selected_page == 1) {
                this.getItems();
            } else {
                this.selected_page = 1;
            }
        },
    },

    components: {
        PieChart,
        ColumnChart,
        // VSelect,
        VRange,
    },
    methods: {
        set_each_number(option) {
            this.each_number = option;
        },
        imgUrl(pet) {
            var images = require.context(
                "@/assets/languages/",
                false,
                /\.png$/
            );
            return images("./" + pet + ".png");
        },
        text(text, font = 15) {
            let context = document.createElement("canvas").getContext("2d");
            context.font = font + "px Arial";
            return parseInt(context.measureText(text + "").width) + 14 + "px";
        },
    },
    computed: {
        max_lang_filtered_count() {
            let filled_counts = Object.values(this.languages_count).map(
                (lang) => lang.filled_count
            );
            return Math.max(...filled_counts);
        },
        defaultParalax() {
            return `rotateX(calc(${this.rX} * 1deg)) rotateY(calc(${this.rY} * 1deg))`;
        },
        get_languages() {
            return [
                {
                    id: 10,
                    name: "Казахский",
                    img: "kz",
                    img_width: 30,
                },
                {
                    id: 4,
                    name: "Русский",
                    img: "ru",
                    img_width: 30,
                },
                {
                    id: 5,
                    name: "Английский",
                    img: "en",
                    img_width: 30,
                },
                {
                    id: 3,
                    name: "Другие",
                    img: "other",
                    img_width: 24,
                },
            ];
        },
        res_news_info() {
            let selected_res_news = (this.selected_top_resources * this.each_number) + 1;

            // if (selected_res_news > this.resource_count) selected_res_news = this.resource_count;

            return selected_res_news;
        },
        res_news_percentage() {
            // let all_res_news_count = this.getClippedResources.clipped.reduce((start, next) => (start += next.total ?? 0), 0);
            // let full_res_news_count = this.data_creator.resource.reduce((start, next) => (start += next.total ?? 0), 0);


            let percent =
                Math.round(
                    (this.resource_clipped_news_count /
                        this.resource_full_news_count) *
                        100 *
                        10
                ) / 10;

            console.log('res_news_percentage', percent)

            if (Number(percent ?? 0) > 100) return "100%";

            if (isNaN(percent)) percent = 0;

            return percent + "%";
        },
        res_slider_percentage() {
            let all_res_news_count = +this.getClippedResources.clipped.length;
            let percent =
                Math.round((this.each_number / all_res_news_count) * 100 * 10) /
                10;

            return percent + "px";
        },
    },
    data() {
        return {
            each_numbers: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50],
            show_percent: false,
            rX: 0,
            rY: 0,
        };
    },
    setup() {
        return {
            i18n,
            laoding_metrics,
            is_high_news_count,
            resource_count_loading,
            enable_metrics,
            get_map_keys,
            selected_regions,
            selected_page,
            getItems,
            languages_count,
            lang,
            soc_metrics,
            selected_soc_metrics,
            select_language,
            reset_languages,
            selected_languages,
            has_selected_languages,
            resource_clipped_news_count,
            resource_full_news_count,
            resource_count,
            has_selected_resource,
            has_selected_resource_sentiment,
            reset_resource,
            reset_sentiment_resource,
            staced_column,
            selected_top_resources,
            each_number,
            resource_news_count,
            getClippedResources,
            start_top_resources,
            has_selected_categories,
            reset_categories,
            filter,
            maxRange,
            inColumnPercentage,
            showColumnPercentage,
            r_type,
        };
    },
};
</script>

<style>
.p-x-14 {
    padding: 0 14px;
}

.toggle {
    cursor: pointer;
    display: inline-block;
}

.toggle-switch {
    display: inline-block;
    background: #ccc;
    border-radius: 16px;
    width: 40px;
    height: 15px;
    min-width: 43px;
    min-height: 15px;
    position: relative;
    vertical-align: middle;
    transition: background 0.25s;
}
.toggle-switch:before,
.toggle-switch:after {
    content: "";
}
.toggle-switch:before {
    display: block;
    background: linear-gradient(to bottom, #fff 0%, #eee 100%);
    border-radius: 50%;
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.25);
    width: calc(20%);
    min-width: 9px;
    height: calc(100% - 6px);
    min-height: 9px;
    position: absolute;
    top: 2.5px;
    left: 4px;
    transition: left 0.25s;
}
.toggle:hover .toggle-switch:before {
    background: linear-gradient(to bottom, #fff 0%, #fff 100%);
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.5);
}
.toggle-checkbox:checked + .toggle-switch {
    background: #3b5998;
}
.toggle-checkbox:checked + .toggle-switch:before {
    left: calc(100% - 9px - 3px);
}

.toggle-checkbox {
    position: absolute;
    visibility: hidden;
}

.toggle-label {
    margin-left: 5px;
    position: relative;
    top: 2px;
}

.fa-spinner {
    animation: lds-ellipsis1 1s infinite linear;
    height: 1em;
}

@keyframes lds-ellipsis1 {
    0% {
        transform: rotateZ(0deg);
    }
    100% {
        transform: rotateZ(360deg);
    }
}

.please_wait_metrics {
    margin: 3px 14px 14px 14px;
    line-height: 16px;
    font-size: 12.5px;
    padding: 8px;
    background: #cccccc54;
    border-radius: 5px;
    border: 3px solid #ccc;
    transition: .15s;
    opacity: 1;
}
</style>
