<template>
    
    <div @click.stop="used_prompt_list_modal = false;">
        <div class="relative">
            
            <textarea class="form-control" id="textarea_analyze" style="display:none;" rows="10" :value="chatgpt_item?.text.maxLength(4_000)" disabled></textarea>
    
            <!-- <div style="font-size: 18px;font-weight: 500;">Условие</div>
            <div style="color: #A8A8A8;font-size: 13px;margin: 8px 0 12px 0;">Выберите подходящую точку зрения:</div> -->
            <div style="color: #A8A8A8;font-size: 13px;margin: 8px 0 12px 0;">{{ i18n('От чьего лица вы ожидаете ответ') }}:</div>
            <div class="inline-flex relative" style="margin-bottom:8px;">
                <div
                    @click.stop="toggle_prompt_list_modal()" 
                    class="inline-flex text-white justify-between items-center cursor-pointer select-title"
                    style="background: white;border: 1px solid #3b5998;padding: 0;overflow: hidden;color: #858585;width: 350px;"
                >
                    <input
                        type="text"
                        class="focus:outline-none"
                        style="height: 100%;width: 100%;padding: 0 8px 2px;"
                        :placeholder="i18n('Напиши ответ от лица правительства')"
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
                        >{{ i18n('Список пустой') }}</div>
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
            <!-- <span v-show="input == ''" style="margin-left: 5px;color: red;font-size:13px;white-space: nowrap;">{{ i18n('От чьего лица вы ожидаете ответ?') }}</span> -->
            
            <div style="color: #A8A8A8;font-size: 13px;margin: 8px 0 12px 0;">{{ i18n('Что передается в ChatGPT') }}:</div>
            <div style="font-size: 15px;margin-bottom: 12px;">{{ i18n('Проанализируй данную новость и сформируй ответ на ее основе') }} {{ (input + '').trim() }}</div>
    
            <pre style="margin-bottom: 12px;font-family: Roboto;line-height: 1.7!important;font-size: 13.5px!important;white-space: pre-wrap;" v-show="output">{{ output }}</pre>
    
            <div class="flex items-center justify-between" style="height: 27px;">
                <button
                    style="background: #3b5998;height: 27px;padding: 0 8px 2px;border-radius: 4px;font-size: 13px;color: white;"
                    @click="push_news"
                    :disabled="load_circle_analyze || chatgpt_item?.logs[input]?.result"
                    v-show="!chatgpt_item?.logs[input]?.result"
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
                    style="font-size: 13px;color: #2F82FF;text-decoration: underline;position: absolute;right: 0;top: -2px
                    ;"
                >{{ i18n('Информация и пояснение') }}</button>
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
                        <h1 class="modal-title fs-5" id="exampleModalLabel" style="font-size: 30px;">Ответ</h1>
                        <!-- <button type="button" class="f-z-16 btn-close" data-bs-dismiss="modal" aria-label="Close"></button> -->
                    </div>
                    <div class="modal-body" style="line-height: 1.42857143;">
                        Ответ - это инструмент, при помощи которого Вы можете получить ответ на новость от Исcкусственного Интелекта от любого лица. На вход подается выражение - запрос: <b>"Проанализируй данную новость и сформируй ответ на ее основе + От чьего лица вы ожидаете ответ"</b> В поля для ввода запроса можно написать От чьего лица вы ожидаете (ответ / реакцию).
                    </div>
                    <div class="modal-footer" style="height: auto;border-top: 1px solid #e5e5e5;">
                        <button style="background-color: buttonface;color: #333;" type="button" class="f-z-16 btn btn-secondary" data-bs-dismiss="modal" @click="text_analyze_modal = false">Close</button>
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
    export default{
        data() {
            return {
                input: "",
                output: "",
                text_analyze_modal: false,
                used_prompt_list_modal: false,
                used_prompt_list: [],
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
                return this.chatgpt_item?.logs && this.input && this.chatgpt_item?.logs[this.input] == 'loading'
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
            toggle_prompt_list_modal() {
                this.used_prompt_list_modal = !this.used_prompt_list_modal;
                document.querySelector('#reaction-input')?.focus()
            },
            clear() {
                const textArea = document.getElementById("textarea_analyze")
                textArea.value = ""
            },
            async push_news() {

                const temp_chatgpt_item = JSON.parse(JSON.stringify(this.chatgpt_item))
                const temp_promt = this.input;
                const temp_r_type = this.r_type;

                const textArea = document.getElementById("textarea_analyze")
                let temp = textArea.value

                if (temp == "") {
                    alert("Внимание! Вы не ввели текст!")
                    return 0
                }

                if (temp_promt.length == 0) return;

                this.chatgpt_item.logs[temp_promt] = 'loading'

				this.chatgpt_error = false;

                axios.get(`/ru/gpt-service/get-log?news_id=${temp_chatgpt_item?.item_id}&news_type=${temp_r_type}&type=reaction&promt=${temp_promt}`)
                    .then(async (response) => {
                        console.log('gpt-service - response = ', response?.data);
                        if (response?.data == false) {
                            const completion = await openai.createChatCompletion({
                                model: "gpt-3.5-turbo",
                                messages: [
                                    {'role': 'system', 'content': 'You are an assistant for the monitoring system. You must analyze the given news and issue an answer based on the given news according to the request'},
                                    {'role': 'user', 'content': this.i18n('Проанализируй данную новость и сформируй ответ на ее основе') + ' ' + temp_promt},
                                    {'role': 'user', 'content': this.i18n('Представленная новость') + ': ' + temp}
                                ],
                            });
                            console.log('completion', completion);
                            let temp_output = completion.data.choices[0].message.content

                            if (!temp_output) return

                            let formData = new FormData();

                            formData.append('news_id', temp_chatgpt_item?.item_id)
                            formData.append('news_type', temp_r_type)
                            formData.append('type', 'reaction')
                            formData.append('promt', temp_promt)
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
                if (!Object.keys(this.chatgpt_item?.logs).length) {
                    this.input = ''
                    this.output = ''
                    return;
                }
                const log_keys = Object.keys(this.chatgpt_item?.logs);

                if (log_keys.length == 0) return;
        
                const log_key = log_keys.find(prompt => this.chatgpt_item?.logs[prompt]?.type == 'reaction')
                if (log_key) this.input = log_key
        
                this.output = this.chatgpt_item?.logs[this.input]?.result
            },
        },
        watch: {
            chatgpt_item(newValue) {
                if (newValue != null && this.chatgpt_tab == 'TextReaction') {
                    this.used_prompt_list = Object.values(this.chatgpt_item?.logs).filter(log => log?.type == 'reaction').map(log => log?.prompt)
                    this.updateOutput()
                }
                else if (newValue == null) this.output = '';
            },
            chatgpt_tab(newValue) {
                if (newValue == 'TextReaction' && this.chatgpt_item != null) {
                    this.used_prompt_list = Object.values(this.chatgpt_item?.logs).filter(log => log?.type == 'reaction').map(log => log?.promt)
                    if (this.chatgpt_log != null && this.chatgpt_log?.type == 'reaction') {
                        this.input = this.chatgpt_log?.promt
                        // this.output = this.chatgpt_log?.result
                        return;
                    }
                    this.updateOutput()
                }
            },
            input(newValue) {
                const log_keys = Object.keys(this.chatgpt_item?.logs);
                if (log_keys.length == 0) return;
                let temp_result = this.chatgpt_item?.logs[newValue]?.result;
                this.output = temp_result || ''
            },
        }
    }
</script>

<style>
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
    background-color: #5cb85c !important;
    border-color: #4cae4c !important;
}
.btn-success:hover {
    color: #fff !important;
    background-color: #449d44 !important;
    border-color: #398439 !important;
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
.select-input-error {
    border-color: red !important;
}
</style>