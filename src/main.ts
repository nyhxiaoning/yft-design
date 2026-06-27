import { createApp } from "vue"
import { createPinia } from "pinia"
import App from "./App.vue"
import router from './router'; 
import { setupI18n } from '@/plugins/i18n'

import "@/extension/index"
import 'element-plus/dist/index.css'
import "@icon-park/vue-next/styles/index.css"
import "@/assets/style/global.scss"
import "@/assets/style/font.scss"
import "@/assets/style/element-plus.scss"
import "@/assets/style/tailwindcss.scss"

import SvgIcon from "@/icons"
import Icon from "@/plugins/icon"
import Component from "@/plugins/component"
import Directive from "@/plugins/directive"

import "virtual:svg-icons-register"

async function start() {
    try {
        const app = createApp(App);
        await setupI18n(app)
        app.use(router);
        app.use(createPinia());
        app.use(Icon);
        app.use(SvgIcon);
        app.use(Component);
        app.use(Directive);
        app.mount("#app");
        console.log('[yft] App mounted successfully')
    } catch (err) {
        console.error('[yft] App mount failed:', err)
        document.querySelector('.first-screen-loading-text')!.textContent =
            '加载失败: ' + (err as Error).message
    }
}

start()
