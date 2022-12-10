import Vue from 'vue';
import VueRouter from 'vue-router';
import HomePage from '@/pages/HomePage';
// import ProjectsPage from '@/pages/ProjectsPage';


Vue.use(VueRouter);

const router = new VueRouter({
    base: process.env.BASE_URL,
    routes: [
        {
            path: '/',
            name: 'HomePage',
            component: HomePage
        }
        // {
        //     path: '/',
        //     name: 'ProjectsPage',
        //     component: ProjectsPage
        // }
    ]
});



export default router

