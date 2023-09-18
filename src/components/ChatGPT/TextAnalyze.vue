<template>
    <div @click.stop="select_options_modal = false;used_prompt_list_modal = false;">
        <div class="relative">
            
            <textarea class="form-control" id="textarea_analyze" style="display:none;" rows="10" :value="chatgpt_item?.text.maxLength(4_000)" disabled></textarea>
    
            <div style="font-size: 18px;font-weight: 500;">{{ i18n('Анализ перспективы') }}</div>
            <div style="color: #A8A8A8;font-size: 13px;margin: 8px 0 12px 0;">{{ i18n('Выберите подходящую точку зрения') }}:</div>
            <div class="inline-flex relative" style="margin-bottom:12px;">
                <div
                    @click.stop="select_options_modal = !select_options_modal"
                    class="inline-flex text-white justify-between items-center cursor-pointer select-title"
                    style="width: 185px;"
                >
                    {{ i18n('Выберите условие') }}
                    <i class="fa-solid fa-angle-down transition-all" style="margin-left:5px;" :style="select_options_modal ? '' : 'padding-top:3px;'" :class="{
                        'rotate-x-180': select_options_modal
                    }"></i>
                </div>
                <div class="absolute top-full right-0 left-0 transition-all select-options" :style="{
                        height: select_options_modal ? '170px' : '0px'
                    }">
                    <div class="flex flex-col select-none select-options-styles scrollbar" style="height: 165px;">
                        <div class="select-option" @click="change_condition('бизнес')" :class="{
                            active: condition == i18n('с точки зрения бизнеса')
                        }">{{ i18n('Бизнес') }}</div>
                        <div class="select-option" @click="change_condition('государство')" :class="{
                            active: condition == i18n('с точки зрения государства')
                        }">{{ i18n('Государство') }}</div>
                        <div class="select-option" @click="change_condition('граждане страны')" :class="{
                            active: condition == i18n('с точки зрения гражданина страны')
                        }">{{ i18n('Граждане страны') }}</div>
                        <div class="select-option" @click="change_condition('сил.структуры')" :class="{
                            active: condition == i18n('с точки зрения силовых структур')
                        }">{{ i18n('Силовые структуры') }}</div>
                        <div class="select-option" @click="change_condition('разные т.з.')" :class="{
                            active: condition == i18n('с разных точек зрения')
                        }">{{ i18n('Разные точки зрения') }}</div>

                        <div class="select-option" @click="change_condition('пресс-релиз')" :class="{
                            active: condition == i18n('и составь пресс-релиз по этой публикации, объемом до 1800 знаков, на русском языке')
                        }">{{ i18n('Пресс-релиз') }}</div>
                        <div class="select-option" @click="change_condition('план действий таблицей')" :class="{
                            active: condition == i18n('и составь план действий для всех участников этой ситуации для ее разрешения и улучшения')
                        }">{{ i18n('План действий таблицей') }}</div>
                        <div class="select-option" @click="change_condition('выработай рекомендации')" :class="{
                            active: condition == i18n('и выработай список из 3-5 рекомендаций для улучшения деятельности организации ... по описанной ситуации')
                        }">{{ i18n('Выработай рекомендации') }}</div>
                        <div class="select-option" @click="change_condition('негатив в позитив')" :class="{
                            active: condition == i18n('и предложи 5 идей как отреагировать на эту публикацию так, чтобы негативный эффект для организации ...Х... перевести в позитивный')
                        }">{{ i18n('Негатив в позитив') }}</div>

                        <div class="select-option" @click="select_options_modal = condition = undefined" :class="{
                            active: condition == undefined
                        }">{{ i18n('Своё условие') }}</div>
                    </div>
                </div>
            </div>
            <div class="inline-flex relative" style="margin-bottom:12px;margin-left: 10px;" v-show="condition == undefined">
                <div @click.stop="toggle_prompt_list_modal()" class="inline-flex text-white justify-between items-center cursor-pointer select-title" style="background: white;border: 1px solid #3b5998;padding: 0;overflow: hidden;color: #858585;width: 350px;">
                    <input
                        type="text"
                        class="focus:outline-none"
                        style="height: 100%;width: 100%;padding: 0 8px 2px;"
                        :placeholder="i18n('Введите своё условие ...')"
                        id="analyze-input"
                        @click.stop="used_prompt_list_modal = true"
                        v-model="input">
                    
                    
                    <i class="fa-solid fa-angle-down transition-all" style="margin-left:5px;margin-right: 6px;" :style="used_prompt_list_modal ? '' : 'padding-top: 2px;'" :class="{
                        'rotate-x-180': used_prompt_list_modal
                    }"></i>
                </div>
                <div class="absolute top-full right-0 left-0 transition-all select-options" :style="{
                        height: used_prompt_list_modal ? '' : '0px',
                    }" style="max-height: 300px;">
                    <div class="flex flex-col select-none select-options-styles">
                        <div class="select-option pointer-events-none"
                            style="border-color: #ccc;color: #ccc;"
                            v-if="sorted_used_prompt_list.length == 0"
                        >{{ i18n('Список пуст') }}</div>
                        <div class="select-option" 
                            v-else
                            v-for="used_prompt in sorted_used_prompt_list"
                            :key="used_prompt"
                            :title="used_prompt"
                            @click="select_analyzed_prompt(used_prompt)" :class="{
                            active: input == used_prompt
                        }">{{ used_prompt }}</div>
                    </div>
                </div>
            </div>
            
            <div style="color: #A8A8A8;font-size: 13px;margin: 8px 0 12px 0;">{{ i18n('Что передается в ChatGPT') }}:</div>
            <div style="font-size: 15px;margin-bottom: 12px;line-height: 1.2;">{{ i18n('Проведите подробный анализ данной новости') }} {{ input == '' ? i18n(condition) : input }}</div>
    
            <pre style="margin-bottom: 12px;font-family: Roboto;line-height: 1.7!important;font-size: 13.5px!important;white-space: pre-wrap;" v-show="output">{{ output }}</pre>
    
            <div class="flex items-center justify-between" style="height: 27px;">
                <button
                    style="background: #3b5998;height: 27px;padding: 0 8px 2px;border-radius: 4px;font-size: 13px;color: white;"
                    @click="push_news"
                    :disabled="load_circle_analyze || chatgpt_item?.logs[input != '' ? input : condition]?.result"
                    v-show="!chatgpt_item?.logs[input != '' ? input : condition]?.result"
                >
                    {{ i18n('Запуск') }}
                    <i id="load-circle-analyze" v-show="load_circle_analyze" class="fa-solid fa-spinner"></i>
                </button>
                <button
                    type="button"
                    data-bs-toggle="modal"
                    data-bs-target="#exampleModal"
                    @click="text_analyze_modal = true"
                    class="ml-auto"
                    style="font-size: 13px;color: #2F82FF;text-decoration: underline;position: absolute;right: 0;top: 6px;"
                >{{ i18n('Информация') }}</button>
            </div>  
        </div>
        <div
            class="modal fade left-0 right-0 top-0 bottom-0"
            id="exampleModal"
            tabindex="-1"
            aria-labelledby="exampleModalLabel"
            aria-hidden="true"
            :style="text_analyze_modal ? 'opacity: 1;overflow: visible;display: block;background-color: #0000006b;' : 'pointer-events: none;'"
            @click="text_analyze_modal = false">
            <div class="modal-dialog" style="transition: 0.15s;" :style="text_analyze_modal?'top: 25%;':'top: 0px;'" @click.stop>
                <div class="modal-content">
                    <div class="modal-header">
                        <h1 class="modal-title fs-5" id="exampleModalLabel" style="font-size: 30px;">{{ i18n('Анализ новости') }}</h1>
                        <!-- <button type="button" class="f-z-16 btn-close" data-bs-dismiss="modal" aria-label="Close"></button> -->
                    </div>
                    <div class="modal-body" style="line-height: 1.42857143;" v-html="tab_info"></div>
                    <div class="modal-footer" style="height: auto;border-top: 1px solid #e5e5e5;">
                        <button style="background-color: buttonface;color: #333;" type="button" class="f-z-16 btn btn-secondary" data-bs-dismiss="modal" @click="text_analyze_modal = false">{{ i18n('Закрыть') }}</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import i18n from "@/response/utils/i18n"
    import { Configuration, OpenAIApi } from "openai"
    import { chatgpt_item, chatgpt_tab, chatgpt_log } from '@/response/data/index'
    import { getGptLogs } from '@/response/api'
	import { r_type } from '@/response/header'
    import axios from 'axios'
    const configuration = new Configuration({
        apiKey: "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",
    });
    // let prepared_data = ""
    const openai = new OpenAIApi(configuration);
    export default {
        data() {
            const default_requests = {
                "бизнес": this.i18n("с точки зрения бизнеса"),
                "государство": this.i18n("с точки зрения государства"),
                "граждане страны": this.i18n("с точки зрения гражданина страны"),
                "сил.структуры": this.i18n("с точки зрения силовых структур"),
                "разные т.з.": this.i18n("с разных точек зрения"),
                "пресс-релиз": this.i18n("и составь пресс-релиз по этой публикации, объемом до 1800 знаков, на русском языке"),
                "план действий таблицей": this.i18n("и составь план действий для всех участников этой ситуации для ее разрешения и улучшения"),
                "выработай рекомендации": this.i18n("и выработай список из 3-5 рекомендаций для улучшения деятельности организации ... по описанной ситуации"),
                "негатив в позитив": this.i18n("и предложи 5 идей как отреагировать на эту публикацию так, чтобы негативный эффект для организации ...Х... перевести в позитивный"),
            };
            const tab_info = this.i18n(`Анализ перспективы - это инструмент, при помощи которого вы можете получить от языковой модели подробный анализ публикации с той или иной точки зрения. На вход GPT подается выражение - запрос: <b>"Проведите подробный анализ данной новости с точки зрения ..."</b> <br> В меню <b>"Условие"</b> можно выбрать одну из общественных групп или задать свою.<br><br> После выбора нажмите <b>"Запуск"</b> и подождите, пока сформируется ответ (10-20 секунд).`) + `<br><br>
                        "${ i18n('Бизнес') }" - ${ i18n("с точки зрения бизнеса") }<br>
                        "${ i18n('Государство') }" - ${ i18n("с точки зрения государства") }<br>
                        "${ i18n('Граждане страны') }" - ${ i18n("с точки зрения гражданина страны") }<br>
                        "${ i18n('Силовые структуры') }" - ${ i18n("с точки зрения силовых структур") }<br>
                        "${ i18n('Разные точки зрения') }" - ${ i18n("с разных точек зрения") }<br>
                        "${ i18n('Пресс-релиз') }" - ${ i18n("и составь пресс-релиз по этой публикации, объемом до 1800 знаков, на русском языке") }<br>
                        "${ i18n('План действий таблицей') }" - ${ i18n("и составь план действий для всех участников этой ситуации для ее разрешения и улучшения") }<br>
                        "${ i18n('Выработай рекомендации') }" - ${ i18n("и выработай список из 3-5 рекомендаций для улучшения деятельности организации ... по описанной ситуации") }<br>
                        "${ i18n('Негатив в позитив') }" - ${ i18n("и предложи 5 идей как отреагировать на эту публикацию так, чтобы негативный эффект для организации ...Х... перевести в позитивный") }`
            return {
                tab_info: tab_info,
                default_requests: default_requests,
                select_options_modal: false,

                condition: "",
                input: "",
                output: "",
                text_analyze_modal: false,
                dropdown_menu: false,
                used_prompt_list_modal: false,
                used_prompt_list: [],
                analyze_select: Object.values(default_requests),
            }
        },
        setup() {
            return {
                i18n,
                getGptLogs,
                chatgpt_item,
                chatgpt_tab,
                chatgpt_log,
				r_type,
            }
        },
        computed: {
            load_circle_analyze() {
                return this.chatgpt_item?.logs && this.condition && this.chatgpt_item?.logs[this.condition] == 'loading'
            },
            sorted_used_prompt_list() {
                if (this.input == '') return this.used_prompt_list;
                else {
                    return this.used_prompt_list
                        .filter(used_prompt => used_prompt?.lowerIncludes(this.input))
                        .sort((a,b) => {
                            if (a?.lowerIncludes(this.input) == false && b?.lowerIncludes(this.input) == false) {
                                return 0
                            }
                            else if (a?.lowerIncludes(this.input) && b?.lowerIncludes(this.input)) {
                                return a?.indexOf(this.input) < b?.indexOf(this.input) ? -1 : 0
                            }
                            else{
                                return a?.lowerIncludes(this.input) && b?.lowerIncludes(this.input) == false ? -1 : 0
                            }
                        });
                }
            },
        },
        methods: {
            select_analyzed_prompt(used_prompt) {

                if (this.analyze_select.includes(used_prompt)) {
                    this.input = ''
                    this.condition = used_prompt
                }
                else {
                    this.condition = undefined
                    this.input = used_prompt
                }
                this.used_prompt_list_modal = false;
            },
            toggle_prompt_list_modal() {
                this.used_prompt_list_modal = !this.used_prompt_list_modal;
                document.querySelector('#analyze-input')?.focus()
            },
            change_condition(statement) {
                this.select_options_modal = false;
                if (this.default_requests[statement]) {this.condition = this.default_requests[statement]} 
                // if (statement == "бизнес") {this.condition = "с точки зрения бизнеса"} 
                // if (statement == "государство") {this.condition = "с точки зрения государства"} 
                // if (statement == "граждане страны") {this.condition = "с точки зрения гражданина страны"} 
                // if (statement == "сил.структуры") {this.condition = "с точки зрения силовых структур"} 
                // if (statement == "разные т.з.") {this.condition = "с разных точек зрения"} 
            },
            async push_news() {

                const temp_chatgpt_item = JSON.parse(JSON.stringify(this.chatgpt_item))

                if (this.input.length > 0) {
                    this.condition = this.input
                    console.log(this.input)
                }

                if (this.condition == "") {
                    alert("Внимание! Вы не выбрали условие!")
                    return 0
                }
                const textArea = document.getElementById("textarea_analyze")
                let temp = textArea.value

                if (temp == "") {
                    alert("Внимание! Вы не ввели текст!")
                    return 0
                }

                if (this.input.length > 0) {
                    this.condition = this.input
                }

                const temp_condition = this.condition;
                const temp_r_type = this.r_type;

                this.chatgpt_item.logs[this.condition] = 'loading'

				this.chatgpt_error = false;

                axios.get(`/ru/gpt-service/get-log?news_id=${temp_chatgpt_item?.item_id}&news_type=${temp_r_type}&type=analyze&promt=${temp_condition}`)
                    .then(async (response) => {
                        console.log('gpt-service - response = ', response?.data);
                        if (response?.data == false) {
                            const completion = await openai.createChatCompletion({
                                model: "gpt-3.5-turbo",
                                messages: [
                                    {'role': 'system', 'content': 'You are an assistant for the monitoring system. You must give your own analysis of the presented news.'},
                                    {'role': 'user', 'content': this.i18n('Проведите подробный анализ данной новости') + ' ' + temp_condition},
                                    {'role': 'user', 'content': this.i18n('Представленная новость') + ': ' + temp}
                                ],
                            });
                            console.log('completion', completion);
                            let temp_output = completion.data.choices[0].message.content

                            if (!temp_output) return

                            let formData = new FormData();

                            formData.append('news_id', temp_chatgpt_item?.item_id)
                            formData.append('news_type', temp_r_type)
                            formData.append('type', 'analyze')
                            formData.append('promt', temp_condition)
                            formData.append('result', temp_output)

                            axios.post(`/ru/gpt-service/create-log`, formData)
                                .then((response) => {
                                    console.log('gpt-service - create-log response = ', response);
                                    if (response?.data == 1 && temp_chatgpt_item?.logs) {
                                        this.getGptLogs()
                                    }
                                })
                                .catch(error => {
                                    console.log('error', error);
                                })
                                .finally(() => {
                                    if (temp_chatgpt_item?.item_id == this.chatgpt_item?.item_id) {
                                        this.output = temp_output
                                    }
                                })
                        }
                        else {
                            this.output = response?.data?.result
                        }
                    })
                    .catch(error => {
                        this.chatgpt_error = true;
                        this.getGptLogs()
                        console.log('error', error);
                    })

            },
            updateOutput() {
                if (!this.chatgpt_item?.logs) {
                    this.condition = ''
                    this.input = ''
                    this.output = ''
                    return;
                }
                const log_keys = Object.keys(this.chatgpt_item?.logs);

                if (log_keys.length == 0) return;
                // if (log_keys.length == 1 && log_keys[0] == this.i18n('Обобщение')) return;

                
        
                const temp_log_key = log_keys.find(prompt => (this.analyze_select.includes(prompt)) && !(["Обобщение", "Summary", "Жалпылау"].includes(prompt)) && this.chatgpt_item?.logs[prompt]?.type == 'analyze')

                if (temp_log_key) {
                    this.condition = temp_log_key
                }

                if (this.condition == '') {
                    const log_key = log_keys.find(prompt => (!this.analyze_select.includes(prompt)) && !(["Обобщение", "Summary", "Жалпылау"].includes(prompt)) && this.chatgpt_item?.logs[prompt]?.type == 'analyze')
                    if (log_key) this.input = log_key
                }
        
                this.output = this.chatgpt_item?.logs[this.input != '' ? this.input : this.condition]?.result
            },
        },
        watch: {
            chatgpt_item(newValue) {
                if (newValue != null && this.chatgpt_tab == 'TextAnalyze') {
                    this.updateOutput()
                    this.used_prompt_list = Object.values(this.chatgpt_item?.logs).filter(log => (
                        log?.type == 'analyze' &&
                        !(["Обобщение", "Summary", "Жалпылау"].includes(log?.promt)) &&
                        !this.analyze_select.includes(log?.promt)
                    )).map(log => log?.promt)
                }
                else if (newValue == null) this.output = '';
            },
            chatgpt_tab(newValue) {
                
                this.input = ''

                if (newValue == 'TextAnalyze' && this.chatgpt_item != null) {
                    this.used_prompt_list = Object.values(this.chatgpt_item?.logs).filter(log => (
                        log?.type == 'analyze' &&
                        !(["Обобщение", "Summary", "Жалпылау"].includes(log?.promt)) &&
                        !this.analyze_select.includes(log?.promt)
                    )).map(log => log?.promt)
                    if (this.chatgpt_log != null && this.chatgpt_log?.type == 'analyze') {
                        if (
                            this.analyze_select.includes(this.chatgpt_log?.promt)
                        ) {
                            this.input = ''
                            this.condition = this.chatgpt_log?.promt
                        }
                        else {
                            this.condition = undefined
                            this.input = this.chatgpt_log?.promt
                        }
                        // this.output = this.chatgpt_log?.result
                        return;
                    }
                    this.updateOutput()
                }
            },
            condition(newValue) {
                const log_keys = Object.keys(this.chatgpt_item?.logs);
                if (log_keys.length == 0) return;
                let temp_result = this.chatgpt_item?.logs[this.input != '' ? this.input : newValue]?.result;
                this.output = temp_result || ''
            },
            input(newValue) {
                const log_keys = Object.keys(this.chatgpt_item?.logs);
                if (log_keys.length == 0) return;
                let temp_result = this.chatgpt_item?.logs[newValue != '' ? newValue : this.condition]?.result;
                this.output = temp_result || ''
            },
        }
    }
