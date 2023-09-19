<template>
    
    <div>
        <div class="relative">
            
            <textarea class="form-control" id="textarea_analyze" style="display:none;" rows="10" :value="chatgpt_item?.text.maxLength(4_000)" disabled></textarea>
            
            <div style="font-size: 18px;font-weight: 500;">{{ i18n('Обзор публикации') }}</div>
            <div style="color: #A8A8A8;font-size: 13px;margin: 8px 0 12px 0;">{{ i18n('Что передается в ChatGPT') }}:</div>
            <div style="font-size: 15px;margin-bottom: 12px;line-height: 1.2">{{ i18n('Сформулируйте главную информацию новости в 3-4 предложения. Затем выделите основных действующих лиц, компании, службы') }}</div>
    
            <pre style="margin-bottom: 12px;line-height: 1.7!important;font-size: 13.5px!important;white-space: pre-wrap;" v-show="output">{{ output }}</pre>
    
            <div class="flex items-center justify-between" style="height: 27px;">
                <button
                    style="background: #3b5998;height: 27px;padding: 0 8px 2px;border-radius: 4px;font-size: 13px;color: white;"
                    @click="prepare_data"
                    :disabled="load_circle || chatgpt_item?.logs[i18n('Обобщение')]?.result"
                    v-show="!chatgpt_item?.logs[i18n('Обобщение')]?.result"
                >
                    {{ i18n('Запуск') }}
                    <i id="load-circle-analyze" v-show="load_circle" class="fa-solid fa-spinner"></i>
                </button>
                <button
                    type="button"
                    data-bs-toggle="modal"
                    data-bs-target="#exampleModal"
                    @click="home_view_modal = true"
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
            :style="home_view_modal ? 'opacity: 1;overflow: visible;display: block;background-color: #0000006b;' : 'pointer-events: none;'"
            @click="home_view_modal = false">
            <div class="modal-dialog" style="transition: 0.15s;" :style="home_view_modal?'top: 25%;':'top: 0px;'" @click.stop>
                <div class="modal-content">
                    <div class="modal-header">
                        <h1 class="modal-title fs-5" id="exampleModalLabel" style="font-size: 30px;">{{ i18n('Обобщение') }}</h1>
                        <!-- <button type="button" class="f-z-16 btn-close" data-bs-dismiss="modal" aria-label="Close"></button> -->
                    </div>
                    <div class="modal-body" style="line-height: 1.42857143;" v-html="tab_info"></div>
                    <div class="modal-footer" style="height: auto;border-top: 1px solid #e5e5e5;">
                        <button style="background-color: buttonface;color: #333;" type="button" class="f-z-16 btn btn-secondary" data-bs-dismiss="modal" @click="home_view_modal = false">{{ i18n('Закрыть') }}</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import i18n from "@/response/utils/i18n"
    
    import { Configuration, OpenAIApi } from "openai"
    import { chatgpt_item, chatgpt_tab } from '@/response/data/index'
    import { getGptLogs } from '@/response/api'
	import { r_type } from '@/response/header'
    import axios from 'axios'
    const configuration = new Configuration({
        apiKey: "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",
    });
    let prepared_data = ""
    const openai = new OpenAIApi(configuration);

    export default{
        data() {
            const tab_info = this.i18n(`Обобщение - это инструмент, при помощи которого вы можете обобщить новость, а также выделить ключевых акторов. <br> На вход языковой модели подается текст публикации и выражение-запрос: <b>"Сформулируйте главную информацию новости в 3-4 предложения. Затем выделите основных действующих лиц, компании, службы"</b>. <br><br> Кнопка <b>"Запуск"</b> отправит запрос в GPT. Ответ станет доступен через 10-20 секунд.`);
            return {
                tab_info: tab_info,
                news: [],
                home_view_modal: false,
                output: '',
            }
        },
        setup() {
            return {
                i18n,
                getGptLogs,
                chatgpt_item,
                chatgpt_tab,
				r_type,
            }
        },
        watch: {
            chatgpt_item(newValue) {
                if (newValue != null && chatgpt_tab == 'VGeneralization') this.updateOutput()
                else if (newValue == null) this.output = '';
            },
            chatgpt_tab(newValue) {
                if (newValue == 'VGeneralization' && chatgpt_item != null) this.updateOutput()
            },
        },
        computed: {
            load_circle() {
                return (
                    this.chatgpt_item?.logs &&
                    this.chatgpt_item?.logs[this.i18n("Обобщение")] == 'loading'
                )
            },
        },
        methods: {
            updateOutput() {
                if (this.chatgpt_item?.logs && this.chatgpt_item?.logs[this.i18n("Обобщение")]?.type == 'analyze') {
                    this.output = this.chatgpt_item?.logs[this.i18n("Обобщение")]?.result ?? ''
                }
                else {
                    this.output = ''
                }
            },
            clear() {
                const textArea = document.getElementById("textarea_home")
                textArea.value = ""
                // this.news = []
            },
            // add_text() {
            //     const textArea = document.getElementById("textarea_home")
            //     let temp = textArea.value
            //     if (temp == "") {
            //         alert("Внимание! Вы не ввели текст!")
            //         return 0
            //     }
            //     this.news.push(temp)
            //     textArea.value = ""
            // },
            async prepare_data() {
                if (!this.chatgpt_item?.text.maxLength(4_000)) {
                    // alert("Внимание! Вы не добавили новости!")
                    alert("Внимание! Текст новости пустой!")
                    return 0
                }

                this.chatgpt_item.logs[this.i18n("Обобщение")] = 'loading'

                const temp_chatgpt_item = JSON.parse(JSON.stringify(this.chatgpt_item))

                prepared_data = ""

                this.chatgpt_error = false;

                axios.get(`/ru/gpt-service/get-log?news_id=${temp_chatgpt_item?.item_id}&news_type=${this.r_type}&type=analyze&promt=${this.i18n('Обобщение')}`)
                    .then(async (response) => {
                        console.log('gpt-service - response = ', response?.data);
                        if (response?.data == false) {

                            const completion = await openai.createChatCompletion({
                                model: "gpt-3.5-turbo",
                                messages: [
                                    {'role': 'system', 'content': 'You are an assistant for the monitoring system. You must highlight the main thing from the provided news and state it in 3-4 sentences and highlight key persons, players, companies, etc. from the news. Output format - SUMMARY: , KEY_PERSONS_AND_COMPANYS: .'},
                                    {'role': 'user', 'content': this.i18n('Сформулируйте главную информацию новости в 3-4 предложения. Затем выделите основных действующих лиц, компании, службы')},
                                    {'role': 'user', 'content': this.i18n('Представляемая новость') + ': ' + temp_chatgpt_item?.text.maxLength(4_000)}
                                ],
                            });
                            console.log(completion.data.choices[0].message.content)
                            prepared_data = completion.data.choices[0].message.content

                            let temp_output = prepared_data

                            if (!temp_output) return

                            let formData = new FormData();

                            formData.append('news_id', temp_chatgpt_item?.item_id)

                            formData.append('news_type', this.r_type)

                            formData.append('type', 'analyze')

                            formData.append('promt', this.i18n('Обобщение'))

                            formData.append('result', temp_output)


                            console.log({
                                'news_id': temp_chatgpt_item?.item_id, 
                                'news_type': this.r_type, 
                                'type': 'analyze', 
                                'promt': this.i18n('Обобщение'), 
                                'result': temp_output, 
                            });

                            axios.post(`/ru/gpt-service/create-log`, formData)
                                .then((response) => {
                                    console.log('gpt-service - create-log response = ', response);
                                    if (response?.data == 1 && temp_chatgpt_item?.logs !== null) {
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
            }
        },
    }
</script>

<style>
.btn-help {
    margin: 0 auto;
    margin-top: 30px;
}
#load-circle {
    /* display: none; */
    margin-left: 2px;
}
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
.btn-info {
    background-color: #23c6c8 !important;
    border-color: #23c6c8 !important;
    color: #FFFFFF !important;
}
.btn-info:hover, .btn-info:focus, .btn-info:active, .btn-info.active, .open .dropdown-toggle.btn-info, .btn-info:active:focus, .btn-info:active:hover, .btn-info.active:hover, .btn-info.active:focus {
    background-color: #21b9bb !important;
    border-color: #21b9bb !important;
    color: #FFFFFF !important;
}

.chatgpt-error {
    color: red;
    font-weight: 300;
    font-size: 14px;
    margin-left: 8px;
}
textarea.form-control {
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif ;
    line-height: 1.7 !important;
    font-size: 13.5px !important;
}
</style>