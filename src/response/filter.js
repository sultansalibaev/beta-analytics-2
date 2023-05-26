import { computed, reactive, ref, watch } from "vue";
import {
    selected_categories,
    get_selected_categories,
    dateRange,
    selected_regions,
    selected_languages,
    bars_sentiments_selected,
    selected_sentiment_dates,
    selected_dates,
    selected_resource_sentiment,
    selected_resources,
} from "@/response/data/index";
import {
    r_type,
    selected_social_categories,
    selected_main_sentiments,
} from "@/response/header";

export const filter = computed(() => {
    let _filter = {};

    _filter.type = {
        r_type: r_type.value,
        categories:
            r_type.value === 1
                ? selected_categories.value
                : selected_social_categories.value,
    };

    _filter.sentiment = {
        global: selected_main_sentiments.value,
        dynamics: selected_sentiment_dates.value,
    };

    _filter.place = selected_regions.value;

    _filter.date = {
        peroid: dateRange.value,
        dates: selected_dates.value,
    };


    _filter.language = selected_languages.value;

    return _filter;
});

export const create_global_filter = () => {
    let _filter = {};

    _filter.type = {
        r_type: r_type.value,
        categories:
            r_type.value === 1
                ? selected_categories.value
                : selected_social_categories.value,
        smi_categories: [get_selected_categories.value.length == 0, get_selected_categories.value.reduce((prev,next) => {
            prev[next] = true
            return prev
        }, {})],
    };

    _filter.sentiment = selected_main_sentiments.value;

    _filter.place = selected_regions.value;

    _filter.date = dateRange.value;

    _filter.language = selected_languages.value;

    return _filter;
}
export const global_filter = reactive(ref(create_global_filter()));

watch([
    dateRange,
    selected_categories,
    get_selected_categories,
    selected_regions,
    selected_languages,
    bars_sentiments_selected,
    selected_dates,
    selected_sentiment_dates,
    selected_resource_sentiment,
    selected_resources
], () => {
})
