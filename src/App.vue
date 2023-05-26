<template>
    <div @click.stop="reset">
        <div class="wrap-body p-t-10">
            <VHeader class="m-b-15" />
            <TopTools class="m-b-15" />
            <BottomTools class="m-b-15"></BottomTools>
        </div>
        <VNews class="m-b-15"></VNews>
    </div>
</template>

<script>
import VHeader from './components/VHeader.vue'
import TopTools from './components/TopTools.vue'
import BottomTools from './components/BottomTools.vue'
import VNews from './components/VNews.vue'
import {
    item_modal,
} from "@/response/data/index";

export default {
    name: 'App',
    components: {
        VHeader,
        TopTools,
        BottomTools,
        VNews,
    },
    setup() {
        return { item_modal }
    },
    methods: {
        reset() {
            this.item_modal = false
        }
    }
}
</script>

<style scoped>
div {
    line-height: 1;
}
.profile-element img {
    width: 150.7px;
    margin: 0 auto;
}
</style>
