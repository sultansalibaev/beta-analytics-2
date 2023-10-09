<template>
    <div @click.stop="select_options_modal = false;used_prompt_list_modal = false;">

        <div class="right-modal-menu">
            <!-- <div style="font-size: 18px;font-weight: 500;">{{ i18n('Анализ перспективы') }}</div> -->
            <div class="text-wrap-balance" style="color: #A8A8A8;font-size: 13px;margin: 2px 0 12px;">{{ i18n('Выберите подходящую точку зрения') }}:</div>

            <div class="flex flex-col">
                <div
                    @click.stop="request_type = 'analyze';condition = request_value;"
                    class="inline-flex text-white justify-between items-center cursor-pointer select-title"
                    style="width: 185px;margin-bottom: 6px;justify-content: center;padding-top: 1px;"
                    v-for="[request_name, request_value] in Object.entries(default_requests)"
                    :key="request_name"
                >
                    <span class="capitalize-first">{{ i18n(request_name) }}</span>
                </div>
                <div
                    @click.stop="request_type = 'analyze';condition = undefined;"
                    v-show="!(request_type == 'analyze' && condition == undefined)"
                    class="inline-flex text-white justify-between items-center cursor-pointer select-title"
                    style="width: 185px;margin-bottom: 6px;justify-content: center;padding-top: 1px;"
                >
                    <span class="capitalize-first">{{ i18n('Своё условие') }}</span>
                </div>
                <div class="inline-flex relative w-full" style="margin-bottom: 6px;" v-show="request_type == 'analyze' && condition == undefined">
                    <div @click.stop="toggle_prompt_list_modal()" class="inline-flex text-white justify-between items-center cursor-pointer select-title" style="background: white;border: 1px solid #3b5998;padding: 0;overflow: hidden;color: #858585;max-width: 250px;width: 100%;">
                        <input
                            type="text"
                            autocomplete="off"
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
            </div>
            
            <div class="text-wrap-balance" style="color: #A8A8A8;font-size: 13px;margin: 5px 0 12px;">{{ i18n('Укажите, от кого сформулировать обращение') }}:</div>
            <div class="flex flex-col">
                <div
                    @click.stop="request_type = 'reaction';condition = i18n('от организации ... в позитивном ключе, объемом на английском языке.');"
                    class="inline-flex text-white justify-between items-center cursor-pointer select-title"
                    style="width: 185px;margin-bottom: 6px;justify-content: center;padding-top: 1px;"
                >
                    <span class="capitalize-first">{{ i18n('Позитивный комментарий') }}</span>
                </div>
                <div
                    @click.stop="request_type = 'reaction';condition = undefined;"
                    v-show="!(request_type == 'reaction' && condition == undefined)"
                    class="inline-flex text-white justify-between items-center cursor-pointer select-title"
                    style="width: 185px;margin-bottom: 6px;justify-content: center;padding-top: 1px;"
                >
                    <span class="capitalize-first">{{ i18n('Своё обращение от ...') }}</span>
                </div>
                <div class="inline-flex relative w-full" style="margin-bottom: 6px;" v-show="request_type == 'reaction' && condition == undefined">
                    <div
                        @click.stop="toggle_prompt_list_modal()" 
                        class="inline-flex text-white justify-between items-center cursor-pointer select-title"
                        style="background: white;border: 1px solid #3b5998;padding: 0;overflow: hidden;color: #858585;max-width: 250px;width: 100%;"
                    >
                        <input
                            type="text"
                            class="focus:outline-none"
                            style="height: 100%;width: 100%;padding: 0 8px 2px;"
                            :placeholder="i18n('Деятеля, компании и т.д.')"
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
                            <div
                                class="select-option" 
                                v-else
                                v-for="used_prompt in sorted_used_prompt_list"
                                :key="used_prompt"
                                :title="used_prompt"
                                @click="input = used_prompt;used_prompt_list_modal = false;"
                                :class="{
                                    active: input == used_prompt
                                }">{{ used_prompt }}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex flex-col">
                <div
                    @click.stop="request_type = 'generalization';condition = i18n('Обобщение');"
                    class="inline-flex text-white justify-between items-center cursor-pointer select-title"
                    style="width: 185px;margin-top: 12px;justify-content: center;padding-top: 1px;"
                >
                    <span class="capitalize-first">{{ i18n('Обобщение') }}</span>
                </div>
            </div>
        </div>
        <div class="relative">
            
            <textarea class="form-control" id="textarea_analyze" style="display:none;" rows="10" :value="chatgpt_item?.text.maxLength(4_000)" disabled></textarea>
    
            <div class="flex" style="gap: 15px;">
                <div class="w-1/2">
                    <div
                        v-html='
                            chatgpt_item?.type == 1 && chatgpt_item?.category_id == 13
                                ? ""
                                : each_replace_all(
                                    chatgpt_item?.full_text
                                        .replaceAll(`href="/`,`href="${chatgpt_item?.res_link}/`)
                                        .replaceAll(`href=`,` target="_blank" href=`)
                                        .replaceAll(`src="/`,`src="${chatgpt_item?.res_link}/`)
                                        .replaceAll(`srcset="/`,`srcset="${chatgpt_item?.res_link}/`)
                                     + "<br/><br/><br/><br/>", false
                                )
                        '
                        class="full-item-text w-full overflow-hidden"
                        :style="{
                            maxHeight: chatgpt_item?.newspaper_modal ? '0px' : '',
                            paddingTop: chatgpt_item?.newspaper_modal
                                ? '0px'
                                : '10px',
                        }"
                        style="margin: 0 auto;"
                    ></div>
                </div>
                <div class="w-1/2">
                    
                    <div style="color: #A8A8A8;font-size: 13px;margin: 8px 0 12px 0;">{{ i18n('Что передается в ChatGPT') }}:</div>
                    <div style="font-size: 15px;margin-bottom: 12px;line-height: 1.2;">{{ gpt_request_text }}</div>

                    <textarea placeholder="Введите дополнительную информацию ..." class="w-full focus:outline-none" v-model="additional_info" style="padding: 9px 7px; border: 1px solid rgb(204, 204, 204); border-radius: 4px; margin-bottom: 12px;"></textarea>
           
                    <div class="flex items-center justify-between">
                        <button
                            style="background: #3b5998;height: 27px;padding: 0 8px 2px;border-radius: 4px;font-size: 13px;color: white;margin-bottom: 12px;"
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
                            class="ml-auto information-btn"
                        >{{ i18n('Информация') }}</button>
                    </div>
                    <pre style="width: 100%;margin-bottom: 12px;line-height: 1.7!important;font-size: 13.5px!important;white-space: pre-wrap;">{{ output }}</pre>
                </div>
            </div>
        </div>
        <div
            class="modal fade left-0 right-0 top-0 bottom-0"
            id="exampleModal"
            tabindex="-1"
            aria-labelledby="exampleModalLabel"
            aria-hidden="true"
            :style="text_analyze_modal ? 'opacity: 1;overflow: visible;display: block;background-color: #0000006b;position: fixed;' : 'position: fixed;pointer-events: none;'"
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
	import { r_type, search_tags } from '@/response/header'
    import { getLang } from "@/response/utils/langIs"
    import axios from 'axios'
                
    const configuration = new Configuration({
        apiKey: process.env.VUE_APP_APIKEY,
    });

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
                "негатив в позитив": this.i18n("и предложи 5 идей как отреагировать на эту публикацию так, чтобы негативный эффект для организации ... перевести в позитивный"),
            };
            const tab_info = this.i18n(`Анализ перспективы - это инструмент, при помощи которого вы можете получить от языковой модели подробный анализ публикации с той или иной точки зрения. На вход GPT подается выражение - запрос: <b>"Проведите подробный анализ данной новости с точки зрения ..."</b> <br> В меню <b>"Условие"</b> можно выбрать одну из общественных групп или задать свою.<br><br> После выбора нажмите <b>"Запуск"</b> и подождите, пока сформируется ответ (10-20 секунд).`)
            return {
                tab_info: tab_info,
                default_type_requests: {
                    analyze: 'Проведите подробный анализ данной новости',
                    reaction: 'Проанализируйте данную новость и сформируйте публичный комментарий для прессы по событию от лица',
                    generalization: 'Сформулируйте главную информацию новости в 3-4 предложения. Затем выделите основных действующих лиц, компании, службы',
                },
                request_type: 'analyze',
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
                answer_lang: {
                    ru: 'Russian',
                    en: 'English',
                    kz: 'Kazakh',
                },
                additional_info: '',
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
				search_tags,
				getLang,
            }
        },
        computed: {
            gpt_request_text() {
                return `${this.i18n(this.default_type_requests[this.request_type])} ${this.input == '' ? this.i18n(this.condition ?? '') : this.input}`
            },
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
            each_replace_all(text, slice_text = true) {
                text = text.trim();
                if (!text) return text;

                this.search_tags.forEach(tag => {
                    text = text?.replaceAll(new RegExp(tag, 'g'), (temp) => temp ? `<span class="imas-tag">${temp}</span>` : '')
                })

                let tagIndex = text.indexOf('<span class="imas-tag">')

                if (tagIndex != -1 && slice_text) {
                    let start = tagIndex - 250;
                    let end = tagIndex + 350;
                    if (start < 0) {
                        start = 0;
                        end = 600
                    }
                    else if (end > text.length && start + 190 > text.length || end >= text.length) {
                        start = text.length - 600;
                    }
                    text = text.slice(start, end)
                }

                return text;
            },
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

                this.gpt_type = 'analyze';
            },
            toggle_prompt_list_modal() {
                this.used_prompt_list_modal = !this.used_prompt_list_modal;
                document.querySelector('#analyze-input')?.focus()
            },
            change_condition(statement) {
                this.select_options_modal = false;
                if (this.default_requests[statement]) {this.condition = this.default_requests[statement]} 
                this.gpt_type = 'analyze';
            },
            async push_news() {

                const temp_chatgpt_item = JSON.parse(JSON.stringify(this.chatgpt_item))

                if (this.input.length > 0) {
                    this.condition = this.input
                    console.log(this.input)
                }

                if (this.condition == "" && this.request_type != 'generalization') {
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

                const completion_messages = {
                    analyze: [
                        {'role': 'system', 'content': 'You are an assistant for the monitoring system. You must give your own analysis of the presented news. ' + `The response language must be in ${this.answer_lang[this.getLang()]}. You can also use the information: ${this.additional_info}`}, // you can also use this information
                        {'role': 'user', 'content': this.i18n('Проведите подробный анализ данной новости') + ' ' + temp_condition + `. The response language must be in ${this.answer_lang[this.getLang()]}` },
                        {'role': 'user', 'content': this.i18n('Представленная новость') + ': ' + temp}
                    ],
                    reaction: [
                        {'role': 'system', 'content': 'You are an assistant for the monitoring system. You must analyze the given news and issue an answer based on the given news according to the request. ' + `The response language must be in ${this.answer_lang[this.getLang()]}. You can also use the information: ${this.additional_info}` },
                        {'role': 'user', 'content': this.i18n('Проанализируйте данную новость и сформируйте публичный комментарий для прессы по событию от лица') + ' ' + temp_condition + `. The response language must be in ${this.answer_lang[this.getLang()]}` },
                        {'role': 'user', 'content': this.i18n('Представленная новость') + ': ' + temp}
                    ],
                    generalization: [
                        {'role': 'system', 'content': 'You are an assistant for the monitoring system. You must highlight the main thing from the provided news and state it in 3-4 sentences and highlight key persons, players, companies, etc. from the news. Output format - SUMMARY: , KEY_PERSONS_AND_COMPANYS: . ' + `The response language must be in ${this.answer_lang[this.getLang()]}. You can also use the information: ${this.additional_info}` },
                        {'role': 'user', 'content': this.i18n('Сформулируйте главную информацию новости в 3-4 предложения. Затем выделите основных действующих лиц, компании, службы' + `. The response language must be in ${this.answer_lang[this.getLang()]}`)},
                        {'role': 'user', 'content': this.i18n('Представляемая новость') + ': ' + temp}
                    ]
                };
                const type = {
                    analyze: 'analyze',
                    generalization: 'analyze',
                    reaction: 'reaction',
                }[this.request_type];

                axios.get(`/ru/gpt-service/get-log?news_id=${temp_chatgpt_item?.item_id}&news_type=${temp_r_type}&type=${type}&promt=${temp_condition}`)
                    .then(async (response) => {
                        console.log('gpt-service - response = ', response?.data);
                        if (response?.data == false) {
                            const completion = await openai.createChatCompletion({
                                model: "gpt-3.5-turbo",
                                messages: completion_messages[this.request_type],
                            });
                            console.log('completion', completion);
                            let temp_output = completion.data.choices[0].message.content

                            if (!temp_output) return

                            let formData = new FormData();

                            formData.append('news_id', temp_chatgpt_item?.item_id)
                            formData.append('news_type', temp_r_type)
                            formData.append('type', type)
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
                                    if (temp_chatgpt_item?.item_id == this.chatgpt_item?.item_id && [this.input, this.condition].includes(temp_condition)) {
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

                
        
                const temp_log_key = log_keys.find(prompt => ([...this.analyze_select, `${this.i18n("Обобщение")}`, `${this.i18n("от организации ... в позитивном ключе, объемом на английском языке.")}`].includes(prompt)))

                if (temp_log_key) {
                    this.condition = temp_log_key

                    if (temp_log_key == `${this.i18n("Обобщение")}`) this.request_type = 'generalization';
                    else if (temp_log_key == `${this.i18n("от организации ... в позитивном ключе, объемом на английском языке.")}`) this.request_type = 'reaction';
                }

                if (this.condition == '') {
                    const log_key = log_keys.find(prompt => (![...this.analyze_select, `${this.i18n("Обобщение")}`, `${this.i18n("от организации ... в позитивном ключе, объемом на английском языке.")}`].includes(prompt)))
                    if (log_key) this.input = log_key
                }
        
                this.output = this.chatgpt_item?.logs[this.input != '' ? this.input : this.condition]?.result
            },
        },
        watch: {
            chatgpt_item(newValue) {
                if (newValue != null && this.chatgpt_tab == 'TextAnalyze') {
                    this.updateOutput()
                    const local_prompts = [...this.analyze_select, `${this.i18n("Обобщение")}`, `${this.i18n("от организации ... в позитивном ключе, объемом на английском языке.")}`];
                    this.analyze_used_prompt_list = Object.values(this.chatgpt_item?.logs).filter(log => (
                        !local_prompts.includes(log?.promt) && log?.type == 'analyze'
                    )).map(log => log?.promt)
                }
                else if (newValue == null) this.output = '';
            },
            chatgpt_tab(newValue) {
                
                this.input = ''

                if (newValue == 'TextAnalyze' && this.chatgpt_item != null) {
                    this.used_prompt_list = Object.values(this.chatgpt_item?.logs).filter(log => (
                        ![...this.analyze_select, `${this.i18n("Обобщение")}`, `${this.i18n("от организации ... в позитивном ключе, объемом на английском языке.")}`].includes(log?.promt)
                    )).map(log => log?.promt)

                    if (
                        [...this.analyze_select, `${this.i18n("Обобщение")}`, `${this.i18n("от организации ... в позитивном ключе, объемом на английском языке.")}`].includes(this.chatgpt_log?.promt)
                    ) {
                        this.input = ''
                        this.condition = this.chatgpt_log?.promt
                    }
                    else {
                        this.condition = undefined
                        this.input = this.chatgpt_log?.promt
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

                this.gpt_type = 'analyze';
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
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif ;
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

.right-modal-menu {
    padding: 14px 13px;
    position: absolute;
    left: calc(100% - 1px);
    top: 48.42px;
    /* width: 265px; */
    width: 220px;
    bottom: -48.4px;
    background: #fff;
    overflow: hidden;
    border-radius: 0 4px 4px 0;
}

.information-btn {
    font-size: 13px;
    color: #1c84c6;
    position: absolute;
    right: 0px;
    top: -5px;
    padding: 0.875rem 1.75rem;
    border: 1px solid #1c84c6;
    border-radius: 0.4em;
    transition: .15s;
}
.information-btn:hover {
    background: #1c84c6;
    color: white;
}

.full-item-text *:has( > img) {
    max-width: 100% !important;
}

.full-item-text * > img {
    height: auto !important;
}

</style>