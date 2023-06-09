<template>
    <div class="container main-block" @click.stop="dropdown_menu = false;used_prompt_list_modal = false;">
        <div class="row">
            <div class="col-12">
                <div class="mb-3">
                    <!-- <span class="badge text-bg-success">Анализ новости</span> -->
                    <div class="dropdown dropdown_inline" style="display: flex;">
                        <button class="f-z-16 btn btn-success dropdown-toggle" type="button" :style="input != '' ? 'background: #ccc !important;border: 1px solid #ccc !important;pointer-events: none;' : ''" data-bs-toggle="dropdown" aria-expanded="false" @click.stop="dropdown_menu = !dropdown_menu">
                            Условие
                        </button>
                        <ul class="dropdown-menu" :class="{
                            show: dropdown_menu
                        }">
                            <li @click="dropdown_menu=false;change_condition('бизнес')">
                                <button class="dropdown-item">Бизнес</button>
                            </li>
                            <li @click="dropdown_menu=false;change_condition('государство')">
                                <button class="dropdown-item">Государство</button>
                            </li>
                            <li @click="dropdown_menu=false;change_condition('сил.структуры')">
                                <button class="dropdown-item">Сил.Структуры</button>
                            </li>
                            <li @click="dropdown_menu=false;change_condition('разные т.з.')">
                                <button class="dropdown-item">Разные т.з.</button>
                            </li>
                        </ul>

                        <div class="w-full relative" style="max-width: 400px;margin-left: 10px;">
                            <input
                                class="form-control"
                                id="analyze-input"
                                type="text"
                                style="height: 35px !important;border-radius: 3px;max-width: 400px;font-size: 15px !important;"
                                placeholder="Введите своё условие (...?)"
                                v-model="input"
                                @click.stop="used_prompt_list_modal = true"/>
                            <i
                                class="fa-solid fa-angle-down input-angle-down"
                                :class="{
                                    'rotate-x-180': used_prompt_list_modal
                                }"
                                @click.stop="toggle_prompt_list_modal()"
                            ></i>
                            <div class="flex flex-col used-prompt-list scrollbar" v-show="used_prompt_list_modal">
                                <span
                                    class="used-prompt empty-list_item"
                                    v-if="sorted_used_prompt_list.length == 0"
                                >Список пустой</span>
                                <span
                                    class="used-prompt"
                                    v-else
                                    v-for="used_prompt in sorted_used_prompt_list"
                                    :key="used_prompt"
                                    :title="used_prompt"
                                    @click="select_analyzed_prompt(used_prompt)"
                                >{{ used_prompt }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="cond" style="margin-top: 10px;">Что передается в ChatGPT: <i>Предоставь мне подробный анализ данной новости {{ input == '' ? condition : input }}</i></div>
                    <!-- <div class="spinner-border text-success" role="status" id="load-circle-analyze">
                        <span class="visually-hidden">Loading...</span>
                    </div> -->
                    <div for="textarea_analyze" class="form-label" style="margin: 12px 0;display:none;">Ввод:</div>
                    <textarea class="form-control" id="textarea_analyze" style="display:none;" rows="10" :value="chatgpt_item?.text.maxLength(4_000)" disabled></textarea>
                    <!-- <div>
                        <button
                            type="button"
                            class="f-z-16 btn btn-success btn-control"
                            :style="input != '' ? 'background: #ccc;border:1px solid #ccc;pointer-events:none' : ''"
                            @click="push_news">Запуск</button>
                        <button type="button" class="f-z-16 btn btn-success btn-control" style="margin-left: 10px;" @click="clear">Очистить</button>
                    </div> -->
                </div>
                <div class="mb-3">
                    <label for="textarea2" class="form-label" style="margin: 7px 0 12px;display:none;">Вывод:
                        <span class="chatgpt-error" v-show="chatgpt_error">Ошибка со стороны сервера ChatGPT! &nbsp;&nbsp; (попробуйте позже)</span>
                    </label>
                    <textarea class="form-control" style="margin-top: 20px;border-radius: 5px;" id="textarea2" rows="10" :value="output" disabled></textarea>

                    <div class="flex" :style="chatgpt_item?.logs[input != '' ? input : condition]?.result ? 'display:none;' : ''">
                        <button
                            type="button"
                            class="f-z-16 btn btn-success btn-control"
                            @click="push_news"
                            :disabled="load_circle_analyze || chatgpt_item?.logs[input != '' ? input : condition]?.result">
                            Запуск
                            <i id="load-circle-analyze" v-show="load_circle_analyze" class="fa-solid fa-spinner"></i>
                        </button>
                        <button type="button" style="margin: 20px 0 0 auto !important;" class="f-z-16 btn btn-info btn-help" data-bs-toggle="modal" data-bs-target="#exampleModal" @click="text_analyze_modal = true">
                            Информация и пояснение
                        </button>
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
                                <h1 class="modal-title fs-5" id="exampleModalLabel" style="font-size: 30px;">Анализ новости</h1>
                                <!-- <button type="button" class="f-z-16 btn-close" data-bs-dismiss="modal" aria-label="Close"></button> -->
                            </div>
                            <div class="modal-body" style="line-height: 1.42857143;">
                                Анализ новости - это инструмент, при помощи которого Вы можете получить подробный анализ новости от Исcкусственного Интелекта с той или иной точки зрения. На вход подается выражение - запрос: <b>"Предоставь мне подробный анализ данной новости + точка зрения"</b> Во вкладке <b>"Условие"</b> можно выбрать точку зрения.
                                <br><br>
                                "Бизнес" - с точки зрения бизнеса.<br>
                                "Государство" - с точки зрения государства.<br>
                                "Сил.Структуры" - с точки зрения силовых структур<br>
                                "Разные т.з." - с разных точек зрения
                            </div>
                            <div class="modal-footer" style="height: auto;border-top: 1px solid #e5e5e5;">
                                <button style="background-color: buttonface;color: #333;" type="button" class="f-z-16 btn btn-secondary" data-bs-dismiss="modal" @click="text_analyze_modal = false">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
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
            return {
                condition: "",
                input: "",
                output: "",
                text_analyze_modal: false,
                dropdown_menu: false,
                used_prompt_list_modal: false,
                used_prompt_list: [],
                analyze_select: [
                    "С точки зрения бизнеса",
                    "С точки зрения государства",
                    "С точки зрения силовых структур",
                    "C разных точек зрения"
                ],
            }
        },
        setup() {
            return {
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

                if (
                    used_prompt == "С точки зрения бизнеса" ||
                    used_prompt == "С точки зрения государства" ||
                    used_prompt == "С точки зрения силовых структур" ||
                    used_prompt == "C разных точек зрения"
                ) {
                    this.input = ''
                    this.condition = used_prompt
                }
                else {
                    this.condition = ''
                    this.input = used_prompt
                }
                this.used_prompt_list_modal = false;
            },
            toggle_prompt_list_modal() {
                this.used_prompt_list_modal = !this.used_prompt_list_modal;
                document.querySelector('#analyze-input')?.focus()
            },
            clear() {
                const textArea = document.getElementById("textarea_analyze")
                textArea.value = ""
            },
            change_condition(statement) {
                if (statement == "бизнес") {this.condition = "С точки зрения бизнеса"} 
                if (statement == "государство") {this.condition = "С точки зрения государства"} 
                if (statement == "сил.структуры") {this.condition = "С точки зрения силовых структур"} 
                if (statement == "разные т.з.") {this.condition = "C разных точек зрения"} 

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
                                    {'role': 'user', 'content': 'Предоставь мне подробный анализ данной новости. ' + temp_condition},
                                    {'role': 'user', 'content': 'Представленная новость: ' + temp}
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
                // if (log_keys.length == 1 && log_keys[0] == "Обобщение") return;

                
        
                const temp_log_key = log_keys.find(prompt => (this.analyze_select.includes(prompt)) && prompt != 'Обобщение' && this.chatgpt_item?.logs[prompt]?.type == 'analyze')

                if (temp_log_key) {
                    this.condition = temp_log_key
                }

                if (this.condition == '') {
                    const log_key = log_keys.find(prompt => (!this.analyze_select.includes(prompt)) && prompt != 'Обобщение' && this.chatgpt_item?.logs[prompt]?.type == 'analyze')
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
                        log?.promt != 'Обобщение' &&
                        !this.analyze_select.includes(log?.promt)
                    )).map(log => log?.promt)
                }
                else if (newValue == null) this.output = '';
            },
            chatgpt_tab(newValue) {
                if (newValue == 'TextAnalyze' && this.chatgpt_item != null) {
                    this.used_prompt_list = Object.values(this.chatgpt_item?.logs).filter(log => (
                        log?.type == 'analyze' &&
                        log?.promt != 'Обобщение' &&
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
                            this.condition = ''
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
</style>