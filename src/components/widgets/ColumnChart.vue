<template>
    <highcharts :options="columnOptions" class="column w-full"></highcharts>
</template>

<script>
import { columnOptions } from "@/response/options/columnOptions"

export default {
    setup() {
        return { columnOptions }
    },
};
</script>
<style>
.column {
    min-height: 100%;
}

.column .highcharts-legend-item rect {
    width: 35px;
}

.column .highcharts-series-3.highcharts-legend-item-hidden rect {
    width: 20px;
}

.column .highcharts-series-3:not(.column .highcharts-series-3.highcharts-legend-item-hidden) ~ .highcharts-legend-item-hidden rect {
    width: 20px;
}

</style>
