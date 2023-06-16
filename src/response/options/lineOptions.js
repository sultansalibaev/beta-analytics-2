import "@/response/utils";

import {
    selected_dates,
    selected_sentiment_dates,
    dynamics,
    selected_date_mode,
    date_modes,
    selected_page,
} from "@/response/data/index";
import { computed, reactive, ref } from "vue";

import { getGeneralCount, getSocialMetrics, getItems } from '@/response/api'
import { r_type, selected_main_sentiments } from "../header";

export const basic_line = reactive(ref(true));


export const reset_dynamics = function () {
    selected_dates.value.dates = {};
};
export const has_selected_date = computed(() => {
    return (
        Object.values(selected_dates.value.dates).find(
            (selected_date) => selected_date
        ) !== undefined
    );
});

function getSortedEntries() {
    return [
        "1",
        "0",
        "-1",
    ]
    // .filter(sentiment => selected_main_sentiments.value[sentiment]);
}

export const reset_sentiment_dynamics = function () {
    selected_sentiment_dates.value.dates = {
        1: {},
        0: {},
        "-1": {},
    };
};
export const has_selected_sentiment_date = computed(() => {
    return (
        [
            ...Object.values(selected_sentiment_dates.value.dates["1"]),
            ...Object.values(selected_sentiment_dates.value.dates["0"]),
            ...Object.values(selected_sentiment_dates.value.dates["-1"]),
        ].find((selected_date) => selected_date) !== undefined
    );
});

// let minRange;
let sentimentColor = {
    1: "#1CB394",
    0: "#F2B90A",
    "-1": "#EC5E5E",
};
let color_to_sentiment = {
    "#1CB394": "1",
    "#F2B90A": "0",
    "#EC5E5E": "-1",
};

//if (s_date == f_date) {
//minRange = 24 * 3600 * 1000;
//type = 'one_day';
//} else {
// minRange = 30 * 24 * 3600 * 1000;
//}

// hourly = 24 * 3600 * 1000;
// daily = 30 * 24 * 3600 * 1000;
// weekly = 7 * 24 * 3600 * 1000;
// monthly = 12 * 30 * 24 * 3600 * 1000;