</script>

<style>

/* Scrollbar */

.scrollbar {
    overflow-x: clip;
    overflow-y: scroll;
}

.scrollbar::-webkit-scrollbar {
    width: 7px;
    margin-left: 2px;
}

.scrollbar::-webkit-scrollbar-track {
    margin-left: 2px;
    background-color: transparent;
}

.scrollbar::-webkit-scrollbar-thumb {
    /*background-color: #eaeaea;*/
    background-color: rgb(170, 227, 255);
    border-radius: 5px;
}

/* ... */

.btn-help {
    margin: 0 auto;
    margin-top: 30px;
}
.cond {
    display: inline-block;
    margin-top: 5px;
}
.dropdown_inline {
    display: inline-block;
}
#load-circle-analyze {
    margin-left: 2px;
}
/* .main-block {
    margin-top: 50px;
} */
.btn-control {
    margin-top: 20px;
}
.btn-success {
    color: #fff !important;
    background-color: #3B5998 !important;
    border-color: #3B5998 !important;
}
.btn-success:hover {
    color: #fff !important;
    background-color: #324c82 !important;
    border-color: #324c82 !important;
}
.btn-info:hover, .btn-info:focus, .btn-info:active, .btn-info.active, .open .dropdown-toggle.btn-info, .btn-info:active:focus, .btn-info:active:hover, .btn-info.active:hover, .btn-info.active:focus {
    background-color: #21b9bb !important;
    border-color: #21b9bb !important;
    color: #FFFFFF !important;
}
.tab-content .dropdown-menu {
    padding: 5px;
    font-size: 16px;
}
.tab-content .dropdown-menu li:hover {
    color: #1e2125;
    background-color: #e9ecef;
    border-radius: 3px;
}

