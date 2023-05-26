import { computed, reactive, ref } from "vue";

import { bars_sentiments_selected, selected_regions, places, map } from "@/response/data/index"
import { map_type_switcher } from "@/response/options/mapOptions"
import { selected_main_sentiments } from "@/response/header";

export const inBarPercentage = reactive(ref(false));
export const showBarPercentage = reactive(ref(true));
let min_height = reactive(ref(190));

let sentiment_colors = {
    "1": "#1CB394",
    "0": "#F2B90A",
    "-1": "#EC5E5E",
}

let sentiment_states_colors = {
    "1": "#157e69",
    "0": "#af8509",
    "-1": "#a03e3e",
}
let sentiment_names = {
    "1": "Positive",
    "0": "Neutral",
    "-1": "Negative",
}
let sentiment_type = {
    "1": "positive",
    "0": "neutral",
    "-1": "negative",
}

let barOptions = computed(() => {
    let temp_regions = [...Object.values(places.value[map_type_switcher.value])]
    
    temp_regions.sort((a, b) => (b.value - a.value))
    let temp_regions_bool = [...Object.values(places.value[map_type_switcher.value])].find(obj => (selected_regions.value[obj.id])) != undefined
    if (temp_regions_bool) {
        temp_regions = temp_regions.filter(obj => (selected_regions.value[obj.id]))
    }

    let series_data = [
        "1",
        "0",
        "-1",
    ].filter(sentiment => selected_main_sentiments.value[sentiment])
    .map(sentiment => (
        {
            cursor: 'pointer',
            //showInLegend: false,
            name: sentiment_names[sentiment],
            color: sentiment_colors[sentiment],
            states: {
                hover: {
                    color: sentiment_states_colors[sentiment],
                    borderColor: sentiment_states_colors[sentiment]
                },
                select: {
                    color: sentiment_states_colors[sentiment],
                    borderColor: sentiment_states_colors[sentiment]
                }
            },
            data: temp_regions
                // .filter(region => (region.value > 0))
                .map(region => (
                    {
                        y: region[sentiment_type[sentiment]],
                        region: region.id,
                        sentiment: sentiment,
                        selected: (bars_sentiments_selected.value.sentiment_places[sentiment][region.id] === true)
                    }
                ))
        }
    ))

    // let series_data = [{
    //     cursor: 'pointer',
    //     //showInLegend: false,
    //     name: 'Positive',
    //     color: "#1CB394",
    //     states: {
    //         hover: {
    //             color: '#157e69',
    //             borderColor: '#157e69'
    //         },
    //         select: {
    //             color: '#157e69',
    //             borderColor: '#157e69'
    //         }
    //     },
    //     data: temp_regions.map(region => ({
    //         y: region.positive,
    //         region: region.id,
    //         sentiment: '1',
    //         selected: (bars_sentiments_selected.value.sentiment_places['1'][region.id] === true)
    //     }))
    // }, {
    //     cursor: 'pointer',
    //     //showInLegend: false,
    //     name: 'Neutral',
    //     color: "#F2B90A",
    //     states: {
    //         hover: {
    //             color: '#af8509',
    //             borderColor: '#af8509'
    //         },
    //         select: {
    //             color: '#af8509',
    //             borderColor: '#af8509'
    //         }
    //     },
    //     data: temp_regions.map(region => ({ y: region.neutral, region: region.id, sentiment: '0', selected: (bars_sentiments_selected.value.sentiment_places['0'][region.id] === true) }))
    // }, {
    //     cursor: 'pointer',
    //     //showInLegend: false,
    //     name: 'Negative',
    //     color: "#EC5E5E",
    //     states: {
    //         hover: {
    //             color: '#a03e3e',
    //             borderColor: '#a03e3e'
    //         },
    //         select: {
    //             color: '#a03e3e',
    //             borderColor: '#a03e3e'
    //         }
    //     },
    //     data: temp_regions.map(region => ({
    //         y: region.negative,
    //         region: region.id,
    //         sentiment: '-1',
    //         selected: (bars_sentiments_selected.value.sentiment_places['-1'][region.id] === true)
    //     }))
    // }]
    return {
        chart: {
            type: 'bar',
            margin: [0, 0, 15],
            height: min_height.value,
            scrollablePlotArea: {
                minHeight: 350 * (temp_regions.length / 10),
            },
            marginRight: 0,
        },
        title: {
            text: ''
        },
        legend: {
            reversed: true,
            labelFormat: '&nbsp;',
            verticalAlign: 'bottom',
            align: 'center',
            y: 20,
            margin: -5,
            symbolPadding: 30,
            itemDistance: 4,
            itemStyle: {
                //"width": "20px",
                "height": "10px",
                cursor: "pointer",
                fontSize: 11,
            },
            itemCheckboxStyle: {
                width: "20px",
                height: "10px",
                cursor: "pointer"
            },

        },
        xAxis: {
            categories: temp_regions.map(obj => obj.country),
            // maxLength: 14,
            labels: {
                style:{
                    width: '90px',
                    whiteSpace: 'wrap',
                    textOverflow: 'ellipsis'
                }
            }
        },
        yAxis: {
            title: { enabled: false },
            labels: { enabled: false },
            gridLineWidth: .5
        },
        credits: {
            enabled: false
        },
        tooltip: {
            enabled: false
        },
        navigation: {
            buttonOptions: {
                enabled: false
            }
        },

        plotOptions: {
            bar: {
                stacking: inBarPercentage.value && !map.value ? "percent" : "normal", // percent | normal
            },
            series: {
                borderWidth: 0,
                pointPadding: 0,
                point: {
                    events: {
                        click: function (e) {
                            if (e.shiftKey) {
                                this.selected = !this.selected
                                bars_sentiments_selected.value.sentiment_places = {
                                    ...bars_sentiments_selected.value.sentiment_places,
                                    [this.options.sentiment]: {
                                        ...bars_sentiments_selected.value.sentiment_places[this.options.sentiment],
                                        [this.options.region]: this.selected
                                    }
                                }
                                // bars_sentiments_selected.value.sentiment_places[this.options.sentiment][this.options.region] = this.selected;
                            }
                            else {
                                this.selected = !this.selected
                                bars_sentiments_selected.value.sentiment_places = {
                                    "1": {},
                                    "0": {},
                                    "-1": {},
                                };
                                bars_sentiments_selected.value.sentiment_places[this.options.sentiment][this.options.region] = this.selected;
                            }
                        }
                    }
                },
                animation: 150,
                states: {
                    select: {
                        borderWidth: 2,
                    },
                    inactive: {
                        enabled: false
                    },
                },
                stacking: 'normal',
                dataLabels: {
                    enabled: true,
                    format: inBarPercentage.value && !map.value && showBarPercentage.value ? '{point.percentage:.1f}%' : undefined,
                    style: {
                        textOutline: "0px",
                        fontWeight: "400",
                        //color: 'white',
                        width: '120px',
                        fontSize: "9px"
                    }
                }
            }
        },
        series: series_data
    }
})

const has_selected_sentiment = computed(() => (
    Object.values(bars_sentiments_selected.value.sentiment_places).find(obj_res_ids =>
        Object.values(obj_res_ids).find(bool => (bool)) === true
    ) !== undefined
))

const reset_sentiment = () => {
    bars_sentiments_selected.value.sentiment_places = {
        "1": {},
        "0": {},
        "-1": {},
    };
}

export { barOptions, min_height, has_selected_sentiment, reset_sentiment }