export const lineOptions = computed(() => {
    return {
        credits: false,

        chart: {
            zoomType: "x",
            resetZoomButton: {
                position:{
                    align: 'left',
                    verticalAlign: 'top',
                    x: -10,
                    y: -12
                }
            },
            events: {
                load: function () {
                    basic_line.value = true;
                    this.series.forEach((series) => {
                        if (series.name !== "Кривая") {
                            series.hide();
                        }
                    });
                },
            },
            margin: [8 + 4, 15, 25], // [8 + 4, 5, 25, 35] // [0,5,25,35]
            height: 200
        },
        title: { text: "" },

        legend: {
            //align: 'right',
            //verticalAlign: 'top',
            //floating: true,
            //x: 0,
            //y: -15,
            //enabled: false

            align: "right",
            verticalAlign: "top",
            floating: true,
            x: 0,
            y: -17,

            reversed: true,
            labelFormat: "&nbsp;",
            margin: -5,
            //symbolPadding: 20,
            itemDistance: 18,
            itemStyle: {
                //"width": "20px",
                height: "10px",
                cursor: "pointer",
                fontSize: 11,
            },
            itemCheckboxStyle: {
                width: "20px",
                height: "10px",
                cursor: "pointer",
            },

            enabled: true,
        },

        xAxis: {
            type: "datetime",
            minRange: date_modes.value[selected_date_mode.value][3],
            gridLineWidth: 1,
            gridLineColor: "#e4e4e4",
            gridLineDashStyle: "dot",
        },

        yAxis: {
            categories: [],
            labels: {
                style: { color: "#333" },
            },
            allowDecimals: false,
            title: { text: "" },
            min: 0,
            tickInterval: 1,
            gridLineWidth: 1,
            gridLineColor: "#e4e4e4",
            gridLineDashStyle: "dot",

            height: "101.5%",
        },

        tooltip: {
            pointFormat: "Публикаций: <b>{point.y}</b><br/>",
        },

        plotOptions: {
            series: {
                allowPointSelect: true,
                lineWidth: 1.5,
                fillOpacity: 0.1,
                marker: {
                    symbol: "diamond",
                    radius: 1.0,

                    states: {
                        select: {
                            radius: 5.0,
                            enabled: true,
                            fillColor: "#A7B1C2",
                            lineColor: "#2f4050",
                        },
                    },
                },
            },
        },

        series: [
            ...getSortedEntries().map((key) => ({
                events: {
                    click: function (e) {
                        if (e.shiftKey) {
                            selected_sentiment_dates.value.dates[
                                color_to_sentiment[e.point.color]
                            ][e.point.options.date] = !e.point.selected;
                        } else {
                            selected_sentiment_dates.value.dates = {
                                1: {},
                                0: {},
                                "-1": {},
                            };
                            selected_sentiment_dates.value.dates[
                                color_to_sentiment[e.point.color]
                            ] = {
                                [e.point.options.date]: !e.point.selected,
                            };
                        }
                        getGeneralCount()
                        if (r_type.value == 2) {
                            getSocialMetrics()
                        }

                        if (selected_page.value == 1) {
                            getItems()
                        }
                        else {
                            selected_page.value = 1
                        }
                    },
                    legendItemClick: function () {
                        let default_series = this.chart.series.find(
                            (series) => series.name === "Кривая"
                        );
                        let sentimetn_series = this.chart.series.filter(
                            (series) => series.name !== "Кривая" && series.visible
                        );
                        if (!selected_main_sentiments.value[this.name]) {
                            this.show();
                        }
                        else if (default_series.visible) {
                            if (!this.visible) {
                                default_series.hide();
                                basic_line.value = false;
                            }
                        }
                        else if (sentimetn_series.length == 1) {
                            if (sentimetn_series[0].name == this.name && this.visible) {
                                default_series.show();
                                basic_line.value = true;
                            }
                        }
                    },
                },
                type: "areaspline",
                cursor: "pointer",
                //visible: false,
                color: sentimentColor[key],
                name: key,
                pointInterval: 24 * 3600 * 1000,
                pointStart: Date.UTC(2022, 9, 26),
                data: dynamics.value.map((date) => {
                    let temp_date = JSON.parse(JSON.stringify(date))
                    temp_date.y = temp_date[key]
                    temp_date.selected =
                        selected_sentiment_dates.value.dates[key][date.date];
                    return temp_date;
                }),
            })),
            {
                events: {
                    click: function (e) {
                        if (e.shiftKey) {
                            selected_dates.value.dates[e.point.options.date] =
                                !e.point.selected;
                        } else {
                            selected_dates.value.dates = {
                                [e.point.options.date]: !e.point.selected,
                            };
                        }
                        getGeneralCount()
                        if (r_type.value == 2) {
                            getSocialMetrics()
                        }

                        if (selected_page.value == 1) {
                            getItems()
                        }
                        else {
                            selected_page.value = 1
                        }
                    },
                    legendItemClick: function () {
                        basic_line.value = true;
                        this.chart.series.forEach((series) => {
                            if (series.name !== this.name) {
                                if (this.visible) {
                                    if (selected_main_sentiments.value[series.name]) {
                                        series.show();
                                        basic_line.value = false;
                                    }
                                } else {
                                    series.hide();
                                }
                            }
                        });
                    },
                },
                name: "Кривая",
                type: "areaspline",
                cursor: "pointer",
                color: "#7cb5ec",
                pointInterval: 24 * 3600 * 1000,
                pointStart: Date.UTC(2022, 9, 26),
                data: dynamics.value.map(
                    (date) => {
                        date.selected = selected_dates.value.dates[date.date];
                        return date;
                    }
                ),
                //showInLegend: false,
            },
        ],
    };
});

function getCallback() {
    if (selected_date_mode.value == 'weekly') {
        return date => (date);
    }
    else {
        return date => (`'${date}'`);
    }
}

export const selected_dates_query = computed(() => (
    Object.keys(selected_dates.value.dates)
        .filter(date => selected_dates.value.dates[date])
        .map(getCallback())
        .join(',')
))

export const selected_sentiment_dates_query = computed(() => {
    let s_s_d = {};
    Object.keys(selected_sentiment_dates.value.dates).forEach(sent => {
        s_s_d[sent] =
            Object.keys(selected_sentiment_dates.value.dates[sent])
                .filter(date => selected_sentiment_dates.value.dates[sent][date])
                .map(getCallback())
                .join(',');

    });

    return s_s_d;
})