.tab-content .dropdown-menu li {
    padding: 5px 10px;
}
.chatgpt-error {
    color: red;
    font-weight: 300;
    font-size: 14px;
    margin-left: 8px;
}
.tab-content .dropdown-toggle:after {
    display: inline-block;
    margin-left: 0.255em;
    vertical-align: 0.255em;
    content: "";
    border-top: 0.3em solid;
    border-right: 0.3em solid transparent;
    border-bottom: 0;
    border-left: 0.3em solid transparent;
}


.input-angle-down {
    position: absolute;
    top: 0;
    right: 8px;
    bottom: 0;
    display: flex;
    align-items: center;
    font-size: 16px;
    cursor: pointer;
    transition: .15s;
}
.rotate-x-180 {
    transform: rotateX(180deg);
}
.used-prompt-list {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: #fff;
    margin-top: 5px;
    padding: 5px;
    font-size: 16px;
    border-radius: 3px;
    box-shadow: 0 0 3px rgba(86, 96, 117, 0.7);
    max-height: 300px;
    overflow-y: scroll;
}
.used-prompt:hover {
    background: #e9ecef;
}
.used-prompt {
    padding: 7px 10px;
    cursor: pointer;
    color: #1e2125;
    border-radius: 3px;
    height: 30px;
    min-height: 30px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
textarea.form-control {
    word-spacing: 2px;
    letter-spacing: .7px;
    font-family: 'Roboto';
    line-height: 1.7 !important;
    font-size: 13.5px !important;
}
.empty-list_item {
    background: white !important;
    color: #ccc;
    cursor: default;
}

/*  */

.select-option {
    padding:6px 7px;
    cursor:pointer;
    height:27px;
    white-space:nowrap;
    transition: .15s;
}

.select-option.active,
.select-option:hover {
    background: rgb(59, 89, 152);
    color: white;
}

.select-option:not(.select-option:last-child) {
    border-bottom:1px solid rgb(59, 89, 152);
}

.select-options {
    z-index:1;
    overflow-y: clip;
}
.select-options-styles {
    font-size:13px;
    background:white;
    border-radius:4px;
    border:1px solid rgb(59, 89, 152);
    margin-top: 5px;
}

.select-title {
    background:rgb(59, 89, 152);
    height:27px;
    padding:0px 8px 2px;
    border-radius:4px;
    font-size:13px;
    width:150px;
}
</style>