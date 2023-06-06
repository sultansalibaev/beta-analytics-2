<template>
    <div class="container main-block p-0">
        <!-- <div class="col-3" style="max-width: 250px;min-width: 250px;overflow-y: scroll;max-height: 60vh;display: none;">
            <ul v-for="(item, index) in news" class="list-group" style="margin-bottom: 7px;">
                <li class="list-group-item" style="padding: 7px 11px;">{{ index }} -  {{ item.substring(0, 20) }}</li>
            </ul>
        </div> -->
        <div class="row w-full m-0">
            <div class="col-12">
                
                <div class="mb-3">
                    <!-- <span class="badge text-bg-success">Обобщение</span> -->
                    <!-- <div class="spinner-border text-success" role="status" id="load-circle">
                        <span class="visually-hidden">Loading...</span>
                    </div> -->
                    <div style="display: inline-block">Что передается в ChatGPT: <i>Предоставь мне главное из новости в 3-4 предложениях и выдели ключевые лица, игроков, компании и т.д. в новости</i></div>
                    <div for="textarea_home" class="form-label" style="margin: 12px 0;">Ввод:</div>
                    <textarea class="form-control" id="textarea_home" rows="10" :value="chatgpt_item?.text.maxLength(4_000)" disabled></textarea>
                    <!-- <div>
                        <button type="button" class="f-z-16 btn btn-success btn-control" @click="add_text">Добавить новость</button>
                        <button type="button" class="f-z-16 btn btn-success btn-control" style="margin-left: 10px;" @click="clear">Очистить</button>
                    </div> -->
                </div>
                <div class="mb-3">
                    <label for="home_textarea2" class="form-label" style="margin: 7px 0 12px;">Вывод: 
                        <span class="chatgpt-error" v-show="chatgpt_error">Ошибка со стороны сервера ChatGPT! &nbsp;&nbsp; (попробуйте позже)</span>
                    </label>
                    <textarea class="form-control" id="home_textarea2" rows="10" :value="output" disabled></textarea>
                    <div :style="chatgpt_item?.logs['Обобщение']?.result ? 'display:none;' : ''">
                        <button type="button" class="f-z-16 btn btn-success btn-control" :disabled="load_circle || chatgpt_item?.logs['Обобщение']?.result" @click="prepare_data">
                            Запуск
                            <i id="load-circle"
                            v-show="load_circle"
                            class="fa-solid fa-spinner"></i>
                        </button>
                    </div>
                </div>
            </div>
            <button type="button" class="f-z-16 btn btn-info btn-help" data-bs-toggle="modal" data-bs-target="#exampleModal" @click="home_view_modal = true">
                Информация и пояснение
            </button>
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
                            <h1 class="modal-title fs-5" id="exampleModalLabel" style="font-size: 30px;">Обощение</h1>
                            <!-- <button type="button" class="f-z-16 btn-close" data-bs-dismiss="modal" aria-label="Close"></button> -->
                        </div>
                        <div class="modal-body" style="line-height: 1.42857143;">
                            Обобщение - это инструмент, при помощи которого вы можете выделить главное из своих новостей, а также вывести ключевые лица из текста(Если это возможно). На вход для языковой модели GPT подается специальное выражение-запрос: <b>"Предоставь мне главное из новости в 3-4 предложениях и выдели ключевые лица, игроков, компании и т.д. в новости"</b> которое применяется для каждой введенной новости. <br>
                            Список новостей можно наблюдать на панели слева.
                            <br><br>
                            Кнопка "Запуск" отправит ваши новости в GPT и сгенерирует ответ
                        </div>
                        <div class="modal-footer" style="height: auto;border-top: 1px solid #e5e5e5;">
                            <button style="background-color: buttonface;color: #333;" type="button" class="f-z-16 btn btn-secondary" data-bs-dismiss="modal" @click="home_view_modal = false">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    
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
            return {
                news: [],
                home_view_modal: false,
                output: '',
            }
        },
        setup() {
            return {
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
                    this.chatgpt_item?.logs["Обобщение"] == 'loading'
                )
            },
        },
        methods: {
            updateOutput() {
                if (this.chatgpt_item?.logs && this.chatgpt_item?.logs["Обобщение"]?.type == 'analyze') {
                    this.output = this.chatgpt_item?.logs["Обобщение"]?.result ?? ''
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

                this.chatgpt_item.logs["Обобщение"] = 'loading'

                const temp_chatgpt_item = JSON.parse(JSON.stringify(this.chatgpt_item))

                prepared_data = "\n"

                this.chatgpt_error = false;

                axios.get(`/ru/gpt-service/get-log?news_id=${temp_chatgpt_item?.item_id}&news_type=${this.r_type}&type=analyze&promt=Обобщение`)
                    .then(async (response) => {
                        console.log('gpt-service - response = ', response?.data);
                        if (response?.data == false) {

                            const completion = await openai.createChatCompletion({
                                model: "gpt-3.5-turbo",
                                messages: [
                                    {'role': 'system', 'content': 'You are an assistant for the monitoring system. You must highlight the main thing from the provided news and state it in 3-4 sentences and highlight key persons, players, companies, etc. from the news. Output format - SUMMARY: , KEY_PERSONS_AND_COMPANYS: . Output make on russion language'},
                                    {'role': 'user', 'content': 'Предоставь мне главное из новости в 3-4 предложениях и выдели ключевые лица, игроков, компании и т.д. из новости'},
                                    {'role': 'user', 'content': 'Представляемая новость: ' + temp_chatgpt_item?.text.maxLength(4_000)}
                                ],
                            });
                            console.log(completion.data.choices[0].message.content)
                            prepared_data = prepared_data + "\n\n" + completion.data.choices[0].message.content + "\n\n================================"

                            let temp_output = prepared_data

                            if (!temp_output) return

                            let formData = new FormData();

                            formData.append('news_id', temp_chatgpt_item?.item_id)

                            formData.append('news_type', this.r_type)

                            formData.append('type', 'analyze')

                            formData.append('promt', 'Обобщение')

                            formData.append('result', temp_output)


                            console.log({
                                'news_id': temp_chatgpt_item?.item_id, 
                                'news_type': this.r_type, 
                                'type': 'analyze', 
                                'promt': 'Обобщение', 
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
    font-family: 'Roboto';
    line-height: 1.7 !important;
    font-size: 13.5px !important;
}
</style>