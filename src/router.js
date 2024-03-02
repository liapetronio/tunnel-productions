import Vue from 'vue';
import VueRouter from 'vue-router';
import HomePage from '@/pages/HomePage';
import MinecraftPage from '@/pages/MinecraftPage';



Vue.use(VueRouter);

const router = new VueRouter({
    base: process.env.BASE_URL,
    routes: [
        {
            path: '/',
            name: 'HomePage',
            component: HomePage
        },
        {
            path: '/minecraft',
            name: 'MinecraftPage',
            component: MinecraftPage
        }

    ]
});



export default router

