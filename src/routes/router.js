//apps
import Chat from '../views/chat/chat';
import Pages from '../views/dashboards/pages';
import Profile from "../views/profile/profile";
import Login from "../views/authentication/login";
import Register from '../views/authentication/register';

var ThemeRoutes = [
	{ path:	'/login', name:'Login', icon:'',component:Login},
	{ path: '/pages', name: 'Pages', icon: 'mdi mdi-comment-processing-outline', component: Pages },	
	{ path: '/chat', name: 'Chat', icon: 'mdi mdi-comment-processing-outline', component: Chat },
	{ path:	'/profile', name:'Profile', icon:'',component:Profile},
	{ path: '/register', name: 'Register with Firebase', icon: 'mdi mdi-account-plus', component: Register },
	{ path: '/', pathTo: '/pages', name: 'Dashboard', redirect: true },
];
export default ThemeRoutes;
